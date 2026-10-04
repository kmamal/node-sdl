#include "gamepad.h"
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

Napi::Value
gamepad::getSteamHandle (Napi::Env &env, SDL_Gamepad *gamepad)
{
	Uint64 _steam_handle = SDL_GetGamepadSteamHandle(gamepad);
	return _steam_handle != 0
		? Napi::BigInt::New(env, _steam_handle)
		: env.Null();
}

void
gamepad::getState (Napi::Env &env, SDL_Gamepad *gamepad, Napi::Object dst)
{
	Napi::Object axes_obj = Napi::Object::New(env);
	axes_obj.Set("leftStickX", gamepad::mapAxis(gamepad, SDL_GAMEPAD_AXIS_LEFTX));
	axes_obj.Set("leftStickY", gamepad::mapAxis(gamepad, SDL_GAMEPAD_AXIS_LEFTY));
	axes_obj.Set("rightStickX", gamepad::mapAxis(gamepad, SDL_GAMEPAD_AXIS_RIGHTX));
	axes_obj.Set("rightStickY", gamepad::mapAxis(gamepad, SDL_GAMEPAD_AXIS_RIGHTY));
	axes_obj.Set("leftTrigger", gamepad::mapAxis(gamepad, SDL_GAMEPAD_AXIS_LEFT_TRIGGER));
	axes_obj.Set("rightTrigger", gamepad::mapAxis(gamepad, SDL_GAMEPAD_AXIS_RIGHT_TRIGGER));

	Napi::Object buttons_obj = Napi::Object::New(env);
	buttons_obj.Set("dpadLeft", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_DPAD_LEFT));
	buttons_obj.Set("dpadRight", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_DPAD_RIGHT));
	buttons_obj.Set("dpadUp", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_DPAD_UP));
	buttons_obj.Set("dpadDown", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_DPAD_DOWN));
	buttons_obj.Set("south", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_SOUTH));
	buttons_obj.Set("east", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_EAST));
	buttons_obj.Set("west", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_WEST));
	buttons_obj.Set("north", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_NORTH));
	buttons_obj.Set("guide", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_GUIDE));
	buttons_obj.Set("back", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_BACK));
	buttons_obj.Set("start", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_START));
	buttons_obj.Set("leftStick", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_LEFT_STICK));
	buttons_obj.Set("rightStick", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_RIGHT_STICK));
	buttons_obj.Set("leftShoulder", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_LEFT_SHOULDER));
	buttons_obj.Set("rightShoulder", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_RIGHT_SHOULDER));
	buttons_obj.Set("rightPaddle1", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_RIGHT_PADDLE1));
	buttons_obj.Set("leftPaddle1", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_LEFT_PADDLE1));
	buttons_obj.Set("rightPaddle2", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_RIGHT_PADDLE2));
	buttons_obj.Set("leftPaddle2", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_LEFT_PADDLE2));
	buttons_obj.Set("misc1", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_MISC1));
	buttons_obj.Set("misc2", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_MISC2));
	buttons_obj.Set("misc3", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_MISC3));
	buttons_obj.Set("misc4", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_MISC4));
	buttons_obj.Set("misc5", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_MISC5));
	buttons_obj.Set("misc6", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_MISC6));
	buttons_obj.Set("touchpad", SDL_GetGamepadButton(gamepad, SDL_GAMEPAD_BUTTON_TOUCHPAD));

	Napi::Object button_labels_obj = Napi::Object::New(env);
	for (auto button : { SDL_GAMEPAD_BUTTON_SOUTH, SDL_GAMEPAD_BUTTON_EAST, SDL_GAMEPAD_BUTTON_WEST, SDL_GAMEPAD_BUTTON_NORTH }) {
		auto label_entry = gamepad::button_labels.find(SDL_GetGamepadButtonLabel(gamepad, button));
		Napi::Value label = label_entry != gamepad::button_labels.end()
			? Napi::String::New(env, label_entry->second)
			: env.Null();
		button_labels_obj.Set(gamepad::buttons[button], label);
	}

	dst.Set("axes", axes_obj);
	dst.Set("buttons", buttons_obj);
	dst.Set("buttonLabels", button_labels_obj);
}


Napi::Value
gamepad::addMappings (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

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

	try {
		int _firmware_version = SDL_GetGamepadFirmwareVersion(gamepad);
		Napi::Value firmware_version = _firmware_version != 0
			? Napi::Number::New(env, _firmware_version)
			: env.Null();

		const char *_serial_number = SDL_GetGamepadSerial(gamepad);
		Napi::Value serial_number = _serial_number != nullptr
			? Napi::String::New(env, _serial_number)
			: env.Null();

		Napi::Value steam_handle = getSteamHandle(env, gamepad);

		SDL_Joystick *joystick = SDL_GetGamepadJoystick(gamepad);
		Napi::Value power = joystick::getPowerInfo(env, joystick);

		Napi::Object result = Napi::Object::New(env);
		result.Set("firmwareVersion", firmware_version);
		result.Set("serialNumber", serial_number);
		result.Set("steamHandle", steam_handle);
		result.Set("power", power);

		gamepad::getState(env, gamepad, result);

		return result;
	}
	catch (...) {
		SDL_CloseGamepad(gamepad);
		throw;
	}
}

Napi::Value
gamepad::close (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int gamepad_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Gamepad *gamepad = SDL_GetGamepadFromID(gamepad_id);
	if (gamepad == nullptr) {
		std::ostringstream message;
		message << "SDL_GetGamepadFromID(" << gamepad_id << ") error: invalid gamepad id";
		throw Napi::Error::New(env, message.str());
	}

	SDL_CloseGamepad(gamepad);

	return env.Undefined();
}
