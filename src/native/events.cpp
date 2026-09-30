#include "events.h"
#include "enums.h"
#include "video.h"
#include "keyboard.h"
#include "joystick.h"
#include "gamepad.h"
#include "audio.h"
#include <SDL3/SDL.h>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>


std::string events::targets::APP;
std::string events::targets::VIDEO;
std::string events::targets::WINDOW;
std::string events::targets::KEYBOARD;
std::string events::targets::JOYSTICK;
std::string events::targets::GAMEPAD;
std::string events::targets::SENSOR;
std::string events::targets::CLIPBOARD;
std::string events::targets::JOYSTICK_DEVICE;
std::string events::targets::GAMEPAD_DEVICE;
std::string events::targets::AUDIO_DEVICE;

std::string events::types::QUIT;
std::string events::types::DISPLAY_ADD;
std::string events::types::DISPLAY_REMOVE;
std::string events::types::DISPLAY_ORIENT;
std::string events::types::DISPLAY_MOVE;
std::string events::types::DISPLAY_SCALE;
std::string events::types::DISPLAY_MODE;
std::string events::types::DISPLAY_USABLE;
std::string events::types::DISPLAY_CHANGE;
std::string events::types::SHOW;
std::string events::types::HIDE;
std::string events::types::EXPOSE;
std::string events::types::MOVE;
std::string events::types::RESIZE;
std::string events::types::MINIMIZE;
std::string events::types::MAXIMIZE;
std::string events::types::RESTORE;
std::string events::types::ENTER_FULLSCREEN;
std::string events::types::LEAVE_FULLSCREEN;
std::string events::types::FOCUS;
std::string events::types::BLUR;
std::string events::types::HOVER;
std::string events::types::LEAVE;
std::string events::types::KEY_DOWN;
std::string events::types::KEY_UP;
std::string events::types::TEXT_INPUT;
std::string events::types::MOUSE_MOVE;
std::string events::types::MOUSE_BUTTON_DOWN;
std::string events::types::MOUSE_BUTTON_UP;
std::string events::types::MOUSE_WHEEL;
std::string events::types::DROP_BEGIN;
std::string events::types::DROP_COMPLETE;
std::string events::types::DROP_FILE;
std::string events::types::DROP_TEXT;
std::string events::types::CLOSE;
std::string events::types::RENDER_DEVICE_LOST;
std::string events::types::KEYMAP_CHANGE;
std::string events::types::FINGER_DOWN;
std::string events::types::FINGER_UP;
std::string events::types::FINGER_MOVE;
std::string events::types::FINGER_CANCEL;
std::string events::types::DEVICE_ADD;
std::string events::types::DEVICE_REMOVE;
std::string events::types::DEVICE_FORMAT_CHANGE;
std::string events::types::AXIS_MOTION;
std::string events::types::BUTTON_DOWN;
std::string events::types::BUTTON_UP;
std::string events::types::BALL_MOTION;
std::string events::types::HAT_MOTION;
std::string events::types::POWER_UPDATE;
std::string events::types::STEAM_HANDLE_UPDATE;
std::string events::types::REMAP;
std::string events::types::UPDATE;


static Napi::Env *poll_env = nullptr;
static Napi::Function *poll_callback = nullptr;

