#include "joystick.h"
#include "gamepad.h"
#include "power.h"
#include <SDL3/SDL.h>
#include <string>
#include <sstream>
#include <map>
#include <cmath>


std::map<Uint8, std::string> joystick::hat_positions;
std::map<SDL_JoystickType, std::string> joystick::types;
SDL_GUID joystick::zero_guid;

double
joystick::mapAxis (SDL_Joystick *joystick, int axis) {
	return mapAxisValue(SDL_GetJoystickAxis(joystick, axis));
}

double
joystick::mapAxisValue (int value) {
	double range = value < 0 ? - SDL_JOYSTICK_AXIS_MIN : SDL_JOYSTICK_AXIS_MAX;
	return value / range;
}

static Napi::Object
_packDevice (Napi::Env &env, SDL_JoystickID id)
{
	const char *_name = SDL_GetJoystickNameForID(id);
	Napi::Value name = _name != nullptr
		? Napi::String::New(env, _name)
		: env.Null();

	const char *_path = SDL_GetJoystickPathForID(id);
	Napi::Value path = _path != nullptr
		? Napi::String::New(env, _path)
		: env.Null();

	SDL_GUID _guid = SDL_GetJoystickGUIDForID(id);
	Napi::Value guid;
	if (SDL_memcmp(&_guid, &joystick::zero_guid, sizeof(SDL_GUID)) != 0) {
		char guid_string[33];
		SDL_GUIDToString(_guid, guid_string, 33);
		guid = Napi::String::New(env, guid_string);
	}
	else {
		guid = env.Null();
	}

	SDL_JoystickType _type = SDL_GetJoystickTypeForID(id);
	auto type_entry = joystick::types.find(_type);
	Napi::Value type = type_entry != joystick::types.end()
		? Napi::String::New(env, type_entry->second)
		: env.Null();

	int _vendor = SDL_GetJoystickVendorForID(id);
	Napi::Value vendor = _vendor != 0
		? Napi::Number::New(env, _vendor)
		: env.Null();

	int _product = SDL_GetJoystickProductForID(id);
	Napi::Value product = _product != 0
		? Napi::Number::New(env, _product)
		: env.Null();

	int _version = SDL_GetJoystickProductVersionForID(id);
	Napi::Value version = _version != 0
		? Napi::Number::New(env, _version)
		: env.Null();

	int _player = SDL_GetJoystickPlayerIndexForID(id);
	Napi::Value player = _player != -1
		? Napi::Number::New(env, _player)
		: env.Null();

	bool is_gamepad = SDL_IsGamepad(id);

	Napi::Value gamepad_mapping;
	Napi::Value gamepad_name;
	Napi::Value gamepad_type;

	if (is_gamepad) {
		char *_gamepad_mapping = SDL_GetGamepadMappingForID(id);
		if (_gamepad_mapping != nullptr) {
			try { gamepad_mapping = Napi::String::New(env, _gamepad_mapping); }
			catch (...) {
				SDL_free(_gamepad_mapping);
				throw;
			}
			SDL_free(_gamepad_mapping);
		}
		else {
			gamepad_mapping = env.Null();
		}

		const char *_gamepad_name = SDL_GetGamepadNameForID(id);
		gamepad_name = _gamepad_name != nullptr
			? Napi::String::New(env, _gamepad_name)
			: env.Null();

		SDL_GamepadType _gamepad_type = SDL_GetGamepadTypeForID(id);
		auto gamepad_type_entry = gamepad::types.find(_gamepad_type);
		gamepad_type = gamepad_type_entry != gamepad::types.end()
			? Napi::String::New(env, gamepad_type_entry->second)
			: env.Null();
	}
	else {
			gamepad_mapping = env.Null();
			gamepad_name = env.Null();
			gamepad_type = env.Null();
	}

	Napi::Object device = Napi::Object::New(env);
	device.Set("id", id);
	device.Set("name", name);
	device.Set("path", path);
	device.Set("type", type);
	device.Set("guid", guid);
	device.Set("vendor", vendor);
	device.Set("product", product);
	device.Set("version", version);
	device.Set("player", player);
	device.Set("isGamepad", is_gamepad);
	device.Set("gamepadMapping", gamepad_mapping);
	device.Set("gamepadName", gamepad_name);
	device.Set("gamepadType", gamepad_type);

	return device;
}

