#include "global.h"
#include "events.h"
#include "keyboard.h"
#include <SDL.h>
#include <string>
#include <sstream>

#if defined(__MACOSX__)
	#include "cocoa-global.h"
#endif


SDL_threadID mainThreadId;

int filterEvents(void*, SDL_Event *event) {
	if (SDL_ThreadID() != mainThreadId) { return 1; }

	if (event->type != SDL_WINDOWEVENT) { return 1; }

	int window_event_type = event->window.event;
	if (true
		&& window_event_type != SDL_WINDOWEVENT_MOVED
		&& window_event_type != SDL_WINDOWEVENT_SIZE_CHANGED
	) { return 1; }

	events::dispatchEvent(*event);

	return 0;
}


const char *global::no_error = nullptr;

Napi::Value
global::initialize(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	SDL_SetHint(SDL_HINT_FRAMEBUFFER_ACCELERATION, "0");

	if (SDL_Init(0
		| SDL_INIT_EVENTS
		| SDL_INIT_JOYSTICK
		| SDL_INIT_GAMECONTROLLER
		| SDL_INIT_HAPTIC
		| SDL_INIT_SENSOR
	) < 0) {
		std::ostringstream message;
		message << "SDL_Init() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_version sdl_compile_version;
	SDL_VERSION(&sdl_compile_version);

	Napi::Object compile_version = Napi::Object::New(env);
	compile_version.Set("major", Napi::Number::New(env, sdl_compile_version.major));
	compile_version.Set("minor", Napi::Number::New(env, sdl_compile_version.minor));
	compile_version.Set("patch", Napi::Number::New(env, sdl_compile_version.patch));

	SDL_version sdl_runtime_version;
	SDL_GetVersion(&sdl_runtime_version);

	Napi::Object runtime_version = Napi::Object::New(env);
	runtime_version.Set("major", Napi::Number::New(env, sdl_runtime_version.major));
	runtime_version.Set("minor", Napi::Number::New(env, sdl_runtime_version.minor));
	runtime_version.Set("patch", Napi::Number::New(env, sdl_runtime_version.patch));

	Napi::Object versions = Napi::Object::New(env);
	versions.Set("compile", compile_version);
	versions.Set("runtime", runtime_version);

	const char *platform_name = SDL_GetPlatform();

	Napi::Array all_video_drivers = Napi::Array::New(env);

	int num_video_drivers = SDL_GetNumVideoDrivers();
	if (num_video_drivers < 0) {
		std::ostringstream message;
		message << "SDL_GetNumVideoDrivers() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}
	for (int i = 0; i < num_video_drivers; i ++) {
		const char *name = SDL_GetVideoDriver(i);
		if(name == nullptr) {
			std::ostringstream message;
			message << "SDL_GetVideoDriver(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}
		all_video_drivers.Set(all_video_drivers.Length(), Napi::String::New(env, name));
	}

	Napi::Value current_video_driver;
	if (SDL_InitSubSystem(SDL_INIT_VIDEO) == 0) {
		const char *name = SDL_GetCurrentVideoDriver();
		if(name == nullptr) {
			std::ostringstream message;
			message << "SDL_GetCurrentVideoDriver() error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}
		current_video_driver = Napi::String::New(env, name);
	} else {
		current_video_driver = env.Null();
	}

	Napi::Object video_drivers = Napi::Object::New(env);
	video_drivers.Set("all", all_video_drivers);
	video_drivers.Set("current", current_video_driver);

	Napi::Array all_audio_drivers = Napi::Array::New(env);

	int num_audio_drivers = SDL_GetNumAudioDrivers();
	if (num_audio_drivers < 0) {
		std::ostringstream message;
		message << "SDL_GetNumAudioDrivers() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	for (int i = 0; i < num_audio_drivers; i ++) {
		const char *name = SDL_GetAudioDriver(i);
		if(name == nullptr) {
			std::ostringstream message;
			message << "SDL_GetAudioDriver(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}
		all_audio_drivers.Set(all_audio_drivers.Length(), Napi::String::New(env, name));
	}

	Napi::Value current_audio_driver;
	if (SDL_InitSubSystem(SDL_INIT_AUDIO) == 0) {
		const char *name = SDL_GetCurrentAudioDriver();
		if(name == nullptr) {
			std::ostringstream message;
			message << "SDL_GetCurrentAudioDriver() error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}
		current_audio_driver = Napi::String::New(env, name);
	} else {
		current_audio_driver = env.Null();
	}

	Napi::Object audio_drivers = Napi::Object::New(env);
	audio_drivers.Set("all", all_audio_drivers);
	audio_drivers.Set("current", current_audio_driver);

	Napi::Object drivers = Napi::Object::New(env);
	drivers.Set("video", video_drivers);
	drivers.Set("audio", audio_drivers);

	SDL_ClearError();
	global::no_error = SDL_GetError();

	mainThreadId = SDL_ThreadID();
	SDL_SetEventFilter(filterEvents, nullptr);

	keyboard::keys = SDL_GetKeyboardState(&keyboard::num_keys);
	SDL_StartTextInput(); // TODO

#if defined(__MACOSX__)
	reenableInertialScrolling();
#endif

	Napi::Object result = Napi::Object::New(env);
	result.Set("version", versions);
	result.Set("platform", Napi::String::New(env, platform_name));
	result.Set("drivers", drivers);

	return result;
}


Napi::Value
global::cleanup(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	SDL_Quit();

	return env.Undefined();
}
