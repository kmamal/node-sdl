#ifndef _EVENTS_H_
#define _EVENTS_H_

#include <napi.h>
#include "packed.h"
#include <SDL3/SDL.h>
#include <string>

namespace events {

	namespace targets {
		extern packed::Str APP;
		extern packed::Str VIDEO;
		extern packed::Str WINDOW;
		extern packed::Str KEYBOARD;
		extern packed::Str JOYSTICK;
		extern packed::Str GAMEPAD;
		extern packed::Str SENSOR;
		extern packed::Str CLIPBOARD;
		extern packed::Str JOYSTICK_DEVICE;
		extern packed::Str GAMEPAD_DEVICE;
		extern packed::Str AUDIO_DEVICE;
		extern packed::Str CHANGE;
	};

	namespace types {
		extern packed::Str QUIT;
		extern packed::Str DISPLAY_ADD;
		extern packed::Str DISPLAY_REMOVE;
		extern packed::Str DISPLAY_ORIENT;
		extern packed::Str DISPLAY_MOVE;
		extern packed::Str DISPLAY_SCALE;
		extern packed::Str DISPLAY_MODE;
		extern packed::Str DISPLAY_USABLE;
		extern packed::Str DISPLAY_CHANGE;
		extern packed::Str SHOW;
		extern packed::Str HIDE;
		extern packed::Str EXPOSE;
		extern packed::Str MOVE;
		extern packed::Str RESIZE;
		extern packed::Str MINIMIZE;
		extern packed::Str MAXIMIZE;
		extern packed::Str RESTORE;
		extern packed::Str ENTER_FULLSCREEN;
		extern packed::Str LEAVE_FULLSCREEN;
		extern packed::Str FOCUS;
		extern packed::Str BLUR;
		extern packed::Str HOVER;
		extern packed::Str LEAVE;
		extern packed::Str KEY_DOWN;
		extern packed::Str KEY_UP;
		extern packed::Str TEXT_INPUT;
		extern packed::Str MOUSE_MOVE;
		extern packed::Str MOUSE_BUTTON_DOWN;
		extern packed::Str MOUSE_BUTTON_UP;
		extern packed::Str MOUSE_WHEEL;
		extern packed::Str DROP_BEGIN;
		extern packed::Str DROP_COMPLETE;
		extern packed::Str DROP_FILE;
		extern packed::Str DROP_TEXT;
		extern packed::Str CLOSE;
		extern packed::Str RENDER_DEVICE_LOST;
		extern packed::Str KEYMAP_CHANGE;
		extern packed::Str FINGER_DOWN;
		extern packed::Str FINGER_UP;
		extern packed::Str FINGER_MOVE;
		extern packed::Str FINGER_CANCEL;
		extern packed::Str DEVICE_ADD;
		extern packed::Str DEVICE_REMOVE;
		extern packed::Str DEVICE_FORMAT_CHANGE;
		extern packed::Str AXIS_MOTION;
		extern packed::Str BUTTON_DOWN;
		extern packed::Str BUTTON_UP;
		extern packed::Str BALL_MOTION;
		extern packed::Str HAT_MOTION;
		extern packed::Str POWER_UPDATE;
		extern packed::Str STEAM_HANDLE_UPDATE;
		extern packed::Str REMAP;
		extern packed::Str UPDATE;
	};

	bool dispatchEventFromWatch(const SDL_Event &event);

	Napi::Value isDispatchingFromWatch(const Napi::CallbackInfo &info);
	Napi::Value poll(const Napi::CallbackInfo &info);
	Napi::Value broadcastChange(const Napi::CallbackInfo &info);

}; // namespace events

#endif // _EVENTS_H_
