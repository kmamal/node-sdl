#include "joystick.h"
#include "global.h"
#include "threads.h"
#include "gamepad.h"
#include "power.h"
#include <SDL3/SDL.h>
#include <string>
#include <map>
#include <cmath>


std::map<Uint8, packed::Str> joystick::hat_positions;
std::map<SDL_JoystickType, packed::Str> joystick::types;
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

packed::Value
joystick::_getDevice (SDL_JoystickID id)
{
	const char *_name = SDL_GetJoystickNameForID(id);
	packed::Value name;
	if (_name != nullptr) { name = _name; }

	const char *_path = SDL_GetJoystickPathForID(id);
	packed::Value path;
	if (_path != nullptr) { path = _path; }

	SDL_GUID _guid = SDL_GetJoystickGUIDForID(id);
	packed::Value guid;
	if (SDL_memcmp(&_guid, &joystick::zero_guid, sizeof(SDL_GUID)) != 0) {
		char guid_string[33];
		SDL_GUIDToString(_guid, guid_string, 33);
		guid = guid_string;
	}

	SDL_JoystickType _type = SDL_GetJoystickTypeForID(id);
	auto type_entry = joystick::types.find(_type);
	packed::Value type;
	if (type_entry != joystick::types.end()) { type = packed::Value::ref(type_entry->second); }

	int _vendor = SDL_GetJoystickVendorForID(id);
	packed::Value vendor;
	if (_vendor != 0) { vendor = _vendor; }

	int _product = SDL_GetJoystickProductForID(id);
	packed::Value product;
	if (_product != 0) { product = _product; }

	int _version = SDL_GetJoystickProductVersionForID(id);
	packed::Value version;
	if (_version != 0) { version = _version; }

	int _player = SDL_GetJoystickPlayerIndexForID(id);
	packed::Value player;
	if (_player != -1) { player = _player; }

	bool is_gamepad = SDL_IsGamepad(id);

	packed::Value gamepad_mapping;
	packed::Value gamepad_name;
	packed::Value gamepad_type;

	if (is_gamepad) {
		char *_gamepad_mapping = SDL_GetGamepadMappingForID(id);
		if (_gamepad_mapping != nullptr) {
			gamepad_mapping = _gamepad_mapping;
			SDL_free(_gamepad_mapping);
		}

		const char *_gamepad_name = SDL_GetGamepadNameForID(id);
		if (_gamepad_name != nullptr) { gamepad_name = _gamepad_name; }

		SDL_GamepadType _gamepad_type = SDL_GetGamepadTypeForID(id);
		auto gamepad_type_entry = gamepad::types.find(_gamepad_type);
		if (gamepad_type_entry != gamepad::types.end()) { gamepad_type = packed::Value::ref(gamepad_type_entry->second); }
	}

	SDL_ClearError();

	packed::Value device = packed::Value::object();
	device.set("id", id);
	device.set("name", std::move(name));
	device.set("path", std::move(path));
	device.set("type", std::move(type));
	device.set("guid", std::move(guid));
	device.set("vendor", std::move(vendor));
	device.set("product", std::move(product));
	device.set("version", std::move(version));
	device.set("player", std::move(player));
	device.set("isGamepad", is_gamepad);
	device.set("gamepadMapping", std::move(gamepad_mapping));
	device.set("gamepadName", std::move(gamepad_name));
	device.set("gamepadType", std::move(gamepad_type));

	return device;
}

Napi::Array
joystick::_getDevices (Napi::Env &env)
{
	int num_devices;
	SDL_JoystickID *joystick_ids = SDL_GetJoysticks(&num_devices);
	if (joystick_ids == nullptr) {
		throw global::sdlError(env, "SDL_GetJoysticks");
	}

	Napi::Array devices = Napi::Array::New(env, num_devices);

	try {
		for (int i = 0; i < num_devices; i++) {
			devices.Set(i, joystick::_getDevice(joystick_ids[i]).toNapi(env));
		}
	}
	catch (...) {
		SDL_free(joystick_ids);
		throw;
	}
	SDL_free(joystick_ids);

	return devices;
}

packed::Value
joystick::getPowerInfo (SDL_Joystick *joystick)
{
	int percent;
	SDL_PowerState state = SDL_GetJoystickPowerInfo(joystick, &percent);
	return mapPowerInfo(state, percent);
}

packed::Value
joystick::mapPowerInfo (SDL_PowerState _state, int _percent)
{
	auto state_entry = power::states.find(_state);
	packed::Value state;
	if (state_entry != power::states.end()) { state = packed::Value::ref(state_entry->second); }
	else { SDL_ClearError(); }

	packed::Value percent;
	if (_percent != -1) { percent = _percent; }

	packed::Value result = packed::Value::object();
	result.set("state", std::move(state));
	result.set("percent", std::move(percent));

	return result;
}


Napi::Value
joystick::getDevices(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	return joystick::_getDevices(env);
}

