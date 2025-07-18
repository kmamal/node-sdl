#include "joystick.h"
#include "controller.h"
#include "global.h"
#include <SDL.h>
#include <string>
#include <sstream>
#include <map>


std::map<Uint8, std::string> joystick::hat_positions;
std::map<SDL_JoystickType, std::string> joystick::types;
std::map<SDL_JoystickPowerLevel, std::string> joystick::power_levels;
SDL_JoystickGUID joystick::zero_guid;

double
joystick::mapAxis (SDL_Joystick *joystick, int axis) {
	return mapAxisValue(joystick, axis, SDL_JoystickGetAxis(joystick, axis));
}

double
joystick::mapAxisValue (SDL_Joystick *joystick, int axis, int value) {
	Sint16 initial;
	if (!SDL_JoystickGetAxisInitialState(joystick, axis, &initial)) { initial = 0; }
	double range = value < initial
		? initial - SDL_JOYSTICK_AXIS_MIN
		: SDL_JOYSTICK_AXIS_MAX - initial;
	return (value - initial) / range;
}

Napi::Array
joystick::_getDevices (Napi::Env &env)
{
	int num_devices = SDL_NumJoysticks();
	if (num_devices < 0) {
		std::ostringstream message;
		message << "SDL_NumJoysticks() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array devices = Napi::Array::New(env, num_devices);

	for (int i = 0; i < num_devices; i++) {
		int id = SDL_JoystickGetDeviceInstanceID(i);
		if (id == -1) {
			std::ostringstream message;
			message << "SDL_JoystickGetDeviceInstanceID(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		const char *_name = SDL_JoystickNameForIndex(i);
		Napi::Value name = _name != nullptr
			? Napi::String::New(env, _name)
			: env.Null();

		const char *_path = SDL_JoystickPathForIndex(i);
		Napi::Value path = _path != nullptr
			? Napi::String::New(env, _path)
			: env.Null();

		SDL_JoystickGUID _guid = SDL_JoystickGetDeviceGUID(i);
		Napi::Value guid;
		if (SDL_memcmp(&_guid, &zero_guid, sizeof(SDL_JoystickGUID)) != 0) {
			char guid_string[33];
			SDL_JoystickGetGUIDString(_guid, guid_string, 33);
			guid = Napi::String::New(env, guid_string);
		}
		else {
			guid = env.Null();
		}

		SDL_JoystickType _type = SDL_JoystickGetDeviceType(i);
		Napi::Value type = _type != SDL_JOYSTICK_TYPE_UNKNOWN
			? Napi::String::New(env, joystick::types[_type])
			: env.Null();

		int _vendor = SDL_JoystickGetDeviceVendor(i);
		Napi::Value vendor = _vendor != 0
			? Napi::Number::New(env, _vendor)
			: env.Null();

		int _product = SDL_JoystickGetDeviceProduct(i);
		Napi::Value product = _product != 0
			? Napi::Number::New(env, _product)
			: env.Null();

		int _Version = SDL_JoystickGetDeviceProductVersion(i);
		Napi::Value version = _Version != 0
			? Napi::Number::New(env, _Version)
			: env.Null();

		int _player = SDL_JoystickGetDevicePlayerIndex(i);
		Napi::Value player = _player != -1
			? Napi::Number::New(env, _player)
			: env.Null();

		bool is_controller = SDL_IsGameController(i);

		Napi::Value controller_mapping;
		Napi::Value controller_name;
		Napi::Value controller_type;

		if (is_controller) {
			char *_controller_mapping = SDL_GameControllerMappingForDeviceIndex(i);
			controller_mapping = _controller_mapping != nullptr
				? Napi::String::New(env, _controller_mapping)
				: env.Null();
			SDL_free(_controller_mapping);

			const char *_controller_name = SDL_GameControllerNameForIndex(i);
			controller_name = _controller_name != nullptr
				? Napi::String::New(env, _controller_name)
				: env.Null();

			SDL_GameControllerType _controller_type = SDL_GameControllerTypeForIndex(i);
			controller_type = _controller_type != SDL_CONTROLLER_TYPE_UNKNOWN
				? Napi::String::New(env, controller::types[_controller_type])
				: env.Null();
		}
		else {
				controller_mapping = env.Null();
				controller_name = env.Null();
				controller_type = env.Null();
		}

		Napi::Object device = Napi::Object::New(env);
		device.Set("_index", i);
		device.Set("id", id);
		device.Set("name", name);
		device.Set("path", path);
		device.Set("type", type);
		device.Set("guid", guid);
		device.Set("vendor", vendor);
		device.Set("product", product);
		device.Set("version", version);
		device.Set("player", player);
		device.Set("isController", is_controller);
		device.Set("controllerMapping", controller_mapping);
		device.Set("controllerName", controller_name);
		device.Set("controllerType", controller_type);

		devices.Set(i, device);
	}

	return devices;
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

	int index = info[0].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_JoystickOpen(index);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_JoystickOpen(" << index << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	// SDL_JoystickOpen produces errors even though it succeeds
	const char *error = SDL_GetError();
	if (error != global::no_error) { fprintf(stderr, "SDL silent error: %s\n", error); }
	SDL_ClearError();

	int _firmware_version = SDL_JoystickGetFirmwareVersion(joystick);
	Napi::Value firmware_version = _firmware_version != 0
		? Napi::Number::New(env, _firmware_version)
		: env.Null();

	const char *_serial_number = SDL_JoystickGetSerial(joystick);
	Napi::Value serial_number = _serial_number != nullptr
		? Napi::String::New(env, _serial_number)
		: env.Null();

	SDL_bool has_led = SDL_JoystickHasLED(joystick);
	SDL_bool has_rumble = SDL_JoystickHasRumble(joystick);
	SDL_bool has_rumble_triggers = SDL_JoystickHasRumbleTriggers(joystick);

	int num_axes = SDL_JoystickNumAxes(joystick);
	if (num_axes < 0) {
		std::ostringstream message;
		message << "SDL_JoystickNumAxes(" << index << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array axes = Napi::Array::New(env, num_axes);

	for (int i = 0; i < num_axes; i++) {
		double value = joystick::mapAxis(joystick, i);
		error = SDL_GetError();
		if (error != global::no_error) {
			std::ostringstream message;
			message << "SDL_JoystickGetAxis(" << index << ", " << i << ") error: " << error;
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}
		axes.Set(i, value);
	}

	int num_balls = SDL_JoystickNumBalls(joystick);
	if (num_balls < 0) {
		std::ostringstream message;
		message << "SDL_JoystickNumBalls(" << index << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array balls = Napi::Array::New(env, num_balls);

	for (int i = 0; i < num_balls; i++) {
		int dx, dy;
		if (SDL_JoystickGetBall(joystick, i, &dx, &dy) == -1) {
			std::ostringstream message;
			message << "SDL_JoystickGetBall(" << index << ", " << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		Napi::Object ball = Napi::Object::New(env);
		ball.Set("x", dx);
		ball.Set("y", dy);

		balls.Set(i, ball);
	}

	int num_buttons = SDL_JoystickNumButtons(joystick);
	if (num_buttons < 0) {
		std::ostringstream message;
		message << "SDL_JoystickNumButtons(" << index << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array buttons = Napi::Array::New(env, num_buttons);

	for (int i = 0; i < num_buttons; i++) {
		bool pressed = SDL_JoystickGetButton(joystick, i);
		buttons.Set(i, pressed);
	}

	int num_hats = SDL_JoystickNumHats(joystick);
	if (num_hats < 0) {
		std::ostringstream message;
		message << "SDL_JoystickNumHats(" << index << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array hats = Napi::Array::New(env, num_hats);

	for (int i = 0; i < num_hats; i++) {
		int hat_position = SDL_JoystickGetHat(joystick, i);
		hats.Set(i, joystick::hat_positions[hat_position]);
	}

	Napi::Object result = Napi::Object::New(env);
	result.Set("firmwareVersion", firmware_version);
	result.Set("serialNumber", serial_number);
	result.Set("hasLed", !!has_led);
	result.Set("hasRumble", !!has_rumble);
	result.Set("hasRumbleTriggers", !!has_rumble_triggers);
	result.Set("axes", axes);
	result.Set("balls", balls);
	result.Set("buttons", buttons);
	result.Set("hats", hats);

	return result;
}

Napi::Value
joystick::getPower (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int joystick_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_JoystickFromInstanceID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_JoystickFromInstanceID(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_JoystickPowerLevel power_level = SDL_JoystickCurrentPowerLevel(joystick);
	if (power_level == SDL_JOYSTICK_POWER_UNKNOWN) { return env.Null(); }

	return Napi::String::New(env, joystick::power_levels[power_level]);
}

Napi::Value
joystick::rumble (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int joystick_id = info[0].As<Napi::Number>().Int32Value();
	double low_freq_rumble = info[1].As<Napi::Number>().DoubleValue();
	double high_freq_rumble = info[2].As<Napi::Number>().DoubleValue();
	int duration = info[3].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_JoystickFromInstanceID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_JoystickFromInstanceID(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (SDL_JoystickRumble(joystick, low_freq_rumble * 0xFFFF, high_freq_rumble * 0xFFFF, duration) == -1) {
		std::ostringstream message;
		message << "SDL_JoystickRumble(" << joystick_id << ") error: " << SDL_GetError();
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

	SDL_Joystick *joystick = SDL_JoystickFromInstanceID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_JoystickFromInstanceID(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (SDL_JoystickSetLED(joystick, red * 0xFF, green * 0xFF, blue * 0xFF) == -1) {
		std::ostringstream message;
		message << "SDL_JoystickSetLED(" << joystick_id << ") error: " << SDL_GetError();
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

	SDL_Joystick *joystick = SDL_JoystickFromInstanceID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_JoystickFromInstanceID(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_JoystickSetPlayerIndex(joystick, player);

	return env.Undefined();
}

Napi::Value
joystick::rumbleTriggers (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int joystick_id = info[0].As<Napi::Number>().Int32Value();
	double left_rumble = info[1].As<Napi::Number>().DoubleValue();
	double right_rumble = info[2].As<Napi::Number>().DoubleValue();
	int duration = info[3].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = SDL_JoystickFromInstanceID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_JoystickFromInstanceID(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (SDL_JoystickRumbleTriggers(joystick, left_rumble * 0xFFFF, right_rumble * 0xFFFF, duration) == -1) {
		std::ostringstream message;
		message << "SDL_JoystickRumbleTriggers(" << joystick_id << ") error: " << SDL_GetError();
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

	SDL_Joystick *joystick = SDL_JoystickFromInstanceID(joystick_id);
	if (joystick == nullptr) {
		std::ostringstream message;
		message << "SDL_JoystickFromInstanceID(" << joystick_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_JoystickClose(joystick);

	return env.Undefined();
}
