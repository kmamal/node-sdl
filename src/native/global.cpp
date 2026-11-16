#include "global.h"
#include "events.h"
#include "keyboard.h"
#include "audio.h"
#include "threads.h"
#include <SDL3/SDL.h>
#include <string>
#include <vector>
#include <atomic>
#include <condition_variable>

#if defined(SDL_PLATFORM_MACOS)
	#include "cocoa-global.h"
#endif


static std::atomic<SDL_ThreadID> main_thread_id { 0 };
static std::atomic<bool> ready { false };
static std::atomic<bool> started { false };

struct InitRequest {
	SDL_InitFlags flags;
	bool done = false;
	bool result = false;
	std::string error;
};

static std::mutex request_mutex;
static std::condition_variable request_cv;
static std::vector<InitRequest *> pending_requests;

// Recursive because watchEvents holds this lock while dispatching window events to JS, and the handlers re-enter it through the wrappers.
std::recursive_mutex &
global::lock()
{
	static std::recursive_mutex mutex;
	return mutex;
}

bool
global::isReady()
{
	return ready.load(std::memory_order_acquire);
}

bool
global::isMainThread()
{
	return ready.load(std::memory_order_acquire) && SDL_GetCurrentThreadID() == main_thread_id.load(std::memory_order_acquire);
}

void
global::assertReady(Napi::Env &env)
{
	if (ready.load(std::memory_order_acquire)) { return; }

	throw Napi::Error::New(env, started.load(std::memory_order_acquire)
		? "SDL has been shut down"
		: "@kmamal/sdl must be imported on the main thread before it can be used in a worker");
}

// Delivers window move/resize/expose events synchronously so handlers run during the OS's modal move/resize loop.
static bool SDLCALL
watchEvents (void *, SDL_Event *event)
{
	if (true
		&& SDL_GetCurrentThreadID() == main_thread_id.load(std::memory_order_acquire)
		&& (false
			|| event->type == SDL_EVENT_WINDOW_MOVED
			|| event->type == SDL_EVENT_WINDOW_RESIZED
			|| (event->type == SDL_EVENT_WINDOW_EXPOSED && event->window.data1 == 1)
		)
	) {
		// SDL runs watchers with its watcher-list mutex held, and a worker holding global::lock() may be inside an SDL call that pushes an event and so waits for that same mutex.
		// Waiting here would deadlock; try-lock instead and leave the event for the normal poll when a worker has the lock.
		std::unique_lock<std::recursive_mutex> guard(global::lock(), std::try_to_lock);
		if (!guard.owns_lock()) { return true; }
		events::dispatchEventFromWatch(*event);
	}
	return true;
}


static void
_start (Napi::Env &env)
{
	SDL_SetHint(SDL_HINT_FRAMEBUFFER_ACCELERATION, "0");
	SDL_SetHint(SDL_HINT_QUIT_ON_LAST_WINDOW_CLOSE, "0");

	if (!SDL_InitSubSystem(SDL_INIT_EVENTS)) {
		throw global::sdlError(env, "SDL_InitSubSystem", "SDL_INIT_EVENTS");
	}

	main_thread_id.store(SDL_GetCurrentThreadID(), std::memory_order_release);

	if (!SDL_AddEventWatch(watchEvents, nullptr)) {
		Napi::Error error = global::sdlError(env, "SDL_AddEventWatch");
		SDL_Quit();
		throw error;
	}

	keyboard::keys = SDL_GetKeyboardState(&keyboard::num_keys);

#if defined(SDL_PLATFORM_MACOS)
	reenableInertialScrolling();
#endif

	started.store(true, std::memory_order_release);
	ready.store(true, std::memory_order_release);
}


