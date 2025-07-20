#ifndef _JOYSTICK_H_
#define _JOYSTICK_H_

#include <napi.h>
#include <SDL.h>
#include <map>
#include <string>

namespace joystick {

	extern std::map<SDL_JoystickType, std::string> types;
	extern std::map<Uint8, std::string> hat_positions;
	extern std::map<SDL_JoystickPowerLevel, std::string> power_levels;
	extern SDL_JoystickGUID zero_guid;

	double mapAxis (SDL_Joystick *joystick, int axis);
	double mapAxisValue (SDL_Joystick *joystick, int axis, int value);
	Napi::Array _getDevices (Napi::Env &env);
	Napi::Value getPowerLevel(Napi::Env &env, SDL_Joystick *joystick);
	Napi::Value mapPowerLevel(Napi::Env &env, SDL_JoystickPowerLevel power);

	Napi::Value getDevices(const Napi::CallbackInfo &info);
	Napi::Value open(const Napi::CallbackInfo &info);
	Napi::Value setLed(const Napi::CallbackInfo &info);
	Napi::Value setPlayer(const Napi::CallbackInfo &info);
	Napi::Value rumble(const Napi::CallbackInfo &info);
	Napi::Value rumbleTriggers(const Napi::CallbackInfo &info);
	Napi::Value close(const Napi::CallbackInfo &info);

}; // namespace joystick

#endif // _JOYSTICK_H_