static const std::string *
_windowEventType (Uint32 type)
{
	switch (type) {
		case SDL_EVENT_WINDOW_SHOWN: return &events::types::SHOW;
		case SDL_EVENT_WINDOW_HIDDEN: return &events::types::HIDE;
		case SDL_EVENT_WINDOW_EXPOSED: return &events::types::EXPOSE;
		case SDL_EVENT_WINDOW_MOVED: return &events::types::MOVE;
		case SDL_EVENT_WINDOW_RESIZED:
		case SDL_EVENT_WINDOW_PIXEL_SIZE_CHANGED: return &events::types::RESIZE;
		case SDL_EVENT_WINDOW_DISPLAY_CHANGED: return &events::types::DISPLAY_CHANGE;
		case SDL_EVENT_WINDOW_MINIMIZED: return &events::types::MINIMIZE;
		case SDL_EVENT_WINDOW_MAXIMIZED: return &events::types::MAXIMIZE;
		case SDL_EVENT_WINDOW_RESTORED: return &events::types::RESTORE;
		case SDL_EVENT_WINDOW_ENTER_FULLSCREEN: return &events::types::ENTER_FULLSCREEN;
		case SDL_EVENT_WINDOW_LEAVE_FULLSCREEN: return &events::types::LEAVE_FULLSCREEN;
		case SDL_EVENT_WINDOW_FOCUS_GAINED: return &events::types::FOCUS;
		case SDL_EVENT_WINDOW_FOCUS_LOST: return &events::types::BLUR;
		case SDL_EVENT_WINDOW_MOUSE_ENTER: return &events::types::HOVER;
		case SDL_EVENT_WINDOW_MOUSE_LEAVE: return &events::types::LEAVE;
		case SDL_EVENT_WINDOW_CLOSE_REQUESTED: return &events::types::CLOSE;
		default: return nullptr;
	}
}

static bool
_packWindowEvent (const SDL_Event &event, Napi::Object &packed)
{
	const std::string *type = _windowEventType(event.type);
	if (type == nullptr) { return false; }

	packed.Set("target", events::targets::WINDOW);
	packed.Set("targetId", event.window.windowID);
	packed.Set("type", *type);

	switch (event.type) {
		case SDL_EVENT_WINDOW_MOVED: {
			packed.Set("x", event.window.data1);
			packed.Set("y", event.window.data2);
			break;
		}
		case SDL_EVENT_WINDOW_RESIZED:
		case SDL_EVENT_WINDOW_PIXEL_SIZE_CHANGED: {
			// The window was destroyed with events for it still in the queue
			SDL_Window *window = SDL_GetWindowFromID(event.window.windowID);
			if (window == nullptr) {
				SDL_ClearError();
				return false;
			}

			int width, height;
			SDL_GetWindowSize(window, &width, &height);
			int pixel_width, pixel_height;
			SDL_GetWindowSizeInPixels(window, &pixel_width, &pixel_height);

			packed.Set("width", width);
			packed.Set("height", height);
			packed.Set("pixelWidth", pixel_width);
			packed.Set("pixelHeight", pixel_height);
			break;
		}
		case SDL_EVENT_WINDOW_DISPLAY_CHANGED: {
			packed.Set("displayId", event.window.data1);
			break;
		}
		default: break;
	}

	return true;
}

