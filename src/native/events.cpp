#include "events.h"
#include "enums.h"
#include "video.h"
#include "keyboard.h"
#include "joystick.h"
#include "gamepad.h"
#include "audio.h"
#include "window.h"
#include "threads.h"
#include "global.h"
#include <memory>
#include <SDL3/SDL.h>
#include <string>
#include <vector>
#include <algorithm>


packed::Str events::targets::APP;
packed::Str events::targets::VIDEO;
packed::Str events::targets::WINDOW;
packed::Str events::targets::KEYBOARD;
packed::Str events::targets::JOYSTICK;
packed::Str events::targets::GAMEPAD;
packed::Str events::targets::SENSOR;
packed::Str events::targets::CLIPBOARD;
packed::Str events::targets::JOYSTICK_DEVICE;
packed::Str events::targets::GAMEPAD_DEVICE;
packed::Str events::targets::AUDIO_DEVICE;
packed::Str events::targets::CHANGE;

packed::Str events::types::QUIT;
packed::Str events::types::DISPLAY_ADD;
packed::Str events::types::DISPLAY_REMOVE;
packed::Str events::types::DISPLAY_ORIENT;
packed::Str events::types::DISPLAY_MOVE;
packed::Str events::types::DISPLAY_SCALE;
packed::Str events::types::DISPLAY_MODE;
packed::Str events::types::DISPLAY_USABLE;
packed::Str events::types::DISPLAY_CHANGE;
packed::Str events::types::SHOW;
packed::Str events::types::HIDE;
packed::Str events::types::EXPOSE;
packed::Str events::types::MOVE;
packed::Str events::types::RESIZE;
packed::Str events::types::MINIMIZE;
packed::Str events::types::MAXIMIZE;
packed::Str events::types::RESTORE;
packed::Str events::types::ENTER_FULLSCREEN;
packed::Str events::types::LEAVE_FULLSCREEN;
packed::Str events::types::FOCUS;
packed::Str events::types::BLUR;
packed::Str events::types::HOVER;
packed::Str events::types::LEAVE;
packed::Str events::types::KEY_DOWN;
packed::Str events::types::KEY_UP;
packed::Str events::types::TEXT_INPUT;
packed::Str events::types::MOUSE_MOVE;
packed::Str events::types::MOUSE_BUTTON_DOWN;
packed::Str events::types::MOUSE_BUTTON_UP;
packed::Str events::types::MOUSE_WHEEL;
packed::Str events::types::DROP_BEGIN;
packed::Str events::types::DROP_COMPLETE;
packed::Str events::types::DROP_FILE;
packed::Str events::types::DROP_TEXT;
packed::Str events::types::CLOSE;
packed::Str events::types::RENDER_DEVICE_LOST;
packed::Str events::types::KEYMAP_CHANGE;
packed::Str events::types::FINGER_DOWN;
packed::Str events::types::FINGER_UP;
packed::Str events::types::FINGER_MOVE;
packed::Str events::types::FINGER_CANCEL;
packed::Str events::types::DEVICE_ADD;
packed::Str events::types::DEVICE_REMOVE;
packed::Str events::types::DEVICE_FORMAT_CHANGE;
packed::Str events::types::AXIS_MOTION;
packed::Str events::types::BUTTON_DOWN;
packed::Str events::types::BUTTON_UP;
packed::Str events::types::BALL_MOTION;
packed::Str events::types::HAT_MOTION;
packed::Str events::types::POWER_UPDATE;
packed::Str events::types::STEAM_HANDLE_UPDATE;
packed::Str events::types::REMAP;
packed::Str events::types::UPDATE;


static Napi::Env *poll_env = nullptr;
static Napi::Function *poll_callback = nullptr;

struct Packing {
	packed::Value value = packed::Value::object();
	const packed::Str *target = nullptr;
	Uint32 target_id = 0;

	void setTarget (const packed::Str &name) {
		target = &name;
		value.set("target", packed::Value::ref(name));
	}
	void setTargetId (Uint32 id) {
		target_id = id;
		value.set("targetId", id);
	}
	void setType (const packed::Str &name) { value.set("type", packed::Value::ref(name)); }
	void set (const char *key, packed::Value item) { value.set(key, std::move(item)); }
};

static const packed::Str *
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

