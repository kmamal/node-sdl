#include "threads.h"
#include "global.h"
#include "events.h"
#include <map>
#include <set>
#include <deque>
#include <mutex>
#include <atomic>


struct Thread {
	napi_threadsafe_function wake = nullptr;
	std::deque<threads::Event> queue;
	std::multiset<Uint32> opens[3];
	bool is_main = false;
	bool demand = false;
	bool wake_pending = false;
};

static std::mutex mutex;
static std::map<napi_env, Thread> all_threads;
static std::atomic<int> num_demanding { 0 };
static std::atomic<int> num_workers { 0 };


static void
_wake (Thread &thread)
{
	if (thread.wake_pending || thread.wake == nullptr) { return; }
	thread.wake_pending = true;
	if (napi_call_threadsafe_function(thread.wake, nullptr, napi_tsfn_nonblocking) != napi_ok) {
		thread.wake_pending = false;
	}
}

static bool
_wants (const Thread &thread, const threads::Event &event)
{
	if (thread.is_main) { return true; }

	const packed::Str *target = event.target;
	if (target == nullptr) { return true; }
	if (false
		|| target == &events::targets::JOYSTICK_DEVICE
		|| target == &events::targets::GAMEPAD_DEVICE
		|| target == &events::targets::AUDIO_DEVICE
	) { return true; }
	if (target == &events::targets::JOYSTICK || target == &events::targets::GAMEPAD) {
		return thread.opens[threads::JOYSTICK].count(event.target_id) > 0
			|| thread.opens[threads::GAMEPAD].count(event.target_id) > 0;
	}
	if (target == &events::targets::SENSOR) {
		return thread.opens[threads::SENSOR].count(event.target_id) > 0;
	}
	return false;
}

static void
_closeOpens (Thread &thread)
{
	for (Uint32 id : thread.opens[threads::JOYSTICK]) {
		SDL_Joystick *joystick = SDL_GetJoystickFromID(id);
		if (joystick != nullptr) { SDL_CloseJoystick(joystick); }
	}
	for (Uint32 id : thread.opens[threads::GAMEPAD]) {
		SDL_Gamepad *gamepad = SDL_GetGamepadFromID(id);
		if (gamepad != nullptr) { SDL_CloseGamepad(gamepad); }
	}
	for (Uint32 id : thread.opens[threads::SENSOR]) {
		SDL_Sensor *sensor = SDL_GetSensorFromID(id);
		if (sensor != nullptr) { SDL_CloseSensor(sensor); }
	}
	SDL_ClearError();
}

static void _envCleanup (void *arg);

static void
_leave (napi_env env, bool from_hook)
{
	Thread thread;
	{
		std::lock_guard<std::mutex> guard(global::lock());

		{
			std::lock_guard<std::mutex> registry_guard(mutex);
			auto it = all_threads.find(env);
			if (it == all_threads.end()) { return; }
			thread = std::move(it->second);
			all_threads.erase(it);
			if (thread.demand) { num_demanding.fetch_sub(1, std::memory_order_acq_rel); }
			if (!thread.is_main) { num_workers.fetch_sub(1, std::memory_order_acq_rel); }
		}

		if (global::isReady()) { _closeOpens(thread); }
	}

	if (thread.demand) { napi_unref_threadsafe_function(env, thread.wake); }
	napi_release_threadsafe_function(thread.wake, napi_tsfn_abort);
	if (!from_hook) { napi_remove_env_cleanup_hook(env, _envCleanup, (void *) env); }

	if (thread.is_main) { global::teardown(); }
}

static void
_envCleanup (void *arg)
{
	_leave((napi_env) arg, true);
}

void
threads::leave (napi_env env)
{
	_leave(env, false);
}

void
threads::trackOpen (Napi::Env &env, Kind kind, Uint32 id)
{
	std::lock_guard<std::mutex> guard(mutex);

	auto it = all_threads.find(env);
	if (it == all_threads.end()) { return; }

	it->second.opens[kind].insert(id);
}

void
threads::trackClose (Napi::Env &env, Kind kind, Uint32 id)
{
	std::lock_guard<std::mutex> guard(mutex);

	auto it = all_threads.find(env);
	if (it == all_threads.end()) { return; }

	auto &ids = it->second.opens[kind];
	auto entry = ids.find(id);
	if (entry != ids.end()) { ids.erase(entry); }
}

void
threads::distribute (const Event &event, napi_env except)
{
	std::lock_guard<std::mutex> guard(mutex);

	for (auto &entry : all_threads) {
		if (entry.first == except) { continue; }
		Thread &thread = entry.second;
		if (!_wants(thread, event)) { continue; }
		// Unbounded and uncoalesced on purpose: a blocked worker can't observe the queue anyway, and dropping or merging events would make poll() on a worker differ from the main thread.
		thread.queue.push_back(event);
		_wake(thread);
	}
}