Napi::Value
global::initialize(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	bool is_main = info[0].As<Napi::Boolean>().Value();

	std::lock_guard<std::recursive_mutex> guard(global::lock());

	if (is_main && !ready.load(std::memory_order_acquire)) { _start(env); }

	int sdl_compile_version = SDL_VERSION;

	Napi::Object compile_version = Napi::Object::New(env);
	compile_version.Set("major", SDL_VERSIONNUM_MAJOR(sdl_compile_version));
	compile_version.Set("minor", SDL_VERSIONNUM_MINOR(sdl_compile_version));
	compile_version.Set("patch", SDL_VERSIONNUM_MICRO(sdl_compile_version));

	int sdl_runtime_version = SDL_GetVersion();

	Napi::Object runtime_version = Napi::Object::New(env);
	runtime_version.Set("major", SDL_VERSIONNUM_MAJOR(sdl_runtime_version));
	runtime_version.Set("minor", SDL_VERSIONNUM_MINOR(sdl_runtime_version));
	runtime_version.Set("patch", SDL_VERSIONNUM_MICRO(sdl_runtime_version));

	Napi::Object versions = Napi::Object::New(env);
	versions.Set("compile", compile_version);
	versions.Set("runtime", runtime_version);

	const char *platform_name = SDL_GetPlatform();
	Napi::Value platform;
	if (SDL_strncmp(platform_name, "Unknown", 7) == 0) {
		platform = env.Null();
	}
	else {
		platform = Napi::String::New(env, platform_name);
	}

	Napi::Object result = Napi::Object::New(env);
	result.Set("version", versions);
	result.Set("platform", platform);

	return result;
}


// Only the main thread must initializes SDL and polls for events.
// On macOS the Cocoa backend refuses any other thread.
static bool
_initSubsystem (SDL_InitFlags flags, std::string &error)
{
	if ((SDL_WasInit(flags) & flags) == flags) { return true; }

	bool success = SDL_InitSubSystem(flags);
	if (!success) { error = SDL_GetError(); }
	SDL_ClearError();
	return success;
}

static Napi::Value
_initResult (Napi::Env env, bool success, const std::string &error)
{
	if (success) { return Napi::Boolean::New(env, true); }
	return Napi::String::New(env, error);
}

static void
_failInitRequests ()
{
	std::lock_guard<std::mutex> guard(request_mutex);
	for (InitRequest *request : pending_requests) {
		request->done = true;
		request->result = false;
		request->error = "SDL has been shut down";
	}
	pending_requests.clear();
	request_cv.notify_all();
}

void
global::processInitRequests()
{
	std::vector<InitRequest *> batch;
	{
		std::lock_guard<std::mutex> guard(request_mutex);
		if (pending_requests.empty()) { return; }
		batch.swap(pending_requests);
	}

	{
		std::lock_guard<std::recursive_mutex> guard(global::lock());
		for (InitRequest *request : batch) {
			if (!ready.load(std::memory_order_acquire)) {
				request->result = false;
				request->error = "SDL has been shut down";
				continue;
			}
			request->result = _initSubsystem(request->flags, request->error);
		}
	}

	{
		std::lock_guard<std::mutex> guard(request_mutex);
		for (InitRequest *request : batch) { request->done = true; }
	}
	request_cv.notify_all();
}


Napi::Value
global::initSubsystem(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::string name = info[0].As<Napi::String>().Utf8Value();

	SDL_InitFlags flags;
	if (name == "video") { flags = SDL_INIT_VIDEO; }
	else if (name == "audio") { flags = SDL_INIT_AUDIO; }
	else if (name == "joystick") { flags = SDL_INIT_JOYSTICK; }
	else if (name == "gamepad") { flags = SDL_INIT_GAMEPAD; }
	else if (name == "sensor") { flags = SDL_INIT_SENSOR; }
	else {
		std::ostringstream message;
		message << "initSubsystem(" << name << ") error: invalid subsystem";
		throw Napi::Error::New(env, message.str());
	}

	if (global::isMainThread()) {
		std::lock_guard<std::recursive_mutex> guard(global::lock());
		global::assertReady(env);
		std::string error;
		bool success = _initSubsystem(flags, error);
		return _initResult(env, success, error);
	}

	InitRequest request = { flags, false, false, std::string() };
	{
		std::lock_guard<std::mutex> guard(request_mutex);
		global::assertReady(env);
		pending_requests.push_back(&request);
	}
	threads::wakeMain();

	{
		std::unique_lock<std::mutex> guard(request_mutex);
		request_cv.wait(guard, [&] { return request.done; });
	}

	return _initResult(env, request.result, request.error);
}


void
global::teardown()
{
	std::lock_guard<std::recursive_mutex> guard(global::lock());

	if (!ready.load(std::memory_order_acquire)) { return; }
	ready.store(false, std::memory_order_release);

	audio::closeAllStreams();
	threads::shutdown();
	_failInitRequests();
	SDL_Quit();
}

Napi::Value
global::cleanup(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	threads::leave(env);

	return env.Undefined();
}