bool
events::dispatchEvent(const SDL_Event &event)
{
	if (poll_env == nullptr) { return false; }
	Napi::Env &env = *poll_env;

	Napi::Object packed = Napi::Object::New(env);

	if (event.type >= SDL_EVENT_WINDOW_FIRST && event.type <= SDL_EVENT_WINDOW_LAST) {
		if (!_packWindowEvent(event, packed)) { return false; }
	}
	else switch (event.type) {
		case SDL_EVENT_QUIT: {
			packed.Set("target", events::targets::APP);
			packed.Set("type", events::types::QUIT);
			break;
		}

		case SDL_EVENT_DISPLAY_ADDED: {
			Napi::Value display = video::_getDisplay(env, event.display.displayID);
			if (display.IsNull()) { return false; }

			packed.Set("target", events::targets::VIDEO);
			packed.Set("type", events::types::DISPLAY_ADD);
			packed.Set("display", display);
			break;
		}
		case SDL_EVENT_DISPLAY_REMOVED: {
			packed.Set("target", events::targets::VIDEO);
			packed.Set("type", events::types::DISPLAY_REMOVE);
			packed.Set("displayId", event.display.displayID);
			break;
		}
		case SDL_EVENT_DISPLAY_ORIENTATION: {
			auto orientation_entry = video::orientations.find((SDL_DisplayOrientation) event.display.data1);
			Napi::Value orientation = orientation_entry != video::orientations.end()
				? Napi::String::New(env, orientation_entry->second)
				: env.Null();

			packed.Set("target", events::targets::VIDEO);
			packed.Set("displayId", event.display.displayID);
			packed.Set("type", events::types::DISPLAY_ORIENT);
			packed.Set("orientation", orientation);
			break;
		}
		case SDL_EVENT_DISPLAY_MOVED: {
			packed.Set("target", events::targets::VIDEO);
			packed.Set("type", events::types::DISPLAY_MOVE);

			SDL_DisplayID display_id = event.display.displayID;
			packed.Set("displayId", display_id);

			SDL_Rect rect;

			if(!SDL_GetDisplayBounds(display_id, &rect)) {
				SDL_ClearError();
				return false;
			}
			packed.Set("geometryX", rect.x);
			packed.Set("geometryY", rect.y);

			if(!SDL_GetDisplayUsableBounds(display_id, &rect)) {
				SDL_ClearError();
				return false;
			}
			packed.Set("usableX", rect.x);
			packed.Set("usableY", rect.y);

			break;
		}
		case SDL_EVENT_DISPLAY_CONTENT_SCALE_CHANGED:
		case SDL_EVENT_DISPLAY_CURRENT_MODE_CHANGED:
		case SDL_EVENT_DISPLAY_USABLE_BOUNDS_CHANGED: {
			Napi::Value display = video::_getDisplay(env, event.display.displayID);
			if (display.IsNull()) { return false; }

			packed.Set("target", events::targets::VIDEO);
			packed.Set("type", event.type == SDL_EVENT_DISPLAY_CONTENT_SCALE_CHANGED
				? events::types::DISPLAY_SCALE
				: event.type == SDL_EVENT_DISPLAY_CURRENT_MODE_CHANGED
					? events::types::DISPLAY_MODE
					: events::types::DISPLAY_USABLE);
			packed.Set("displayId", event.display.displayID);
			packed.Set("display", display);
			break;
		}

		case SDL_EVENT_RENDER_DEVICE_LOST: {
			packed.Set("target", events::targets::WINDOW);
			packed.Set("targetId", event.render.windowID);
			packed.Set("type", events::types::RENDER_DEVICE_LOST);
			break;
		}

		case SDL_EVENT_DROP_BEGIN:
		case SDL_EVENT_DROP_COMPLETE: {
			packed.Set("target", events::targets::WINDOW);
			packed.Set("targetId", event.drop.windowID);
			packed.Set("type", event.type == SDL_EVENT_DROP_BEGIN ? events::types::DROP_BEGIN : events::types::DROP_COMPLETE);
			break;
		}
		case SDL_EVENT_DROP_FILE:
		case SDL_EVENT_DROP_TEXT: {
			packed.Set("target", events::targets::WINDOW);
			packed.Set("targetId", event.drop.windowID);

			bool is_file = event.type == SDL_EVENT_DROP_FILE;
			packed.Set("type", is_file ? events::types::DROP_FILE : events::types::DROP_TEXT);
			packed.Set(is_file ? "file" : "text", event.drop.data);
			break;
		}

		case SDL_EVENT_KEY_DOWN:
		case SDL_EVENT_KEY_UP: {
			packed.Set("target", events::targets::WINDOW);
			packed.Set("targetId", event.key.windowID);
			packed.Set(
				"type",
				event.type == SDL_EVENT_KEY_DOWN
					? events::types::KEY_DOWN
					: events::types::KEY_UP
			);

			packed.Set("scancode", (int) event.key.scancode);

			packed.Set("key", keyboard::packKey(env, event.key.key));

			if (event.type == SDL_EVENT_KEY_DOWN) {
				packed.Set("repeat", event.key.repeat);
			}

			packed.Set("alt", !!(event.key.mod & SDL_KMOD_ALT));
			packed.Set("ctrl", !!(event.key.mod & SDL_KMOD_CTRL));
			packed.Set("shift", !!(event.key.mod & SDL_KMOD_SHIFT));
			packed.Set("super", !!(event.key.mod & SDL_KMOD_GUI));
			packed.Set("altgr", !!(event.key.mod & SDL_KMOD_MODE));
			packed.Set("numlock", !!(event.key.mod & SDL_KMOD_NUM));
			packed.Set("capslock", !!(event.key.mod & SDL_KMOD_CAPS));
			break;
		}

		case SDL_EVENT_TEXT_INPUT: {
			packed.Set("target", events::targets::WINDOW);
			packed.Set("targetId", event.text.windowID);
			packed.Set("type", events::types::TEXT_INPUT);
			packed.Set("text", event.text.text);
			break;
		}

		case SDL_EVENT_KEYMAP_CHANGED: {
			packed.Set("target", events::targets::KEYBOARD);
			packed.Set("type", events::types::KEYMAP_CHANGE);
			break;
		}

		case SDL_EVENT_MOUSE_MOTION: {
			packed.Set("target", events::targets::WINDOW);
			packed.Set("targetId", event.motion.windowID);
			packed.Set("type", events::types::MOUSE_MOVE);
			packed.Set("touch", event.motion.which == SDL_TOUCH_MOUSEID);
			packed.Set("pen", event.motion.which == SDL_PEN_MOUSEID);
			packed.Set("x", event.motion.x);
			packed.Set("y", event.motion.y);
			packed.Set("dx", event.motion.xrel);
			packed.Set("dy", event.motion.yrel);
			break;
		}
		case SDL_EVENT_MOUSE_BUTTON_DOWN:
		case SDL_EVENT_MOUSE_BUTTON_UP: {
			packed.Set("target", events::targets::WINDOW);
			packed.Set("targetId", event.button.windowID);
			packed.Set(
				"type",
				event.type == SDL_EVENT_MOUSE_BUTTON_DOWN
					? events::types::MOUSE_BUTTON_DOWN
					: events::types::MOUSE_BUTTON_UP
			);
			packed.Set("touch", event.button.which == SDL_TOUCH_MOUSEID);
			packed.Set("pen", event.button.which == SDL_PEN_MOUSEID);
			packed.Set("button", event.button.button);
			packed.Set("x", event.button.x);
			packed.Set("y", event.button.y);
			break;
		}
		case SDL_EVENT_MOUSE_WHEEL: {
			packed.Set("target", events::targets::WINDOW);
			packed.Set("targetId", event.wheel.windowID);
			packed.Set("type", events::types::MOUSE_WHEEL);
			packed.Set("touch", event.wheel.which == SDL_TOUCH_MOUSEID);
			packed.Set("pen", event.wheel.which == SDL_PEN_MOUSEID);
			packed.Set("x", event.wheel.mouse_x);
			packed.Set("y", event.wheel.mouse_y);
			packed.Set("dx", event.wheel.x);
			packed.Set("dy", event.wheel.y);
			packed.Set("flipped", event.wheel.direction == SDL_MOUSEWHEEL_FLIPPED);
			break;
		}

		case SDL_EVENT_FINGER_UP:
		case SDL_EVENT_FINGER_DOWN:
		case SDL_EVENT_FINGER_CANCELED: {
			packed.Set("target", events::targets::WINDOW);
			packed.Set("targetId", event.tfinger.windowID);
			packed.Set("type", event.type == SDL_EVENT_FINGER_UP
				? events::types::FINGER_UP
				: event.type == SDL_EVENT_FINGER_DOWN
					? events::types::FINGER_DOWN
					: events::types::FINGER_CANCEL);
			packed.Set("mouse", event.tfinger.touchID == SDL_MOUSE_TOUCHID);
			packed.Set("pen", event.tfinger.touchID == SDL_PEN_TOUCHID);
			packed.Set("touchId", Napi::BigInt::New(env, event.tfinger.touchID));
			packed.Set("fingerId", Napi::BigInt::New(env, event.tfinger.fingerID));
			packed.Set("x", event.tfinger.x);
			packed.Set("y", event.tfinger.y);
			packed.Set("pressure", event.tfinger.pressure);
			break;
		}
		case SDL_EVENT_FINGER_MOTION: {
			packed.Set("target", events::targets::WINDOW);
			packed.Set("type", events::types::FINGER_MOVE);
			packed.Set("targetId", event.tfinger.windowID);
			packed.Set("mouse", event.tfinger.touchID == SDL_MOUSE_TOUCHID);
			packed.Set("pen", event.tfinger.touchID == SDL_PEN_TOUCHID);
			packed.Set("touchId", Napi::BigInt::New(env, event.tfinger.touchID));
			packed.Set("fingerId", Napi::BigInt::New(env, event.tfinger.fingerID));
			packed.Set("x", event.tfinger.x);
			packed.Set("y", event.tfinger.y);
			packed.Set("dx", event.tfinger.dx);
			packed.Set("dy", event.tfinger.dy);
			packed.Set("pressure", event.tfinger.pressure);
			break;
		}

		case SDL_EVENT_JOYSTICK_ADDED:
		case SDL_EVENT_GAMEPAD_ADDED: {
			packed.Set("target", event.type == SDL_EVENT_JOYSTICK_ADDED
				? events::targets::JOYSTICK_DEVICE
				: events::targets::GAMEPAD_DEVICE);
			packed.Set("type", events::types::DEVICE_ADD);
			packed.Set("device", joystick::_getDevice(env, event.jdevice.which));
			break;
		}
		case SDL_EVENT_JOYSTICK_REMOVED:
		case SDL_EVENT_GAMEPAD_REMOVED: {
			packed.Set("target", event.type == SDL_EVENT_JOYSTICK_REMOVED
				? events::targets::JOYSTICK_DEVICE
				: events::targets::GAMEPAD_DEVICE);
			packed.Set("type", events::types::DEVICE_REMOVE);
			packed.Set("deviceId", event.jdevice.which);
			break;
		}

		case SDL_EVENT_JOYSTICK_AXIS_MOTION: {
			packed.Set("target", events::targets::JOYSTICK);
			packed.Set("targetId", event.jaxis.which);
			packed.Set("type", events::types::AXIS_MOTION);
			packed.Set("axis", event.jaxis.axis);
			packed.Set("value", joystick::mapAxisValue(event.jaxis.value));
			break;
		}
		case SDL_EVENT_JOYSTICK_BALL_MOTION: {
			packed.Set("target", events::targets::JOYSTICK);
			packed.Set("targetId", event.jball.which);
			packed.Set("type", events::types::BALL_MOTION);
			packed.Set("ball", event.jball.ball);
			packed.Set("dx", event.jball.xrel);
			packed.Set("dy", event.jball.yrel);
			break;
		}
		case SDL_EVENT_JOYSTICK_BUTTON_DOWN:
		case SDL_EVENT_JOYSTICK_BUTTON_UP: {
			packed.Set("target", events::targets::JOYSTICK);
			packed.Set("targetId", event.jbutton.which);
			packed.Set(
				"type",
				event.type == SDL_EVENT_JOYSTICK_BUTTON_DOWN
					? events::types::BUTTON_DOWN
					: events::types::BUTTON_UP
			);
			packed.Set("button", event.jbutton.button);
			break;
		}
		case SDL_EVENT_JOYSTICK_HAT_MOTION: {
			packed.Set("target", events::targets::JOYSTICK);
			packed.Set("targetId", event.jhat.which);
			packed.Set("type", events::types::HAT_MOTION);
			packed.Set("hat", event.jhat.hat);
			auto hat_position_entry = joystick::hat_positions.find(event.jhat.value);
			Napi::Value hat_position = hat_position_entry != joystick::hat_positions.end()
				? Napi::String::New(env, hat_position_entry->second)
				: env.Null();
			packed.Set("value", hat_position);
			break;
		}

		case SDL_EVENT_JOYSTICK_BATTERY_UPDATED: {
			packed.Set("target", events::targets::JOYSTICK);
			packed.Set("targetId", event.jbattery.which);
			packed.Set("type", events::types::POWER_UPDATE);
			packed.Set("power", joystick::mapPowerInfo(env, event.jbattery.state, event.jbattery.percent));
			break;
		}

		case SDL_EVENT_GAMEPAD_STEAM_HANDLE_UPDATED: {
			packed.Set("target", events::targets::GAMEPAD);
			packed.Set("type", events::types::STEAM_HANDLE_UPDATE);

			SDL_JoystickID gamepad_id = event.gdevice.which;
			SDL_Gamepad *gamepad = SDL_GetGamepadFromID(gamepad_id);
			if (gamepad == nullptr) {
				SDL_ClearError();
				return false;
			}

			packed.Set("targetId", gamepad_id);
			packed.Set("steamHandle", gamepad::getSteamHandle(env, gamepad));
			break;
		}

		case SDL_EVENT_GAMEPAD_REMAPPED: {
			packed.Set("target", events::targets::GAMEPAD);
			packed.Set("type", events::types::REMAP);

			SDL_JoystickID gamepad_id = event.gdevice.which;
			SDL_Gamepad *gamepad = SDL_GetGamepadFromID(gamepad_id);
			if (gamepad == nullptr) {
				SDL_ClearError();
				return false;
			}

			packed.Set("targetId", gamepad_id);
			gamepad::getState(env, gamepad, packed);
			break;
		}

		case SDL_EVENT_GAMEPAD_AXIS_MOTION: {
			packed.Set("target", events::targets::GAMEPAD);
			packed.Set("type", events::types::AXIS_MOTION);

			int gamepad_id = event.gaxis.which;
			SDL_Gamepad *gamepad = SDL_GetGamepadFromID(gamepad_id);
			if (gamepad == nullptr) {
				SDL_ClearError();
				return false;
			}

			packed.Set("targetId", gamepad_id);

			SDL_GamepadAxis axis = (SDL_GamepadAxis) event.gaxis.axis;
			auto axis_entry = gamepad::axes.find(axis);
			Napi::Value axis_name = axis_entry != gamepad::axes.end()
				? Napi::String::New(env, axis_entry->second)
				: env.Null();
			packed.Set("axis", axis_name);
			packed.Set("value", gamepad::mapAxisValue(event.gaxis.value));
			break;
		}
		case SDL_EVENT_GAMEPAD_BUTTON_DOWN:
		case SDL_EVENT_GAMEPAD_BUTTON_UP: {
			packed.Set("target", events::targets::GAMEPAD);
			packed.Set("targetId", event.gbutton.which);
			packed.Set(
				"type",
				event.type == SDL_EVENT_GAMEPAD_BUTTON_DOWN
					? events::types::BUTTON_DOWN
					: events::types::BUTTON_UP
			);

			auto button_entry = gamepad::buttons.find((SDL_GamepadButton) event.gbutton.button);
			Napi::Value button_name = button_entry != gamepad::buttons.end()
				? Napi::String::New(env, button_entry->second)
				: env.Null();
			packed.Set("button", button_name);
			break;
		}

		case SDL_EVENT_SENSOR_UPDATE: {
			packed.Set("target", events::targets::SENSOR);
			packed.Set("targetId", event.sensor.which);
			packed.Set("type", events::types::UPDATE);
			break;
		}

		case SDL_EVENT_AUDIO_DEVICE_ADDED: {
			bool is_recording = event.adevice.recording;

			Napi::Value device = audio::_getDevice(env, event.adevice.which);
			if (device.IsNull()) { return false; }

			packed.Set("target", events::targets::AUDIO_DEVICE);
			packed.Set("type", events::types::DEVICE_ADD);
			packed.Set("audioDeviceType", audio::device_types[is_recording]);
			packed.Set("device", device);
			break;
		}
		case SDL_EVENT_AUDIO_DEVICE_REMOVED: {
			packed.Set("target", events::targets::AUDIO_DEVICE);
			packed.Set("type", events::types::DEVICE_REMOVE);
			packed.Set("audioDeviceType", audio::device_types[event.adevice.recording]);
			packed.Set("deviceId", event.adevice.which);
			break;
		}
		case SDL_EVENT_AUDIO_DEVICE_FORMAT_CHANGED: {
			packed.Set("target", events::targets::AUDIO_DEVICE);
			packed.Set("type", events::types::DEVICE_FORMAT_CHANGE);
			packed.Set("audioDeviceType", audio::device_types[event.adevice.recording]);
			packed.Set("deviceId", event.adevice.which);
			break;
		}

		case SDL_EVENT_CLIPBOARD_UPDATE: {
			packed.Set("target", events::targets::CLIPBOARD);
			packed.Set("type", events::types::UPDATE);
			break;
		}
	}

	if (!packed.Has("type")) { return false; }

	poll_callback->Call(poll_env->Global(), { packed });

	return true;
}

