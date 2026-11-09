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
	joystick::JoysticksLock joysticks_lock;

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
		global::SdlPtr<char> _gamepad_mapping(SDL_GetGamepadMappingForID(id));
		if (_gamepad_mapping) { gamepad_mapping = _gamepad_mapping.get(); }

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
	global::SdlArray<SDL_JoystickID> joystick_ids(SDL_GetJoysticks(&num_devices));
	if (!joystick_ids) {
		throw global::sdlError(env, "SDL_GetJoysticks");
	}

	Napi::Array devices = Napi::Array::New(env, num_devices);

	for (int i = 0; i < num_devices; i++) {
		devices.Set(i, joystick::_getDevice(joystick_ids[i]).toNapi(env));
	}

	return devices;
}

packed::Value
joystick::getPowerInfo (SDL_Joystick *joystick)
{
	int percent;
	SDL_PowerState state = SDL_GetJoystickPowerInfo(joystick, &percent);
	return mapPowerInfo(state, percent);
}

const char *
joystick::getState (SDL_Joystick *joystick, packed::Value &dst)
{
	int num_axes = SDL_GetNumJoystickAxes(joystick);
	if (num_axes < 0) {
		return "SDL_GetNumJoystickAxes";
	}

	packed::Value axes = packed::Value::array();
	for (int i = 0; i < num_axes; i++) {
		axes.push(joystick::mapAxis(joystick, i));
	}

	int num_balls = SDL_GetNumJoystickBalls(joystick);
	if (num_balls < 0) {
		return "SDL_GetNumJoystickBalls";
	}

	packed::Value balls = packed::Value::array();
	for (int i = 0; i < num_balls; i++) {
		packed::Value ball = packed::Value::object();
		ball.set("x", 0);
		ball.set("y", 0);
		balls.push(std::move(ball));
	}

	int num_buttons = SDL_GetNumJoystickButtons(joystick);
	if (num_buttons < 0) {
		return "SDL_GetNumJoystickButtons";
	}

	packed::Value buttons = packed::Value::array();
	for (int i = 0; i < num_buttons; i++) {
		buttons.push(SDL_GetJoystickButton(joystick, i));
	}

	int num_hats = SDL_GetNumJoystickHats(joystick);
	if (num_hats < 0) {
		return "SDL_GetNumJoystickHats";
	}

	packed::Value hats = packed::Value::array();
	for (int i = 0; i < num_hats; i++) {
		auto hat_position_entry = joystick::hat_positions.find(SDL_GetJoystickHat(joystick, i));
		packed::Value hat_position;
		if (hat_position_entry != joystick::hat_positions.end()) { hat_position = packed::Value::ref(hat_position_entry->second); }
		hats.push(std::move(hat_position));
	}

	dst.set("axes", std::move(axes));
	dst.set("balls", std::move(balls));
	dst.set("buttons", std::move(buttons));
	dst.set("hats", std::move(hats));
	return nullptr;
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

	std::lock_guard<std::recursive_mutex> guard(global::lock());
	global::assertReady(env);

	return joystick::_getDevices(env);
}