Napi::Value
joystick::open (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int id = info[0].As<Napi::Number>().Int32Value();

	SDL_ClearError();
	SDL_Joystick *joystick = SDL_OpenJoystick(id);
	if (joystick == nullptr) {
		throw global::sdlError(env, "SDL_OpenJoystick", id);
	}

	// SDL_OpenJoystick produces errors even though it succeeds
	const char *error = SDL_GetError();
	if (error[0] != '\0') { fprintf(stderr, "SDL silent error: %s\n", error); }
	SDL_ClearError();

	threads::trackOpen(env, threads::JOYSTICK, id);

	try {
		int _firmware_version = SDL_GetJoystickFirmwareVersion(joystick);
		Napi::Value firmware_version = _firmware_version != 0
			? Napi::Number::New(env, _firmware_version)
			: env.Null();

		const char *_serial_number = SDL_GetJoystickSerial(joystick);
		Napi::Value serial_number = _serial_number != nullptr
			? Napi::String::New(env, _serial_number)
			: env.Null();

		int num_axes = SDL_GetNumJoystickAxes(joystick);
		if (num_axes < 0) {
			throw global::sdlError(env, "SDL_GetNumJoystickAxes", id);
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
			throw global::sdlError(env, "SDL_GetNumJoystickBalls", id);
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
			throw global::sdlError(env, "SDL_GetNumJoystickButtons", id);
		}

		Napi::Array buttons = Napi::Array::New(env, num_buttons);

		for (int i = 0; i < num_buttons; i++) {
			bool pressed = SDL_GetJoystickButton(joystick, i);
			buttons.Set(i, pressed);
		}

		int num_hats = SDL_GetNumJoystickHats(joystick);
		if (num_hats < 0) {
			throw global::sdlError(env, "SDL_GetNumJoystickHats", id);
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

		Napi::Value power = getPowerInfo(joystick).toNapi(env);

		Napi::Object result = Napi::Object::New(env);
		result.Set("firmwareVersion", firmware_version);
		result.Set("serialNumber", serial_number);
		result.Set("axes", axes);
		result.Set("balls", balls);
		result.Set("buttons", buttons);
		result.Set("hats", hats);
		result.Set("power", power);

		return result;
	}
	catch (...) {
		threads::trackClose(env, threads::JOYSTICK, id);
		SDL_CloseJoystick(joystick);
		throw;
	}
}

Napi::Value
joystick::rumble (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int joystick_id = info[0].As<Napi::Number>().Int32Value();
	int low_freq_rumble = info[1].As<Napi::Number>().Int32Value();
	int high_freq_rumble = info[2].As<Napi::Number>().Int32Value();
	int duration = info[3].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_GetJoystickFromID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_GetJoystickFromID(" << joystick_id << ") error: invalid joystick id";
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_RumbleJoystick(joystick, low_freq_rumble, high_freq_rumble, duration)) {
		throw global::sdlError(env, "SDL_RumbleJoystick", joystick_id);
	}

	return env.Undefined();
}

Napi::Value
joystick::getCapabilities (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int joystick_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_GetJoystickFromID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_GetJoystickFromID(" << joystick_id << ") error: invalid joystick id";
		throw Napi::Error::New(env, message.str());
	}

	SDL_PropertiesID props = SDL_GetJoystickProperties(joystick);
	if (props == 0) {
		throw global::sdlError(env, "SDL_GetJoystickProperties", joystick_id);
	}

	Napi::Object result = Napi::Object::New(env);
	result.Set("hasLed", SDL_GetBooleanProperty(props, SDL_PROP_JOYSTICK_CAP_RGB_LED_BOOLEAN, false) || SDL_GetBooleanProperty(props, SDL_PROP_JOYSTICK_CAP_MONO_LED_BOOLEAN, false));
	result.Set("hasRumble", SDL_GetBooleanProperty(props, SDL_PROP_JOYSTICK_CAP_RUMBLE_BOOLEAN, false));
	result.Set("hasRumbleTriggers", SDL_GetBooleanProperty(props, SDL_PROP_JOYSTICK_CAP_TRIGGER_RUMBLE_BOOLEAN, false));

	return result;
}

Napi::Value
joystick::setLed (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int joystick_id = info[0].As<Napi::Number>().Int32Value();
	double red = info[1].As<Napi::Number>().DoubleValue();
	double green = info[2].As<Napi::Number>().DoubleValue();
	double blue = info[3].As<Napi::Number>().DoubleValue();

	SDL_Joystick *joystick = SDL_GetJoystickFromID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_GetJoystickFromID(" << joystick_id << ") error: invalid joystick id";
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_SetJoystickLED(joystick, std::lround(red * 0xFF), std::lround(green * 0xFF), std::lround(blue * 0xFF))) {
		throw global::sdlError(env, "SDL_SetJoystickLED", joystick_id);
	}

	return env.Undefined();
}

Napi::Value
joystick::setPlayer (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int joystick_id = info[0].As<Napi::Number>().Int32Value();
	int player = info[1].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_GetJoystickFromID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_GetJoystickFromID(" << joystick_id << ") error: invalid joystick id";
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_SetJoystickPlayerIndex(joystick, player)) {
		throw global::sdlError(env, "SDL_SetJoystickPlayerIndex", joystick_id);
	}

	return env.Undefined();
}

Napi::Value
joystick::rumbleTriggers (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int joystick_id = info[0].As<Napi::Number>().Int32Value();
	int left_rumble = info[1].As<Napi::Number>().Int32Value();
	int right_rumble = info[2].As<Napi::Number>().Int32Value();
	int duration = info[3].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_GetJoystickFromID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_GetJoystickFromID(" << joystick_id << ") error: invalid joystick id";
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_RumbleJoystickTriggers(joystick, left_rumble, right_rumble, duration)) {
		throw global::sdlError(env, "SDL_RumbleJoystickTriggers", joystick_id);
	}

	return env.Undefined();
}

Napi::Value
joystick::close (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int joystick_id = info[0].As<Napi::Number>().Int32Value();

	threads::trackClose(env, threads::JOYSTICK, joystick_id);

	SDL_Joystick *joystick = SDL_GetJoystickFromID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_GetJoystickFromID(" << joystick_id << ") error: invalid joystick id";
		throw Napi::Error::New(env, message.str());
	}

	SDL_CloseJoystick(joystick);

	return env.Undefined();
}
