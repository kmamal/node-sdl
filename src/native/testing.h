#ifndef _TESTING_H_
#define _TESTING_H_

#include <napi.h>

namespace testing {

	Napi::Value attachVirtualJoystick(const Napi::CallbackInfo &info);
	Napi::Value setVirtualJoystickAxis(const Napi::CallbackInfo &info);
	Napi::Value setVirtualJoystickButton(const Napi::CallbackInfo &info);
	Napi::Value detachVirtualJoystick(const Napi::CallbackInfo &info);
	Napi::Value pushAudioDeviceEvent(const Napi::CallbackInfo &info);

}; // namespace testing

#endif // _TESTING_H_