void
threads::drain (Napi::Env &env, Napi::Function &callback)
{
	std::deque<Event> pending;
	{
		std::lock_guard<std::mutex> guard(mutex);
		auto it = all_threads.find(env);
		if (it == all_threads.end()) { return; }
		it->second.wake_pending = false;
		pending.swap(it->second.queue);
	}

	while (!pending.empty()) {
		Napi::HandleScope scope(env);
		Event event = std::move(pending.front());
		pending.pop_front();
		try {
			callback.Call(env.Global(), { event.value->toNapi(env) });
		}
		catch (...) {
			std::lock_guard<std::mutex> guard(mutex);
			auto it = all_threads.find(env);
			if (it != all_threads.end()) {
				auto &queue = it->second.queue;
				queue.insert(queue.begin(), pending.begin(), pending.end());
				if (!queue.empty()) { _wake(it->second); }
			}
			throw;
		}
	}
}

bool
threads::isPollingFast ()
{
	return num_demanding.load(std::memory_order_acquire) > 0
		|| num_workers.load(std::memory_order_acquire) > 0;
}

bool
threads::hasWorkers ()
{
	return num_workers.load(std::memory_order_acquire) > 0;
}

void
threads::wakeMain ()
{
	std::lock_guard<std::mutex> guard(mutex);

	for (auto &entry : all_threads) {
		if (entry.second.is_main) {
			_wake(entry.second);
			return;
		}
	}
}

void
threads::shutdown ()
{
	std::lock_guard<std::mutex> guard(mutex);

	for (auto &entry : all_threads) {
		napi_release_threadsafe_function(entry.second.wake, napi_tsfn_abort);
	}
	all_threads.clear();
	num_demanding.store(0, std::memory_order_release);
	num_workers.store(0, std::memory_order_release);
}

Napi::Value
threads::registerThread (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());

	Napi::Function poll = info[0].As<Napi::Function>();
	bool is_main = info[1].As<Napi::Boolean>().Value();

	napi_threadsafe_function wake;
	napi_value resource_name;
	NAPI_THROW_IF_FAILED(env, napi_create_string_utf8(env, "sdlPoll", NAPI_AUTO_LENGTH, &resource_name), Napi::Value());
	NAPI_THROW_IF_FAILED(env, napi_create_threadsafe_function(env, poll, nullptr, resource_name, 0, 1, nullptr, nullptr, nullptr, nullptr, &wake), Napi::Value());
	napi_status status = napi_unref_threadsafe_function(env, wake);
	if (status != napi_ok) {
		napi_release_threadsafe_function(wake, napi_tsfn_abort);
		NAPI_THROW_IF_FAILED(env, status, Napi::Value());
	}

	{
		std::lock_guard<std::mutex> registry_guard(mutex);

		auto it = all_threads.find(env);
		if (it != all_threads.end()) {
			napi_release_threadsafe_function(wake, napi_tsfn_abort);
			throw Napi::Error::New(env, "@kmamal/sdl is already loaded in this thread");
		}

		// Registered right after the wake function so that on worker termination it runs before Node finalizes it (cleanup hooks run last-registered-first).
		status = napi_add_env_cleanup_hook(env, _envCleanup, (void *) (napi_env) env);
		if (status != napi_ok) {
			napi_release_threadsafe_function(wake, napi_tsfn_abort);
			NAPI_THROW_IF_FAILED(env, status, Napi::Value());
		}

		Thread &thread = all_threads[env];
		thread.wake = wake;
		thread.is_main = is_main;
		if (!is_main) { num_workers.fetch_add(1, std::memory_order_acq_rel); }
	}

	if (!is_main) { threads::wakeMain(); }

	return env.Undefined();
}

Napi::Value
threads::setDemand (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	bool demand = info[0].As<Napi::Boolean>().Value();

	{
		std::lock_guard<std::mutex> guard(mutex);

		auto it = all_threads.find(env);
		if (it == all_threads.end()) { return Napi::Boolean::New(env, false); }

		Thread &thread = it->second;
		if (thread.demand != demand) {
			napi_status status = demand
				? napi_ref_threadsafe_function(env, thread.wake)
				: napi_unref_threadsafe_function(env, thread.wake);
			NAPI_THROW_IF_FAILED(env, status, Napi::Value());
			thread.demand = demand;
			num_demanding.fetch_add(demand ? 1 : -1, std::memory_order_acq_rel);
		}
	}

	return Napi::Boolean::New(env, threads::isPollingFast());
}