static const packed::Str *
_displayEventType (Uint32 type)
{
	switch (type) {
		case SDL_EVENT_DISPLAY_ORIENTATION: return &events::types::DISPLAY_ORIENT;
		case SDL_EVENT_DISPLAY_MOVED: return &events::types::DISPLAY_MOVE;
		case SDL_EVENT_DISPLAY_CONTENT_SCALE_CHANGED: return &events::types::DISPLAY_SCALE;
		case SDL_EVENT_DISPLAY_CURRENT_MODE_CHANGED: return &events::types::DISPLAY_MODE;
		case SDL_EVENT_DISPLAY_USABLE_BOUNDS_CHANGED: return &events::types::DISPLAY_USABLE;
		default: return nullptr;
	}
}

template <typename Map, typename Key>
static packed::Value
_lookup (const Map &map, Key key)
{
	auto entry = map.find(key);
	return entry != map.end() ? packed::Value::ref(entry->second) : packed::Value();
}

static bool
_packWindowEvent (const SDL_Event &event, Packing &packed)
{
	const packed::Str *type = _windowEventType(event.type);
	if (type == nullptr) { return false; }

	packed.setTarget(events::targets::WINDOW);
	packed.setTargetId(event.window.windowID);
	packed.setType(*type);

	switch (event.type) {
		case SDL_EVENT_WINDOW_MOVED: {
			packed.set("x", event.window.data1);
			packed.set("y", event.window.data2);
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

			int width, height, pixel_width, pixel_height;
			if (
				!SDL_GetWindowSize(window, &width, &height)
				|| !SDL_GetWindowSizeInPixels(window, &pixel_width, &pixel_height)
			) {
				SDL_ClearError();
				return false;
			}

			packed.set("width", width);
			packed.set("height", height);
			packed.set("pixelWidth", pixel_width);
			packed.set("pixelHeight", pixel_height);
			break;
		}
		case SDL_EVENT_WINDOW_DISPLAY_CHANGED: {
			packed.set("displayId", event.window.data1);
			break;
		}
		default: break;
	}

	return true;
}

