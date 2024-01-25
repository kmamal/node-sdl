#ifndef _SENSOR_H_
#define _SENSOR_H_

#include <napi.h>
#include <SDL.h>
#include <map>
#include <string>

namespace sensor {

	extern std::map<SDL_SensorType, std::string> types;
	extern std::map<SDL_SensorType, std::string> sides;

	Napi::Value getDevices(const Napi::CallbackInfo &info);
	Napi::Value open(const Napi::CallbackInfo &info);
	Napi::Value getData(const Napi::CallbackInfo &info);
	Napi::Value close(const Napi::CallbackInfo &info);

}; // namespace sensor

#endif // _SENSOR_H_
