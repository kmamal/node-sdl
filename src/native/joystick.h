#ifndef _JOYSTICK_H_
#define _JOYSTICK_H_

#include <napi.h>

namespace joystick {

	double mapAxis (int value);
	Napi::Array _getDevices (Napi::Env &env);

	Napi::Value getDevices(const Napi::CallbackInfo &info);
	Napi::Value open(const Napi::CallbackInfo &info);
	Napi::Value getPower(const Napi::CallbackInfo &info);
	Napi::Value setLed(const Napi::CallbackInfo &info);
	Napi::Value setPlayer(const Napi::CallbackInfo &info);
	Napi::Value rumble(const Napi::CallbackInfo &info);
	Napi::Value rumbleTriggers(const Napi::CallbackInfo &info);
	Napi::Value close(const Napi::CallbackInfo &info);

}; // namespace joystick

#endif // _JOYSTICK_H_
