#ifndef _TOUCH_H_
#define _TOUCH_H_

#include <napi.h>
#include <SDL.h>
#include <map>

namespace touch {

	extern std::map<SDL_TouchDeviceType, std::string> device_types;

	Napi::Value getDevices(const Napi::CallbackInfo &info);

}; // namespace touch

#endif // _TOUCH_H_
