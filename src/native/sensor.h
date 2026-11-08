#ifndef _SENSOR_H_
#define _SENSOR_H_

#include <napi.h>
#include "packed.h"
#include <SDL3/SDL.h>
#include <map>
#include <string>

namespace sensor {

	extern std::map<SDL_SensorType, packed::Str> types;
	extern std::map<SDL_SensorType, packed::Str> sides;

	Napi::Value getDevices(const Napi::CallbackInfo &info);
	Napi::Value open(const Napi::CallbackInfo &info);
	Napi::Value getData(const Napi::CallbackInfo &info);
	Napi::Value close(const Napi::CallbackInfo &info);

}; // namespace sensor

#endif // _SENSOR_H_