static bool
_packEvent (const SDL_Event &event, Packing &packed)
{
	if (event.type >= SDL_EVENT_WINDOW_FIRST && event.type <= SDL_EVENT_WINDOW_LAST) {
		return _packWindowEvent(event, packed);
	}

	switch (event.type) {
		case SDL_EVENT_QUIT: {
			packed.setTarget(events::targets::APP);
			packed.setType(events::types::QUIT);
			break;
		}

		case SDL_EVENT_DISPLAY_ADDED: {
			packed::Value display = video::_getDisplay(event.display.displayID);
			if (display.isNull()) { return false; }

			packed.setTarget(events::targets::VIDEO);
			packed.setType(events::types::DISPLAY_ADD);
			packed.set("display", std::move(display));
			break;
		}
		case SDL_EVENT_DISPLAY_REMOVED: {
			packed.setTarget(events::targets::VIDEO);
			packed.setType(events::types::DISPLAY_REMOVE);
			packed.set("displayId", event.display.displayID);
			break;
		}
		case SDL_EVENT_DISPLAY_ORIENTATION:
		case SDL_EVENT_DISPLAY_MOVED:
		case SDL_EVENT_DISPLAY_CONTENT_SCALE_CHANGED:
		case SDL_EVENT_DISPLAY_CURRENT_MODE_CHANGED:
		case SDL_EVENT_DISPLAY_USABLE_BOUNDS_CHANGED: {
			packed::Value display = video::_getDisplay(event.display.displayID);
			if (display.isNull()) { return false; }

			packed.setTarget(events::targets::VIDEO);
			packed.setType(*_displayEventType(event.type));
			packed.set("displayId", event.display.displayID);
			packed.set("display", std::move(display));
			break;
		}

		case SDL_EVENT_RENDER_DEVICE_LOST: {
			packed.setTarget(events::targets::WINDOW);
			packed.setTargetId(event.render.windowID);
			packed.setType(events::types::RENDER_DEVICE_LOST);
			break;
		}

		case SDL_EVENT_RENDER_DEVICE_RESET: {
			SDL_Window *window = SDL_GetWindowFromID(event.render.windowID);
			if (window == nullptr) {
				SDL_ClearError();
				return false;
			}
			window::resetTexture(window);
			return false;
		}

		case SDL_EVENT_DROP_BEGIN:
		case SDL_EVENT_DROP_COMPLETE: {
			packed.setTarget(events::targets::WINDOW);
			packed.setTargetId(event.drop.windowID);
			packed.setType(event.type == SDL_EVENT_DROP_BEGIN ? events::types::DROP_BEGIN : events::types::DROP_COMPLETE);
			break;
		}
		case SDL_EVENT_DROP_FILE:
		case SDL_EVENT_DROP_TEXT: {
			packed.setTarget(events::targets::WINDOW);
			packed.setTargetId(event.drop.windowID);

			bool is_file = event.type == SDL_EVENT_DROP_FILE;
			packed.setType(is_file ? events::types::DROP_FILE : events::types::DROP_TEXT);
			packed.set(is_file ? "file" : "text", event.drop.data);
			break;
		}

		case SDL_EVENT_KEY_DOWN:
		case SDL_EVENT_KEY_UP: {
			packed.setTarget(events::targets::WINDOW);
			packed.setTargetId(event.key.windowID);
			packed.setType(event.type == SDL_EVENT_KEY_DOWN
				? events::types::KEY_DOWN
				: events::types::KEY_UP);

			packed.set("scancode", (int) event.key.scancode);

			packed.set("key", keyboard::packKey(event.key.key));

			if (event.type == SDL_EVENT_KEY_DOWN) {
				packed.set("repeat", event.key.repeat);
			}

			packed.set("alt", !!(event.key.mod & SDL_KMOD_ALT));
			packed.set("ctrl", !!(event.key.mod & SDL_KMOD_CTRL));
			packed.set("shift", !!(event.key.mod & SDL_KMOD_SHIFT));
			packed.set("super", !!(event.key.mod & SDL_KMOD_GUI));
			packed.set("altgr", !!(event.key.mod & SDL_KMOD_MODE));
			packed.set("numlock", !!(event.key.mod & SDL_KMOD_NUM));
			packed.set("capslock", !!(event.key.mod & SDL_KMOD_CAPS));
			break;
		}

		case SDL_EVENT_TEXT_INPUT: {
			packed.setTarget(events::targets::WINDOW);
			packed.setTargetId(event.text.windowID);
			packed.setType(events::types::TEXT_INPUT);
			packed.set("text", event.text.text);
			break;
		}

		case SDL_EVENT_KEYMAP_CHANGED: {
			packed.setTarget(events::targets::KEYBOARD);
			packed.setType(events::types::KEYMAP_CHANGE);
			break;
		}

		case SDL_EVENT_MOUSE_MOTION: {
			packed.setTarget(events::targets::WINDOW);
			packed.setTargetId(event.motion.windowID);
			packed.setType(events::types::MOUSE_MOVE);
			packed.set("touch", event.motion.which == SDL_TOUCH_MOUSEID);
			packed.set("pen", event.motion.which == SDL_PEN_MOUSEID);
			packed.set("x", event.motion.x);
			packed.set("y", event.motion.y);
			packed.set("dx", event.motion.xrel);
			packed.set("dy", event.motion.yrel);
			break;
		}
		case SDL_EVENT_MOUSE_BUTTON_DOWN:
		case SDL_EVENT_MOUSE_BUTTON_UP: {
			packed.setTarget(events::targets::WINDOW);
			packed.setTargetId(event.button.windowID);
			packed.setType(event.type == SDL_EVENT_MOUSE_BUTTON_DOWN
				? events::types::MOUSE_BUTTON_DOWN
				: events::types::MOUSE_BUTTON_UP);
			packed.set("touch", event.button.which == SDL_TOUCH_MOUSEID);
			packed.set("pen", event.button.which == SDL_PEN_MOUSEID);
			packed.set("button", event.button.button);
			packed.set("x", event.button.x);
			packed.set("y", event.button.y);
			break;
		}
		case SDL_EVENT_MOUSE_WHEEL: {
			packed.setTarget(events::targets::WINDOW);
			packed.setTargetId(event.wheel.windowID);
			packed.setType(events::types::MOUSE_WHEEL);
			packed.set("touch", event.wheel.which == SDL_TOUCH_MOUSEID);
			packed.set("pen", event.wheel.which == SDL_PEN_MOUSEID);
			packed.set("x", event.wheel.mouse_x);
			packed.set("y", event.wheel.mouse_y);
			packed.set("dx", event.wheel.x);
			packed.set("dy", event.wheel.y);
			packed.set("flipped", event.wheel.direction == SDL_MOUSEWHEEL_FLIPPED);
			break;
		}

		case SDL_EVENT_FINGER_UP:
		case SDL_EVENT_FINGER_DOWN:
		case SDL_EVENT_FINGER_CANCELED: {
			packed.setTarget(events::targets::WINDOW);
			packed.setTargetId(event.tfinger.windowID);
			packed.setType(event.type == SDL_EVENT_FINGER_UP
				? events::types::FINGER_UP
				: event.type == SDL_EVENT_FINGER_DOWN
					? events::types::FINGER_DOWN
					: events::types::FINGER_CANCEL);
			packed.set("mouse", event.tfinger.touchID == SDL_MOUSE_TOUCHID);
			packed.set("pen", event.tfinger.touchID == SDL_PEN_TOUCHID);
			packed.set("touchId", (uint64_t) event.tfinger.touchID);
			packed.set("fingerId", (uint64_t) event.tfinger.fingerID);
			packed.set("x", event.tfinger.x);
			packed.set("y", event.tfinger.y);
			packed.set("pressure", event.tfinger.pressure);
			break;
		}
		case SDL_EVENT_FINGER_MOTION: {
			packed.setTarget(events::targets::WINDOW);
			packed.setType(events::types::FINGER_MOVE);
			packed.setTargetId(event.tfinger.windowID);
			packed.set("mouse", event.tfinger.touchID == SDL_MOUSE_TOUCHID);
			packed.set("pen", event.tfinger.touchID == SDL_PEN_TOUCHID);
			packed.set("touchId", (uint64_t) event.tfinger.touchID);
			packed.set("fingerId", (uint64_t) event.tfinger.fingerID);
			packed.set("x", event.tfinger.x);
			packed.set("y", event.tfinger.y);
			packed.set("dx", event.tfinger.dx);
			packed.set("dy", event.tfinger.dy);
			packed.set("pressure", event.tfinger.pressure);
			break;
		}

		case SDL_EVENT_JOYSTICK_ADDED:
		case SDL_EVENT_GAMEPAD_ADDED: {
			packed.setTarget(event.type == SDL_EVENT_JOYSTICK_ADDED
				? events::targets::JOYSTICK_DEVICE
				: events::targets::GAMEPAD_DEVICE);
			packed.setType(events::types::DEVICE_ADD);
			packed.set("device", joystick::_getDevice(event.jdevice.which));
			break;
		}
		case SDL_EVENT_JOYSTICK_REMOVED:
		case SDL_EVENT_GAMEPAD_REMOVED: {
			packed.setTarget(event.type == SDL_EVENT_JOYSTICK_REMOVED
				? events::targets::JOYSTICK_DEVICE
				: events::targets::GAMEPAD_DEVICE);
			packed.setType(events::types::DEVICE_REMOVE);
			packed.set("deviceId", event.jdevice.which);
			break;
		}

		case SDL_EVENT_JOYSTICK_AXIS_MOTION: {
			packed.setTarget(events::targets::JOYSTICK);
			packed.setTargetId(event.jaxis.which);
			packed.setType(events::types::AXIS_MOTION);
			packed.set("axis", event.jaxis.axis);
			packed.set("value", joystick::mapAxisValue(event.jaxis.value));
			break;
		}
		case SDL_EVENT_JOYSTICK_BALL_MOTION: {
			packed.setTarget(events::targets::JOYSTICK);
			packed.setTargetId(event.jball.which);
			packed.setType(events::types::BALL_MOTION);
			packed.set("ball", event.jball.ball);
			packed.set("dx", event.jball.xrel);
			packed.set("dy", event.jball.yrel);
			break;
		}
		case SDL_EVENT_JOYSTICK_BUTTON_DOWN:
		case SDL_EVENT_JOYSTICK_BUTTON_UP: {
			packed.setTarget(events::targets::JOYSTICK);
			packed.setTargetId(event.jbutton.which);
			packed.setType(event.type == SDL_EVENT_JOYSTICK_BUTTON_DOWN
				? events::types::BUTTON_DOWN
				: events::types::BUTTON_UP);
			packed.set("button", event.jbutton.button);
			break;
		}
		case SDL_EVENT_JOYSTICK_HAT_MOTION: {
			packed.setTarget(events::targets::JOYSTICK);
			packed.setTargetId(event.jhat.which);
			packed.setType(events::types::HAT_MOTION);
			packed.set("hat", event.jhat.hat);
			packed.set("value", _lookup(joystick::hat_positions, event.jhat.value));
			break;
		}

		case SDL_EVENT_JOYSTICK_BATTERY_UPDATED: {
			packed.setTarget(events::targets::JOYSTICK);
			packed.setTargetId(event.jbattery.which);
			packed.setType(events::types::POWER_UPDATE);
			packed.set("power", joystick::mapPowerInfo(event.jbattery.state, event.jbattery.percent));
			break;
		}

		case SDL_EVENT_GAMEPAD_STEAM_HANDLE_UPDATED: {
			packed.setTarget(events::targets::GAMEPAD);
			packed.setType(events::types::STEAM_HANDLE_UPDATE);

			joystick::JoysticksLock joysticks_lock;
			SDL_JoystickID gamepad_id = event.gdevice.which;
			SDL_Gamepad *gamepad = SDL_GetGamepadFromID(gamepad_id);
			if (gamepad == nullptr) {
				SDL_ClearError();
				return false;
			}

			packed.setTargetId(gamepad_id);
			packed.set("steamHandle", gamepad::getSteamHandle(gamepad));
			break;
		}

		case SDL_EVENT_GAMEPAD_REMAPPED: {
			packed.setTarget(events::targets::GAMEPAD);
			packed.setType(events::types::REMAP);

			joystick::JoysticksLock joysticks_lock;
			SDL_JoystickID gamepad_id = event.gdevice.which;
			SDL_Gamepad *gamepad = SDL_GetGamepadFromID(gamepad_id);
			if (gamepad == nullptr) {
				SDL_ClearError();
				return false;
			}

			packed.setTargetId(gamepad_id);
			packed.set("device", joystick::_getDevice(gamepad_id));
			gamepad::getState(gamepad, packed.value);
			break;
		}

		case SDL_EVENT_GAMEPAD_AXIS_MOTION: {
			packed.setTarget(events::targets::GAMEPAD);
			packed.setTargetId(event.gaxis.which);
			packed.setType(events::types::AXIS_MOTION);

			SDL_GamepadAxis axis = (SDL_GamepadAxis) event.gaxis.axis;
			auto axis_entry = gamepad::axes.find(axis);
			if (axis_entry == gamepad::axes.end()) { return false; }
			packed.set("axis", packed::Value::ref(axis_entry->second));
			packed.set("value", joystick::mapAxisValue(event.gaxis.value));
			break;
		}
		case SDL_EVENT_GAMEPAD_BUTTON_DOWN:
		case SDL_EVENT_GAMEPAD_BUTTON_UP: {
			packed.setTarget(events::targets::GAMEPAD);
			packed.setTargetId(event.gbutton.which);
			packed.setType(event.type == SDL_EVENT_GAMEPAD_BUTTON_DOWN
				? events::types::BUTTON_DOWN
				: events::types::BUTTON_UP);

			auto button_entry = gamepad::buttons.find((SDL_GamepadButton) event.gbutton.button);
			if (button_entry == gamepad::buttons.end()) { return false; }
			packed.set("button", packed::Value::ref(button_entry->second));
			break;
		}

		case SDL_EVENT_SENSOR_UPDATE: {
			packed.setTarget(events::targets::SENSOR);
			packed.setTargetId(event.sensor.which);
			packed.setType(events::types::UPDATE);
			packed.set("x", event.sensor.data[0]);
			packed.set("y", event.sensor.data[1]);
			packed.set("z", event.sensor.data[2]);
			packed.set("timestamp", (uint64_t) event.sensor.sensor_timestamp);
			break;
		}

		case SDL_EVENT_AUDIO_DEVICE_ADDED: {
			bool is_recording = event.adevice.recording;

			packed::Value device = audio::_getDevice(event.adevice.which);
			if (device.isNull()) { return false; }

			packed.setTarget(events::targets::AUDIO_DEVICE);
			packed.setType(events::types::DEVICE_ADD);
			packed.set("audioDeviceType", packed::Value::ref(audio::device_types.at(is_recording)));
			packed.set("device", std::move(device));
			packed.set("defaultDevice", audio::_getDefaultDevice(is_recording));
			break;
		}
		case SDL_EVENT_AUDIO_DEVICE_REMOVED: {
			packed.setTarget(events::targets::AUDIO_DEVICE);
			packed.setType(events::types::DEVICE_REMOVE);
			packed.set("audioDeviceType", packed::Value::ref(audio::device_types.at(event.adevice.recording)));
			packed.set("deviceId", event.adevice.which);
			packed.set("defaultDevice", audio::_getDefaultDevice(event.adevice.recording));
			break;
		}
		case SDL_EVENT_AUDIO_DEVICE_FORMAT_CHANGED: {
			packed.setTarget(events::targets::AUDIO_DEVICE);
			packed.setType(events::types::DEVICE_FORMAT_CHANGE);
			packed.set("audioDeviceType", packed::Value::ref(audio::device_types.at(event.adevice.recording)));
			packed.set("deviceId", event.adevice.which);
			packed.set("format", audio::_getFormat(event.adevice.which));
			packed.set("defaultDevice", audio::_getDefaultDevice(event.adevice.recording));
			break;
		}

		case SDL_EVENT_CLIPBOARD_UPDATE: {
			packed.setTarget(events::targets::CLIPBOARD);
			packed.setType(events::types::UPDATE);
			break;
		}
	}

	return packed.value.has("type");
}

