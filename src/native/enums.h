#ifndef _ENUMS_H_
#define _ENUMS_H_

#include <napi.h>

namespace enums {

	enum class EventFamily {
		DISPLAY,
		WINDOW,
		KEYBOARD,
		MOUSE,
		TEXT,
		DROP,
		JOYSTICK_DEVICE,
		JOYSTICK,
		CONTROLLER,
		SENSOR,
		AUDIO_DEVICE,
		CLIPBOARD,
	};

	enum class EventType {
		QUIT,
		DISPLAY_ADD,
		DISPLAY_REMOVE,
		DISPLAY_ORIENT,
		SHOW,
		HIDE,
		EXPOSE,
		MOVE,
		RESIZE,
		MINIMIZE,
		MAXIMIZE,
		RESTORE,
		FOCUS,
		BLUR,
		HOVER,
		LEAVE,
		CLOSE,
		DROP_BEGIN,
		DROP_COMPLETE,
		DROP_FILE,
		DROP_TEXT,
		KEY_DOWN,
		KEY_UP,
		TEXT_INPUT,
		MOUSE_MOVE,
		MOUSE_BUTTON_DOWN,
		MOUSE_BUTTON_UP,
		MOUSE_WHEEL,
		DEVICE_ADD,
		DEVICE_REMOVE,
		AXIS_MOTION,
		BALL_MOTION,
		BUTTON_DOWN,
		BUTTON_UP,
		HAT_MOTION,
		REMAP,
		UPDATE,
	};

	Napi::Value get(const Napi::CallbackInfo &info);

}; // namespace enums

#endif // _ENUMS_H_
