#include "testing.h"
#include "global.h"
#include <SDL3/SDL.h>


static SDL_Joystick *
_getVirtual (Napi::Env &env, SDL_JoystickID id)
{
	SDL_Joystick *joystick = SDL_GetJoystickFromID(id);
	if (joystick == nullptr || !SDL_IsJoystickVirtual(id)) {
		SDL_ClearError();
		throw Napi::Error::New(env, "invalid virtual joystick id");
	}
	return joystick;
}

Napi::Value
testing::attachVirtualJoystick (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	bool is_gamepad = info[0].As<Napi::Boolean>().Value();

	SDL_VirtualJoystickDesc desc;
	SDL_INIT_INTERFACE(&desc);
	desc.type = is_gamepad ? SDL_JOYSTICK_TYPE_GAMEPAD : SDL_JOYSTICK_TYPE_UNKNOWN;
	desc.naxes = is_gamepad ? SDL_GAMEPAD_AXIS_COUNT : 2;
	desc.nbuttons = is_gamepad ? SDL_GAMEPAD_BUTTON_COUNT : 2;
	desc.name = is_gamepad ? "Virtual Gamepad" : "Virtual Joystick";

	SDL_JoystickID id = SDL_AttachVirtualJoystick(&desc);
	if (id == 0) { throw global::sdlError(env, "SDL_AttachVirtualJoystick"); }

	SDL_Joystick *joystick = SDL_OpenJoystick(id);
	if (joystick == nullptr) {
		SDL_DetachVirtualJoystick(id);
		throw global::sdlError(env, "SDL_OpenJoystick");
	}
	SDL_ClearError();

	return Napi::Number::New(env, id);
}

Napi::Value
testing::setVirtualJoystickAxis (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	SDL_JoystickID id = info[0].As<Napi::Number>().Int32Value();
	int axis = info[1].As<Napi::Number>().Int32Value();
	int value = info[2].As<Napi::Number>().Int32Value();

	if (!SDL_SetJoystickVirtualAxis(_getVirtual(env, id), axis, value)) {
		throw global::sdlError(env, "SDL_SetJoystickVirtualAxis");
	}

	return env.Undefined();
}

Napi::Value
testing::setVirtualJoystickButton (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	SDL_JoystickID id = info[0].As<Napi::Number>().Int32Value();
	int button = info[1].As<Napi::Number>().Int32Value();
	bool down = info[2].As<Napi::Boolean>().Value();

	if (!SDL_SetJoystickVirtualButton(_getVirtual(env, id), button, down)) {
		throw global::sdlError(env, "SDL_SetJoystickVirtualButton");
	}

	return env.Undefined();
}

Napi::Value
testing::detachVirtualJoystick (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	SDL_JoystickID id = info[0].As<Napi::Number>().Int32Value();

	SDL_CloseJoystick(_getVirtual(env, id));

	if (!SDL_DetachVirtualJoystick(id)) { throw global::sdlError(env, "SDL_DetachVirtualJoystick"); }

	return env.Undefined();
}

Napi::Value
testing::pushAudioDeviceEvent (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	std::string type = info[0].As<Napi::String>().Utf8Value();
	SDL_AudioDeviceID id = info[1].As<Napi::Number>().Uint32Value();
	bool is_recording = info[2].As<Napi::Boolean>().Value();

	SDL_Event event;
	SDL_zero(event);
	if (type == "add") { event.type = SDL_EVENT_AUDIO_DEVICE_ADDED; }
	else if (type == "remove") { event.type = SDL_EVENT_AUDIO_DEVICE_REMOVED; }
	else if (type == "format") { event.type = SDL_EVENT_AUDIO_DEVICE_FORMAT_CHANGED; }
	else { throw Napi::Error::New(env, "invalid audio device event type"); }
	event.adevice.which = id;
	event.adevice.recording = is_recording;

	if (!SDL_PushEvent(&event)) { throw global::sdlError(env, "SDL_PushEvent"); }

	return env.Undefined();
}