static bool in_callback = false;

struct CallbackGuard {
	CallbackGuard () { in_callback = true; }
	~CallbackGuard () { in_callback = false; }
};

static bool
_dispatchEvent (const SDL_Event &event)
{
	if (poll_env == nullptr) { return false; }
	Napi::Env &env = *poll_env;
	Napi::HandleScope scope(env);

	Packing packing;
	if (!_packEvent(event, packing)) { return false; }

	if (!threads::hasWorkers()) {
		CallbackGuard guard;
		poll_callback->Call(env.Global(), { packing.value.toNapi(env) });
		return true;
	}

	threads::Event shared = {
		packing.target,
		packing.target_id,
		std::make_shared<const packed::Value>(std::move(packing.value)),
	};

	threads::distribute(shared, env);

	CallbackGuard guard;
	poll_callback->Call(env.Global(), { shared.value->toNapi(env) });

	return true;
}

// We need to track events dispatched from the watcher to avoid duplicates.
struct WatchDispatchedEvent {
	Uint64 timestamp;
	Uint32 window_id;
	SDL_EventType window_event;
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
	// Only dispatch while no JS callback is running; otherwise the event arrives through the normal poll.
	if (in_callback) { return false; }

	// No try/catch: the JS handler only assigns fields before routing user code through tryEmit, so only an out-of-memory failure inside Node-API could throw here, which isn't worth guarding against.
	dispatching_from_watch++;
	bool dispatched = _dispatchEvent(event);
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

static void
_pump (Napi::Env &env, Napi::Function &callback)
{
	Uint64 poll_start = SDL_GetTicksNS();

	poll_env = &env;
	poll_callback = &callback;

	try {
		SDL_Event event;
		while (SDL_PollEvent(&event)) {
			if (wasDispatchedFromWatch(event)) { continue; }
			_dispatchEvent(event);
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
}

Napi::Value
events::poll (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	Napi::Function callback = info[0].As<Napi::Function>();

	if (global::isMainThread()) {
		threads::drain(env, callback);
		global::processInitRequests();
		_pump(env, callback);
		return Napi::Boolean::New(env, threads::isPollingFast());
	}

	threads::drain(env, callback);

	return env.Undefined();
}

Napi::Value
events::broadcastChange (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::string name = info[0].As<Napi::String>().Utf8Value();

	packed::Value value = packed::Value::object();
	value.set("target", packed::Value::ref(events::targets::CHANGE));
	value.set("type", name);

	threads::Event shared = { nullptr, 0, std::make_shared<const packed::Value>(std::move(value)) };
	threads::distribute(shared, env);

	return env.Undefined();
}
