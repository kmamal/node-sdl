#ifndef _EVENTS_H_
#define _EVENTS_H_

#include <napi.h>
#include <SDL.h>
#include <string>

namespace events {

	namespace families {
		extern std::string APP;
		extern std::string DISPLAY;
		extern std::string WINDOW;
		extern std::string DROP;
		extern std::string KEYBOARD;
		extern std::string TEXT;
		extern std::string MOUSE;
		extern std::string JOYSTICK_DEVICE;
		extern std::string JOYSTICK;
		extern std::string CONTROLLER;
		extern std::string SENSOR;
		extern std::string AUDIO_DEVICE;
		extern std::string CLIPBOARD;
	};

	namespace types {
		extern std::string QUIT;
		extern std::string DISPLAY_ADD;
		extern std::string DISPLAY_REMOVE;
		extern std::string DISPLAY_ORIENT;
		extern std::string DISPLAY_MOVE;
		extern std::string DISPLAY_CHANGE;
		extern std::string SHOW;
		extern std::string HIDE;
		extern std::string EXPOSE;
		extern std::string MOVE;
		extern std::string RESIZE;
		extern std::string MINIMIZE;
		extern std::string MAXIMIZE;
		extern std::string RESTORE;
		extern std::string FOCUS;
		extern std::string BLUR;
		extern std::string HOVER;
		extern std::string LEAVE;
		extern std::string KEY_DOWN;
		extern std::string KEY_UP;
		extern std::string TEXT_INPUT;
		extern std::string MOUSE_MOVE;
		extern std::string MOUSE_BUTTON_DOWN;
		extern std::string MOUSE_BUTTON_UP;
		extern std::string MOUSE_WHEEL;
		extern std::string DROP_BEGIN;
		extern std::string DROP_COMPLETE;
		extern std::string DROP_FILE;
		extern std::string DROP_TEXT;
		extern std::string CLOSE;
		extern std::string DEVICE_ADD;
		extern std::string DEVICE_REMOVE;
		extern std::string AXIS_MOTION;
		extern std::string BUTTON_DOWN;
		extern std::string BUTTON_UP;
		extern std::string BALL_MOTION;
		extern std::string HAT_MOTION;
		extern std::string REMAP;
		extern std::string UPDATE;
	};

	void dispatchEvent(const SDL_Event &event);

	Napi::Value poll(const Napi::CallbackInfo &info);

}; // namespace events

#endif // _EVENTS_H_
