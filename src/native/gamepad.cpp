#include "gamepad.h"
#include "global.h"
#include "threads.h"
#include "joystick.h"
#include <SDL3/SDL.h>
#include <map>
#include <string>
#include <sstream>


std::map<SDL_GamepadType, std::string> gamepad::types;
std::map<SDL_GamepadAxis, std::string> gamepad::axes;
std::map<SDL_GamepadButton, std::string> gamepad::buttons;
std::map<SDL_GamepadButtonLabel, std::string> gamepad::button_labels;


double
gamepad::mapAxis (SDL_Gamepad *gamepad, SDL_GamepadAxis axis) {
	return mapAxisValue(SDL_GetGamepadAxis(gamepad, axis));
}

double
gamepad::mapAxisValue (int value) {
	double range = value < 0 ? -SDL_JOYSTICK_AXIS_MIN : SDL_JOYSTICK_AXIS_MAX;
	return value / range;
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

Napi::Value
gamepad::addMappings (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	Napi::Array mappings = info[0].As<Napi::Array>();

	for (int i = 0; i < (int) mappings.Length(); i++) {
		std::string mapping = mappings.Get(i).As<Napi::String>().Utf8Value();
		SDL_ClearError();
		if (SDL_AddGamepadMapping(mapping.c_str()) == -1) {
			std::ostringstream message;
			message << "SDL_AddGamepadMapping(" << mapping << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		// SDL_AddGamepadMapping produces errors even though it succeeds
		const char *error = SDL_GetError();
		if (error[0] != '\0') { fprintf(stderr, "SDL silent error: %s\n", error); }
		SDL_ClearError();
	}

	return env.Undefined();
}

Napi::Value
gamepad::open (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int id = info[0].As<Napi::Number>().Int32Value();

	SDL_ClearError();
	SDL_Gamepad *gamepad = SDL_OpenGamepad(id);
	if (gamepad == nullptr) {
		std::ostringstream message;
		message << "SDL_OpenGamepad(" << id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	// SDL_OpenGamepad produces errors even though it succeeds
	const char *error = SDL_GetError();
	if (error[0] != '\0') { fprintf(stderr, "SDL silent error: %s\n", error); }
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

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int gamepad_id = info[0].As<Napi::Number>().Int32Value();

	threads::trackClose(env, threads::GAMEPAD, gamepad_id);

	SDL_Gamepad *gamepad = SDL_GetGamepadFromID(gamepad_id);
	if (gamepad == nullptr) {
		std::ostringstream message;
		message << "SDL_GetGamepadFromID(" << gamepad_id << ") error: invalid gamepad id";
		throw Napi::Error::New(env, message.str());
	}

	SDL_CloseGamepad(gamepad);

	return env.Undefined();
}
