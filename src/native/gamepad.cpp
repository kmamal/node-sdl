#include "gamepad.h"
#include "global.h"
#include "threads.h"
#include "joystick.h"
#include <SDL3/SDL.h>
#include <map>
#include <string>


const std::map<SDL_GamepadType, packed::Str> gamepad::types {
	// { SDL_GAMEPAD_TYPE_UNKNOWN, nullptr },
	{ SDL_GAMEPAD_TYPE_STANDARD, "standard" },
	{ SDL_GAMEPAD_TYPE_XBOX360, "xbox360" },
	{ SDL_GAMEPAD_TYPE_XBOXONE, "xboxOne" },
	{ SDL_GAMEPAD_TYPE_PS3, "ps3" },
	{ SDL_GAMEPAD_TYPE_PS4, "ps4" },
	{ SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_PRO, "nintendoSwitchPro" },
	{ SDL_GAMEPAD_TYPE_PS5, "ps5" },
	{ SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_JOYCON_LEFT, "nintendoSwitchJoyconLeft" },
	{ SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_JOYCON_RIGHT, "nintendoSwitchJoyconRight" },
	{ SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_JOYCON_PAIR, "nintendoSwitchJoyconPair" },
	{ SDL_GAMEPAD_TYPE_GAMECUBE, "gamecube" },
	{ SDL_GAMEPAD_TYPE_STEAM, "steam" },
};

const std::map<SDL_GamepadAxis, packed::Str> gamepad::axes {
	{ SDL_GAMEPAD_AXIS_LEFTX, "leftStickX" },
	{ SDL_GAMEPAD_AXIS_LEFTY, "leftStickY" },
	{ SDL_GAMEPAD_AXIS_RIGHTX, "rightStickX" },
	{ SDL_GAMEPAD_AXIS_RIGHTY, "rightStickY" },
	{ SDL_GAMEPAD_AXIS_LEFT_TRIGGER, "leftTrigger" },
	{ SDL_GAMEPAD_AXIS_RIGHT_TRIGGER, "rightTrigger" },
};

const std::map<SDL_GamepadButton, packed::Str> gamepad::buttons {
	{ SDL_GAMEPAD_BUTTON_DPAD_LEFT, "dpadLeft" },
	{ SDL_GAMEPAD_BUTTON_DPAD_RIGHT, "dpadRight" },
	{ SDL_GAMEPAD_BUTTON_DPAD_UP, "dpadUp" },
	{ SDL_GAMEPAD_BUTTON_DPAD_DOWN, "dpadDown" },
	{ SDL_GAMEPAD_BUTTON_SOUTH, "south" },
	{ SDL_GAMEPAD_BUTTON_EAST, "east" },
	{ SDL_GAMEPAD_BUTTON_WEST, "west" },
	{ SDL_GAMEPAD_BUTTON_NORTH, "north" },
	{ SDL_GAMEPAD_BUTTON_GUIDE, "guide" },
	{ SDL_GAMEPAD_BUTTON_BACK, "back" },
	{ SDL_GAMEPAD_BUTTON_START, "start" },
	{ SDL_GAMEPAD_BUTTON_LEFT_STICK, "leftStick" },
	{ SDL_GAMEPAD_BUTTON_RIGHT_STICK, "rightStick" },
	{ SDL_GAMEPAD_BUTTON_LEFT_SHOULDER, "leftShoulder" },
	{ SDL_GAMEPAD_BUTTON_RIGHT_SHOULDER, "rightShoulder" },
	{ SDL_GAMEPAD_BUTTON_RIGHT_PADDLE1, "rightPaddle1" },
	{ SDL_GAMEPAD_BUTTON_LEFT_PADDLE1, "leftPaddle1" },
	{ SDL_GAMEPAD_BUTTON_RIGHT_PADDLE2, "rightPaddle2" },
	{ SDL_GAMEPAD_BUTTON_LEFT_PADDLE2, "leftPaddle2" },
	{ SDL_GAMEPAD_BUTTON_MISC1, "misc1" },
	{ SDL_GAMEPAD_BUTTON_MISC2, "misc2" },
	{ SDL_GAMEPAD_BUTTON_MISC3, "misc3" },
	{ SDL_GAMEPAD_BUTTON_MISC4, "misc4" },
	{ SDL_GAMEPAD_BUTTON_MISC5, "misc5" },
	{ SDL_GAMEPAD_BUTTON_MISC6, "misc6" },
	{ SDL_GAMEPAD_BUTTON_TOUCHPAD, "touchpad" },
};

const std::map<SDL_GamepadButtonLabel, packed::Str> gamepad::button_labels {
	// { SDL_GAMEPAD_BUTTON_LABEL_UNKNOWN, nullptr },
	{ SDL_GAMEPAD_BUTTON_LABEL_A, "a" },
	{ SDL_GAMEPAD_BUTTON_LABEL_B, "b" },
	{ SDL_GAMEPAD_BUTTON_LABEL_X, "x" },
	{ SDL_GAMEPAD_BUTTON_LABEL_Y, "y" },
	{ SDL_GAMEPAD_BUTTON_LABEL_CROSS, "cross" },
	{ SDL_GAMEPAD_BUTTON_LABEL_CIRCLE, "circle" },
	{ SDL_GAMEPAD_BUTTON_LABEL_SQUARE, "square" },
	{ SDL_GAMEPAD_BUTTON_LABEL_TRIANGLE, "triangle" },
};


