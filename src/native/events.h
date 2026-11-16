#ifndef _EVENTS_H_
#define _EVENTS_H_

#include <napi.h>
#include "packed.h"
#include <SDL3/SDL.h>
#include <string>

namespace events {

	namespace targets {
		inline constexpr packed::Str APP { "app" };
		inline constexpr packed::Str VIDEO { "video" };
		inline constexpr packed::Str WINDOW { "window" };
		inline constexpr packed::Str KEYBOARD { "keyboard" };
		inline constexpr packed::Str JOYSTICK { "joystick" };
		inline constexpr packed::Str GAMEPAD { "gamepad" };
		inline constexpr packed::Str SENSOR { "sensor" };
		inline constexpr packed::Str CLIPBOARD { "clipboard" };
		inline constexpr packed::Str JOYSTICK_DEVICE { "joystickDevice" };
		inline constexpr packed::Str GAMEPAD_DEVICE { "gamepadDevice" };
		inline constexpr packed::Str AUDIO_DEVICE { "audioDevice" };
		inline constexpr packed::Str CHANGE { "change" };
	};

	namespace types {
		inline constexpr packed::Str QUIT { "quit" };
		inline constexpr packed::Str DISPLAY_ADD { "displayAdd" };
		inline constexpr packed::Str DISPLAY_REMOVE { "displayRemove" };
		inline constexpr packed::Str DISPLAY_ORIENT { "displayOrient" };
		inline constexpr packed::Str DISPLAY_MOVE { "displayMove" };
		inline constexpr packed::Str DISPLAY_SCALE { "displayScaleChange" };
		inline constexpr packed::Str DISPLAY_MODE { "displayModeChange" };
		inline constexpr packed::Str DISPLAY_USABLE { "displayUsableChange" };
		inline constexpr packed::Str DISPLAY_CHANGE { "displayChange" };
		inline constexpr packed::Str SHOW { "show" };
		inline constexpr packed::Str HIDE { "hide" };
		inline constexpr packed::Str EXPOSE { "expose" };
		inline constexpr packed::Str MOVE { "move" };
		inline constexpr packed::Str RESIZE { "resize" };
		inline constexpr packed::Str MINIMIZE { "minimize" };
		inline constexpr packed::Str MAXIMIZE { "maximize" };
		inline constexpr packed::Str RESTORE { "restore" };
		inline constexpr packed::Str ENTER_FULLSCREEN { "enterFullscreen" };
		inline constexpr packed::Str LEAVE_FULLSCREEN { "leaveFullscreen" };
		inline constexpr packed::Str FOCUS { "focus" };
		inline constexpr packed::Str BLUR { "blur" };
		inline constexpr packed::Str HOVER { "hover" };
		inline constexpr packed::Str LEAVE { "leave" };
		inline constexpr packed::Str KEY_DOWN { "keyDown" };
		inline constexpr packed::Str KEY_UP { "keyUp" };
		inline constexpr packed::Str TEXT_INPUT { "textInput" };
		inline constexpr packed::Str MOUSE_MOVE { "mouseMove" };
		inline constexpr packed::Str MOUSE_BUTTON_DOWN { "mouseButtonDown" };
		inline constexpr packed::Str MOUSE_BUTTON_UP { "mouseButtonUp" };
		inline constexpr packed::Str MOUSE_WHEEL { "mouseWheel" };
		inline constexpr packed::Str DROP_BEGIN { "dropBegin" };
		inline constexpr packed::Str DROP_COMPLETE { "dropComplete" };
		inline constexpr packed::Str DROP_FILE { "dropFile" };
		inline constexpr packed::Str DROP_TEXT { "dropText" };
		inline constexpr packed::Str CLOSE { "close" };
		inline constexpr packed::Str RENDER_DEVICE_LOST { "renderDeviceLost" };
		inline constexpr packed::Str KEYMAP_CHANGE { "keymapChange" };
		inline constexpr packed::Str FINGER_DOWN { "fingerDown" };
		inline constexpr packed::Str FINGER_UP { "fingerUp" };
		inline constexpr packed::Str FINGER_MOVE { "fingerMove" };
		inline constexpr packed::Str FINGER_CANCEL { "fingerCancel" };
		inline constexpr packed::Str DEVICE_ADD { "deviceAdd" };
		inline constexpr packed::Str DEVICE_REMOVE { "deviceRemove" };
		inline constexpr packed::Str DEVICE_FORMAT_CHANGE { "deviceFormatChange" };
		inline constexpr packed::Str AXIS_MOTION { "axisMotion" };
		inline constexpr packed::Str BUTTON_DOWN { "buttonDown" };
		inline constexpr packed::Str BUTTON_UP { "buttonUp" };
		inline constexpr packed::Str BALL_MOTION { "ballMotion" };
		inline constexpr packed::Str HAT_MOTION { "hatMotion" };
		inline constexpr packed::Str POWER_UPDATE { "powerUpdate" };
		inline constexpr packed::Str STEAM_HANDLE_UPDATE { "steamHandleUpdate" };
		inline constexpr packed::Str REMAP { "remap" };
		inline constexpr packed::Str UPDATE { "update" };
	};

	bool dispatchEventFromWatch(const SDL_Event &event);

	Napi::Value isDispatchingFromWatch(const Napi::CallbackInfo &info);
	Napi::Value poll(const Napi::CallbackInfo &info);
	Napi::Value broadcastChange(const Napi::CallbackInfo &info);

}; // namespace events

#endif // _EVENTS_H_