// We need to track events dispatched from the watcher to avoid duplicates.
struct WatchDispatchedEvent {
	Uint64 timestamp;
	Uint32 window_id;
	Uint32 window_event;
	Sint32 data1;
	Sint32 data2;
};

static std::vector<WatchDispatchedEvent> watch_dispatched_events;

static bool
wasDispatchedFromWatch (const SDL_Event &event)
{
	if (event.type < SDL_EVENT_WINDOW_FIRST || event.type > SDL_EVENT_WINDOW_LAST) { return false; }

	for (auto it = watch_dispatched_events.begin(); it != watch_dispatched_events.end(); ++it) {
		if (true
			&& it->timestamp == event.common.timestamp
			&& it->window_id == event.window.windowID
			&& it->window_event == event.window.type
			&& it->data1 == event.window.data1
			&& it->data2 == event.window.data2
		) {
			watch_dispatched_events.erase(it);
			return true;
		}
	}

	return false;
}

static int dispatching_from_watch = 0;

Napi::Value
events::isDispatchingFromWatch (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	return Napi::Boolean::New(env, dispatching_from_watch > 0);
}

bool
events::dispatchEventFromWatch(const SDL_Event &event)
{
	dispatching_from_watch++;
	bool dispatched = events::dispatchEvent(event);
	dispatching_from_watch--;

	if (dispatched) {
		watch_dispatched_events.push_back({
			event.common.timestamp,
			event.window.windowID,
			event.window.type,
			event.window.data1,
			event.window.data2,
		});
	}

	return dispatched;
}

Napi::Value
events::poll (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	Napi::Function callback = info[0].As<Napi::Function>();

	Uint64 poll_start = SDL_GetTicksNS();

	poll_env = &env;
	poll_callback = &callback;

	try {
		SDL_Event event;
		while (SDL_PollEvent(&event)) {
			if (wasDispatchedFromWatch(event)) { continue; }
			events::dispatchEvent(event);
		}

		watch_dispatched_events.erase(
			std::remove_if(
				watch_dispatched_events.begin(),
				watch_dispatched_events.end(),
				[poll_start](const WatchDispatchedEvent &it) { return it.timestamp < poll_start; }
			),
			watch_dispatched_events.end()
		);
	}
	catch (...) {
		poll_env = nullptr;
		poll_callback = nullptr;
		throw;
	}
	poll_env = nullptr;
	poll_callback = nullptr;

	return env.Undefined();
}