Napi::Value
joystick::open (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::recursive_mutex> guard(global::lock());
	global::assertReady(env);

	SDL_JoystickID id = info[0].As<Napi::Number>().Uint32Value();

	SDL_Joystick *joystick = SDL_OpenJoystick(id);
	if (joystick == nullptr) {
		throw global::sdlError(env, "SDL_OpenJoystick", id);
	}
	SDL_ClearError();

	threads::trackOpen(env, threads::JOYSTICK, id);

	try {
		int _firmware_version = SDL_GetJoystickFirmwareVersion(joystick);
		packed::Value firmware_version;
		if (_firmware_version != 0) { firmware_version = _firmware_version; }

		const char *_serial_number = SDL_GetJoystickSerial(joystick);
		packed::Value serial_number;
		if (_serial_number != nullptr) { serial_number = _serial_number; }

		packed::Value result = packed::Value::object();
		result.set("firmwareVersion", std::move(firmware_version));
		result.set("serialNumber", std::move(serial_number));
		result.set("power", getPowerInfo(joystick));

		const char *failed_call = joystick::getState(joystick, result);
		if (failed_call != nullptr) {
			throw global::sdlError(env, failed_call, id);
		}

		return result.toNapi(env);
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

	std::lock_guard<std::recursive_mutex> guard(global::lock());
	global::assertReady(env);

	SDL_JoystickID joystick_id = info[0].As<Napi::Number>().Uint32Value();
	int low_freq_rumble = info[1].As<Napi::Number>().Int32Value();
	int high_freq_rumble = info[2].As<Napi::Number>().Int32Value();
	int duration = info[3].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = global::fromIdOrThrow(env, SDL_GetJoystickFromID(joystick_id), "SDL_GetJoystickFromID", "joystick", joystick_id);

	if (!SDL_RumbleJoystick(joystick, low_freq_rumble, high_freq_rumble, duration)) {
		throw global::sdlError(env, "SDL_RumbleJoystick", joystick_id);
	}

	return env.Undefined();
}

Napi::Value
joystick::getCapabilities (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::recursive_mutex> guard(global::lock());
	global::assertReady(env);

	SDL_JoystickID joystick_id = info[0].As<Napi::Number>().Uint32Value();

	SDL_Joystick *joystick = global::fromIdOrThrow(env, SDL_GetJoystickFromID(joystick_id), "SDL_GetJoystickFromID", "joystick", joystick_id);

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

	std::lock_guard<std::recursive_mutex> guard(global::lock());
	global::assertReady(env);

	SDL_JoystickID joystick_id = info[0].As<Napi::Number>().Uint32Value();
	double red = info[1].As<Napi::Number>().DoubleValue();
	double green = info[2].As<Napi::Number>().DoubleValue();
	double blue = info[3].As<Napi::Number>().DoubleValue();

	SDL_Joystick *joystick = global::fromIdOrThrow(env, SDL_GetJoystickFromID(joystick_id), "SDL_GetJoystickFromID", "joystick", joystick_id);

	if (!SDL_SetJoystickLED(joystick, std::lround(red * 0xFF), std::lround(green * 0xFF), std::lround(blue * 0xFF))) {
		throw global::sdlError(env, "SDL_SetJoystickLED", joystick_id);
	}

	return env.Undefined();
}

Napi::Value
joystick::setPlayer (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::recursive_mutex> guard(global::lock());
	global::assertReady(env);

	SDL_JoystickID joystick_id = info[0].As<Napi::Number>().Uint32Value();
	int player = info[1].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = global::fromIdOrThrow(env, SDL_GetJoystickFromID(joystick_id), "SDL_GetJoystickFromID", "joystick", joystick_id);

	if (!SDL_SetJoystickPlayerIndex(joystick, player)) {
		throw global::sdlError(env, "SDL_SetJoystickPlayerIndex", joystick_id);
	}

	return env.Undefined();
}

Napi::Value
joystick::rumbleTriggers (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::recursive_mutex> guard(global::lock());
	global::assertReady(env);

	SDL_JoystickID joystick_id = info[0].As<Napi::Number>().Uint32Value();
	int left_rumble = info[1].As<Napi::Number>().Int32Value();
	int right_rumble = info[2].As<Napi::Number>().Int32Value();
	int duration = info[3].As<Napi::Number>().Int32Value();

	SDL_Joystick *joystick = global::fromIdOrThrow(env, SDL_GetJoystickFromID(joystick_id), "SDL_GetJoystickFromID", "joystick", joystick_id);

	if (!SDL_RumbleJoystickTriggers(joystick, left_rumble, right_rumble, duration)) {
		throw global::sdlError(env, "SDL_RumbleJoystickTriggers", joystick_id);
	}

	return env.Undefined();
}

Napi::Value
joystick::close (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::recursive_mutex> guard(global::lock());
	global::assertReady(env);

	SDL_JoystickID joystick_id = info[0].As<Napi::Number>().Uint32Value();

	threads::trackClose(env, threads::JOYSTICK, joystick_id);

	SDL_Joystick *joystick = global::fromIdOrThrow(env, SDL_GetJoystickFromID(joystick_id), "SDL_GetJoystickFromID", "joystick", joystick_id);

	SDL_CloseJoystick(joystick);

	return env.Undefined();
}
