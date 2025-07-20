#include "controller.h"
#include "joystick.h"
#include "global.h"
#include <SDL.h>
#include <map>
#include <string>
#include <sstream>


std::map<SDL_GameControllerType, std::string> controller::types;
std::map<SDL_GameControllerAxis, std::string> controller::axes;
std::map<SDL_GameControllerButton, std::string> controller::buttons;


double
controller::mapAxis (SDL_GameController *controller, SDL_GameControllerAxis axis) {
	return mapAxisValue(controller, axis, SDL_GameControllerGetAxis(controller, axis));
}

double
controller::mapAxisValue (SDL_GameController *controller, SDL_GameControllerAxis axis, int value) {
	SDL_GameControllerButtonBind bind = SDL_GameControllerGetBindForAxis(controller, axis);
	if (bind.bindType == SDL_CONTROLLER_BINDTYPE_AXIS) {
		SDL_Joystick *joystick = SDL_GameControllerGetJoystick(controller);
		return joystick::mapAxisValue(joystick, bind.value.axis, value);
	}

	double range = value < 0 ? -SDL_JOYSTICK_AXIS_MIN : SDL_JOYSTICK_AXIS_MAX;
	return value / range;
}

Napi::Value
controller::getSteamHandle (Napi::Env &env, SDL_GameController *controller)
{
	Uint64 _steam_handle = SDL_GameControllerGetSteamHandle(controller);
	return _steam_handle != 0
		? Napi::Buffer<Uint64>::Copy(env, &_steam_handle, 1)
		: env.Null();
}

void
controller::getState (Napi::Env &env, SDL_GameController *controller, Napi::Object dst)
{
	Napi::Object axes = Napi::Object::New(env);
	axes.Set("leftStickX", controller::mapAxis(controller, SDL_CONTROLLER_AXIS_LEFTX));
	axes.Set("leftStickY", controller::mapAxis(controller, SDL_CONTROLLER_AXIS_LEFTY));
	axes.Set("rightStickX", controller::mapAxis(controller, SDL_CONTROLLER_AXIS_RIGHTX));
	axes.Set("rightStickY", controller::mapAxis(controller, SDL_CONTROLLER_AXIS_RIGHTY));
	axes.Set("leftTrigger", controller::mapAxis(controller, SDL_CONTROLLER_AXIS_TRIGGERLEFT));
	axes.Set("rightTrigger", controller::mapAxis(controller, SDL_CONTROLLER_AXIS_TRIGGERRIGHT));

	const char *error;

	error = SDL_GetError();
	if (error != global::no_error) {
		std::ostringstream message;
		message << "SDL_GameControllerGetAxis() error: " << error;
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Object buttons = Napi::Object::New(env);
	buttons.Set("dpadLeft", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_LEFT));
	buttons.Set("dpadRight", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_RIGHT));
	buttons.Set("dpadUp", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_UP));
	buttons.Set("dpadDown", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_DOWN));
	buttons.Set("a", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_A));
	buttons.Set("b", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_B));
	buttons.Set("x", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_X));
	buttons.Set("y", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_Y));
	buttons.Set("guide", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_GUIDE));
	buttons.Set("back", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_BACK));
	buttons.Set("start", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_START));
	buttons.Set("leftStick", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_LEFTSTICK));
	buttons.Set("rightStick", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_RIGHTSTICK));
	buttons.Set("leftShoulder", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_LEFTSHOULDER));
	buttons.Set("rightShoulder", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_RIGHTSHOULDER));
	buttons.Set("paddle1", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_PADDLE1));
	buttons.Set("paddle2", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_PADDLE2));
	buttons.Set("paddle3", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_PADDLE3));
	buttons.Set("paddle4", !!SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_PADDLE4));

	error = SDL_GetError();
	if (error != global::no_error) {
		std::ostringstream message;
		message << "SDL_GameControllerGetButton() error: " << error;
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	dst.Set("axes", axes);
	dst.Set("buttons", buttons);
}


Napi::Value
controller::addMappings (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	Napi::Array mappings = info[0].As<Napi::Array>();

	for (int i = 0; i < (int) mappings.Length(); i++) {
		std::string mapping = mappings.Get(i).As<Napi::String>().Utf8Value();
		if (SDL_GameControllerAddMapping(mapping.c_str()) == -1) {
			std::ostringstream message;
			message << "SDL_GameControllerAddMapping(" << mapping << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		// SDL_GameControllerAddMapping produces errors even though it succeeds
		const char *error = SDL_GetError();
		if (error != global::no_error) { fprintf(stderr, "SDL silent error: %s\n", error); }
		SDL_ClearError();
	}

	return env.Undefined();
}

Napi::Value
controller::open (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int index = info[0].As<Napi::Number>().Int32Value();

	SDL_GameController *controller = SDL_GameControllerOpen(index);
	if (controller == nullptr) {
		std::ostringstream message;
		message << "SDL_GameControllerOpen(" << index << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	// SDL_GameControllerOpen produces errors even though it succeeds
	const char *error = SDL_GetError();
	if (error != global::no_error) { fprintf(stderr, "SDL silent error: %s\n", error); }
	SDL_ClearError();

	int _firmware_version = SDL_GameControllerGetFirmwareVersion(controller);
	Napi::Value firmware_version = _firmware_version != 0
		? Napi::Number::New(env, _firmware_version)
		: env.Null();

	const char *_serial_number = SDL_GameControllerGetSerial(controller);
	Napi::Value serial_number = _serial_number != nullptr
		? Napi::String::New(env, _serial_number)
		: env.Null();

	bool has_led = SDL_GameControllerHasLED(controller);
	bool has_rumble = SDL_GameControllerHasRumble(controller);
	bool has_rumble_triggers = SDL_GameControllerHasRumbleTriggers(controller);

	Napi::Value steam_handle = getSteamHandle(env, controller);

	SDL_Joystick *joystick = SDL_GameControllerGetJoystick(controller);
	Napi::Value power = joystick::getPowerLevel(env, joystick);

	Napi::Object result = Napi::Object::New(env);
	result.Set("firmwareVersion", firmware_version);
	result.Set("serialNumber", serial_number);
	result.Set("hasLed", has_led);
	result.Set("hasRumble", has_rumble);
	result.Set("hasRumbleTriggers", has_rumble_triggers);
	result.Set("steamHandle", steam_handle);
	result.Set("power", power);

	controller::getState(env, controller, result);

	return result;
}

Napi::Value
controller::close (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int controller_id = info[0].As<Napi::Number>().Int32Value();

	SDL_GameController *controller = SDL_GameControllerFromInstanceID(controller_id);
	if (controller == nullptr) {
		std::ostringstream message;
		message << "SDL_GameControllerFromInstanceID(" << controller_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_GameControllerClose(controller);

	return env.Undefined();
}