double
gamepad::mapAxis (SDL_Gamepad *gamepad, SDL_GamepadAxis axis) {
	return joystick::mapAxisValue(SDL_GetGamepadAxis(gamepad, axis));
}

packed::Value
gamepad::getSteamHandle (SDL_Gamepad *gamepad)
{
	Uint64 _steam_handle = SDL_GetGamepadSteamHandle(gamepad);
	return _steam_handle != 0
		? packed::Value((uint64_t) _steam_handle)
		: packed::Value();
}

void
gamepad::getState (SDL_Gamepad *gamepad, packed::Value &dst)
{
	packed::Value axes_obj = packed::Value::object();
	for (auto axis : {
		SDL_GAMEPAD_AXIS_LEFTX,
		SDL_GAMEPAD_AXIS_LEFTY,
		SDL_GAMEPAD_AXIS_RIGHTX,
		SDL_GAMEPAD_AXIS_RIGHTY,
		SDL_GAMEPAD_AXIS_LEFT_TRIGGER,
		SDL_GAMEPAD_AXIS_RIGHT_TRIGGER,
	}) {
		axes_obj.set(gamepad::axes.at(axis), gamepad::mapAxis(gamepad, axis));
	}

	packed::Value buttons_obj = packed::Value::object();
	for (auto &entry : gamepad::buttons) {
		buttons_obj.set(entry.second, SDL_GetGamepadButton(gamepad, entry.first));
	}

	packed::Value button_labels_obj = packed::Value::object();
	for (auto button : { SDL_GAMEPAD_BUTTON_SOUTH, SDL_GAMEPAD_BUTTON_EAST, SDL_GAMEPAD_BUTTON_WEST, SDL_GAMEPAD_BUTTON_NORTH }) {
		auto label_entry = gamepad::button_labels.find(SDL_GetGamepadButtonLabel(gamepad, button));
		packed::Value label;
		if (label_entry != gamepad::button_labels.end()) { label = packed::Value::ref(label_entry->second); }
		button_labels_obj.set(gamepad::buttons.at(button), std::move(label));
	}

	dst.set("axes", std::move(axes_obj));
	dst.set("buttons", std::move(buttons_obj));
	dst.set("buttonLabels", std::move(button_labels_obj));
}

static bool
_isPlatformMatch (const std::string &mapping)
{
	static const char field[] = "platform:";
	size_t start = mapping.find(field);
	if (start == std::string::npos) { return true; }
	start += sizeof(field) - 1;
	size_t end = mapping.find(',', start);
	if (end == std::string::npos) { end = mapping.size(); }
	const char *platform = mapping.c_str() + start;
	size_t length = end - start;

#ifdef SDL_PLATFORM_MACOS
	if (length == 8 && SDL_strncasecmp(platform, "Mac OS X", length) == 0) { return true; }
#endif

	const char *current = SDL_GetPlatform();
	return length == SDL_strlen(current) && SDL_strncasecmp(platform, current, length) == 0;
}

Napi::Value
gamepad::addMappings (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::recursive_mutex> guard(global::lock());
	global::assertReady(env);

	Napi::Array mappings = info[0].As<Napi::Array>();

	for (int i = 0; i < (int) mappings.Length(); i++) {
		std::string mapping = mappings.Get(i).As<Napi::String>().Utf8Value();
		if (!_isPlatformMatch(mapping)) { continue; }
		if (SDL_AddGamepadMapping(mapping.c_str()) == -1) {
			throw global::sdlError(env, "SDL_AddGamepadMapping", mapping);
		}
		SDL_ClearError();
	}

	return env.Undefined();
}

Napi::Value
gamepad::open (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::recursive_mutex> guard(global::lock());
	global::assertReady(env);

	SDL_JoystickID id = info[0].As<Napi::Number>().Uint32Value();

	SDL_Gamepad *gamepad = SDL_OpenGamepad(id);
	if (gamepad == nullptr) {
		throw global::sdlError(env, "SDL_OpenGamepad", id);
	}
	SDL_ClearError();

	threads::trackOpen(env, threads::GAMEPAD, id);

	try {
		int _firmware_version = SDL_GetGamepadFirmwareVersion(gamepad);
		packed::Value firmware_version;
		if (_firmware_version != 0) { firmware_version = _firmware_version; }

		const char *_serial_number = SDL_GetGamepadSerial(gamepad);
		packed::Value serial_number;
		if (_serial_number != nullptr) { serial_number = _serial_number; }

		SDL_Joystick *joystick = SDL_GetGamepadJoystick(gamepad);

		packed::Value result = packed::Value::object();
		result.set("firmwareVersion", std::move(firmware_version));
		result.set("serialNumber", std::move(serial_number));
		result.set("steamHandle", getSteamHandle(gamepad));
		result.set("power", joystick::getPowerInfo(joystick));

		gamepad::getState(gamepad, result);

		return result.toNapi(env);
	}
	catch (...) {
		threads::trackClose(env, threads::GAMEPAD, id);
		SDL_CloseGamepad(gamepad);
		throw;
	}
}

Napi::Value
gamepad::close (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::recursive_mutex> guard(global::lock());
	global::assertReady(env);

	SDL_JoystickID gamepad_id = info[0].As<Napi::Number>().Uint32Value();

	threads::trackClose(env, threads::GAMEPAD, gamepad_id);

	SDL_Gamepad *gamepad = global::fromIdOrThrow(env, SDL_GetGamepadFromID(gamepad_id), "SDL_GetGamepadFromID", "gamepad", gamepad_id);

	SDL_CloseGamepad(gamepad);

	return env.Undefined();
}