Napi::Value
joystick::_getDevice (Napi::Env &env, SDL_JoystickID id)
{
	return _packDevice(env, id);
}

Napi::Array
joystick::_getDevices (Napi::Env &env)
{
	int num_devices;
	SDL_JoystickID *joystick_ids = SDL_GetJoysticks(&num_devices);
	if (joystick_ids == nullptr) {
		std::ostringstream message;
		message << "SDL_GetJoysticks() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array devices = Napi::Array::New(env, num_devices);

	try {
		for (int i = 0; i < num_devices; i++) {
			devices.Set(i, _packDevice(env, joystick_ids[i]));
		}
	}
	catch (...) {
		SDL_free(joystick_ids);
		throw;
	}
	SDL_free(joystick_ids);

	return devices;
}

Napi::Value
joystick::getPowerInfo (Napi::Env &env, SDL_Joystick *joystick)
{
	int percent;
	SDL_PowerState state = SDL_GetJoystickPowerInfo(joystick, &percent);
	return mapPowerInfo(env, state, percent);
}

Napi::Value
joystick::mapPowerInfo (Napi::Env &env, SDL_PowerState _state, int _percent)
{
	auto state_entry = power::states.find(_state);
	Napi::Value state;
	if (state_entry != power::states.end()) {
		state = Napi::String::New(env, state_entry->second);
	}
	else {
		SDL_ClearError();
		state = env.Null();
	}
	Napi::Value percent = _percent != -1
		? Napi::Number::New(env, _percent)
		: env.Null();

	Napi::Object result = Napi::Object::New(env);
	result.Set("state", state);
	result.Set("percent", percent);

	return result;
}


Napi::Value
joystick::getDevices(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	return joystick::_getDevices(env);
}

Napi::Value
joystick::open (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int id = info[0].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_OpenJoystick(id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_OpenJoystick(" << id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	// SDL_OpenJoystick produces errors even though it succeeds
	const char *error = SDL_GetError();
	if (error[0] != '\0') { fprintf(stderr, "SDL silent error: %s\n", error); }
	SDL_ClearError();

	try {
		int _firmware_version = SDL_GetJoystickFirmwareVersion(joystick);
		Napi::Value firmware_version = _firmware_version != 0
			? Napi::Number::New(env, _firmware_version)
			: env.Null();

		const char *_serial_number = SDL_GetJoystickSerial(joystick);
		Napi::Value serial_number = _serial_number != nullptr
			? Napi::String::New(env, _serial_number)
			: env.Null();

		SDL_PropertiesID props = SDL_GetJoystickProperties(joystick);
		bool has_led = SDL_GetBooleanProperty(props, SDL_PROP_JOYSTICK_CAP_RGB_LED_BOOLEAN, false);
		bool has_rumble = SDL_GetBooleanProperty(props, SDL_PROP_JOYSTICK_CAP_RUMBLE_BOOLEAN, false);
		bool has_rumble_triggers = SDL_GetBooleanProperty(props, SDL_PROP_JOYSTICK_CAP_TRIGGER_RUMBLE_BOOLEAN, false);

		int num_axes = SDL_GetNumJoystickAxes(joystick);
		if (num_axes < 0) {
			std::ostringstream message;
			message << "SDL_GetNumJoystickAxes(" << id << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		Napi::Array axes = Napi::Array::New(env, num_axes);

		for (int i = 0; i < num_axes; i++) {
			// Clear any stale error, since failure is detected via the error state
			SDL_ClearError();
			double value = joystick::mapAxis(joystick, i);
			error = SDL_GetError();
			if (error[0] != '\0') {
				std::ostringstream message;
				message << "SDL_GetJoystickAxis(" << id << ", " << i << ") error: " << error;
				SDL_ClearError();
				throw Napi::Error::New(env, message.str());
			}
			axes.Set(i, value);
		}

		int num_balls = SDL_GetNumJoystickBalls(joystick);
		if (num_balls < 0) {
			std::ostringstream message;
			message << "SDL_GetNumJoystickBalls(" << id << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		Napi::Array balls = Napi::Array::New(env, num_balls);

		for (int i = 0; i < num_balls; i++) {
			Napi::Object ball = Napi::Object::New(env);
			ball.Set("x", 0);
			ball.Set("y", 0);

			balls.Set(i, ball);
		}

		int num_buttons = SDL_GetNumJoystickButtons(joystick);
		if (num_buttons < 0) {
			std::ostringstream message;
			message << "SDL_GetNumJoystickButtons(" << id << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		Napi::Array buttons = Napi::Array::New(env, num_buttons);

		for (int i = 0; i < num_buttons; i++) {
			bool pressed = SDL_GetJoystickButton(joystick, i);
			buttons.Set(i, pressed);
		}

		int num_hats = SDL_GetNumJoystickHats(joystick);
		if (num_hats < 0) {
			std::ostringstream message;
			message << "SDL_GetNumJoystickHats(" << id << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		Napi::Array hats = Napi::Array::New(env, num_hats);

		for (int i = 0; i < num_hats; i++) {
			int hat_position = SDL_GetJoystickHat(joystick, i);
			auto hat_position_entry = joystick::hat_positions.find(hat_position);
			Napi::Value hat_position_name = hat_position_entry != joystick::hat_positions.end()
				? Napi::String::New(env, hat_position_entry->second)
				: env.Null();
			hats.Set(i, hat_position_name);
		}

		Napi::Value power = getPowerInfo(env, joystick);

		Napi::Object result = Napi::Object::New(env);
		result.Set("firmwareVersion", firmware_version);
		result.Set("serialNumber", serial_number);
		result.Set("hasLed", has_led);
		result.Set("hasRumble", has_rumble);
		result.Set("hasRumbleTriggers", has_rumble_triggers);
		result.Set("axes", axes);
		result.Set("balls", balls);
		result.Set("buttons", buttons);
		result.Set("hats", hats);
		result.Set("power", power);

		return result;
	}
	catch (...) {
		SDL_CloseJoystick(joystick);
		throw;
	}
}

Napi::Value
joystick::rumble (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int joystick_id = info[0].As<Napi::Number>().Int32Value();
	int low_freq_rumble = info[1].As<Napi::Number>().Int32Value();
	int high_freq_rumble = info[2].As<Napi::Number>().Int32Value();
	int duration = info[3].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_GetJoystickFromID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_GetJoystickFromID(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_RumbleJoystick(joystick, low_freq_rumble, high_freq_rumble, duration)) {
		std::ostringstream message;
		message << "SDL_RumbleJoystick(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
joystick::setLed (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int joystick_id = info[0].As<Napi::Number>().Int32Value();
	double red = info[1].As<Napi::Number>().DoubleValue();
	double green = info[2].As<Napi::Number>().DoubleValue();
	double blue = info[3].As<Napi::Number>().DoubleValue();

	SDL_Joystick *joystick = SDL_GetJoystickFromID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_GetJoystickFromID(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_SetJoystickLED(joystick, std::lround(red * 0xFF), std::lround(green * 0xFF), std::lround(blue * 0xFF))) {
		std::ostringstream message;
		message << "SDL_SetJoystickLED(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
joystick::setPlayer (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int joystick_id = info[0].As<Napi::Number>().Int32Value();
	int player = info[1].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_GetJoystickFromID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_GetJoystickFromID(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_SetJoystickPlayerIndex(joystick, player)) {
		std::ostringstream message;
		message << "SDL_SetJoystickPlayerIndex(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	int _player = SDL_GetJoystickPlayerIndex(joystick);
	return _player != -1
		? Napi::Number::New(env, _player)
		: env.Null();
}

Napi::Value
joystick::rumbleTriggers (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int joystick_id = info[0].As<Napi::Number>().Int32Value();
	int left_rumble = info[1].As<Napi::Number>().Int32Value();
	int right_rumble = info[2].As<Napi::Number>().Int32Value();
	int duration = info[3].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_GetJoystickFromID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_GetJoystickFromID(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_RumbleJoystickTriggers(joystick, left_rumble, right_rumble, duration)) {
		std::ostringstream message;
		message << "SDL_RumbleJoystickTriggers(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
joystick::close (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int joystick_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_GetJoystickFromID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_GetJoystickFromID(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_CloseJoystick(joystick);

	return env.Undefined();
}
