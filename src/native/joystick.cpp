#include "joystick.h"
#include "global.h"
#include <SDL.h>
#include <string>
#include <sstream>
#include <map>


std::map<Uint8, std::string> joystick::hat_positions;
std::map<SDL_JoystickType, std::string> joystick::joystick_types;
std::map<SDL_JoystickPowerLevel, std::string> joystick::power_levels;


double
joystick::mapAxis (int value) {
	const static int SDL_JOYSTICK_AXIS_RANGE = SDL_JOYSTICK_AXIS_MAX - SDL_JOYSTICK_AXIS_MIN;
	return (value - SDL_JOYSTICK_AXIS_MIN) / (SDL_JOYSTICK_AXIS_RANGE / 2.0) - 1;
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

		SDL_JoystickType type = SDL_JoystickGetDeviceType(i);
		// This function can only error if the index is invalid.

		const char *name = SDL_JoystickNameForIndex(i);
		if (name == nullptr) {
			std::ostringstream message;
			message << "SDL_JoystickNameForIndex(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		const char *path = SDL_JoystickPathForIndex(i);
		if (path == nullptr) {
			std::ostringstream message;
			message << "SDL_JoystickPathForIndex(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		SDL_JoystickGUID guid = SDL_JoystickGetDeviceGUID(i);
		// This function can only error if the index is invalid.

		char guid_string[33];
		SDL_JoystickGetGUIDString(guid, guid_string, 33);

		int vendor_number = SDL_JoystickGetDeviceVendor(i);
		Napi::Value vendor = vendor_number == 0 ? env.Null() : Napi::Number::New(env, vendor_number);

		int product_number = SDL_JoystickGetDeviceProduct(i);
		Napi::Value product = product_number == 0 ? env.Null() : Napi::Number::New(env, product_number);

		int version_number = SDL_JoystickGetDeviceProductVersion(i);
		Napi::Value version = version_number == 0 ? env.Null() : Napi::Number::New(env, version_number);

		int player_number = SDL_JoystickGetDevicePlayerIndex(i);
		Napi::Value player = player_number == -1 ? env.Null() : Napi::Number::New(env, player_number);

		bool is_controller = SDL_IsGameController(i);

		Napi::Value mapping;
		if (is_controller) {
			const char *device_mapping = SDL_GameControllerMappingForDeviceIndex(i);
			if (device_mapping == nullptr) {
				std::ostringstream message;
				message << "SDL_GameControllerMappingForDeviceIndex(" << i << ") error: " << SDL_GetError();
				SDL_ClearError();
				throw Napi::Error::New(env, message.str());
			}
			mapping = Napi::String::New(env, device_mapping);
		} else {
			mapping = env.Null();
		}

		Napi::Object device = Napi::Object::New(env);
		device.Set("_index", Napi::Number::New(env, i));
		device.Set("id", Napi::Number::New(env, id));
		device.Set("type", joystick::joystick_types[type]);
		device.Set("name", Napi::String::New(env, name));
		device.Set("path", Napi::String::New(env, path));
		device.Set("guid", Napi::String::New(env, guid_string));
		device.Set("vendor", vendor);
		device.Set("product", product);
		device.Set("version", version);
		device.Set("player", player);
		device.Set("isController", Napi::Boolean::New(env, is_controller));
		device.Set("mapping", mapping);

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

	SDL_JoystickID joystick_id = SDL_JoystickInstanceID(joystick);
	if (joystick_id < 0) {
		std::ostringstream message;
		message << "SDL_JoystickInstanceID(" << index << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	int firmware = SDL_JoystickGetFirmwareVersion(joystick);
	Napi::Value firmware_version = firmware == 0 ? env.Null() : Napi::Number::New(env, firmware);

	const char *serial = SDL_JoystickGetSerial(joystick);
	Napi::Value serial_number = serial == nullptr ? env.Null() : Napi::String::New(env, serial);

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

	const char *error = SDL_GetError();
	if (error != global::no_error) { fprintf(stderr, "SDL silent error: %s\n", error); }
	SDL_ClearError();

	for (int i = 0; i < num_axes; i++) {
		double value = joystick::mapAxis(SDL_JoystickGetAxis(joystick, i));
		error = SDL_GetError();
		if (error != global::no_error) {
			std::ostringstream message;
			message << "SDL_JoystickGetAxis(" << index << ", " << i << ") error: " << error;
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}
		axes.Set(i, Napi::Number::New(env, value));
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
		ball.Set("x", Napi::Number::New(env, dx));
		ball.Set("y", Napi::Number::New(env, dy));

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
		int pressed = SDL_JoystickGetButton(joystick, i);
		buttons.Set(i, Napi::Boolean::New(env, pressed));
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
	// result.Set("id", Napi::Number::New(env, joystick_id)); // NOTE: Unused. Same as the device id
	result.Set("firmwareVersion", firmware_version);
	result.Set("serialNumber", serial_number);
	result.Set("hasLed", Napi::Boolean::New(env, has_led));
	result.Set("hasRumble", Napi::Boolean::New(env, has_rumble));
	result.Set("hasRumbleTriggers", Napi::Boolean::New(env, has_rumble_triggers));
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
