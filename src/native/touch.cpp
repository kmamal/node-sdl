#include "touch.h"
#include "global.h"
#include <SDL.h>
#include <string>
#include <sstream>

std::map<SDL_TouchDeviceType, std::string> touch::device_types;

Napi::Value
touch::getDevices(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int num_devices = SDL_GetNumTouchDevices();

	Napi::Array devices = Napi::Array::New(env, num_devices);

	for (int i = 0; i < num_devices; i++) {
		SDL_TouchID id = SDL_GetTouchDevice(i);
		if (id == 0) {
			std::ostringstream message;
			message << "SDL_GetTouchDevice(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		const char *_name = SDL_GetTouchName(i);
		Napi::Value name = _name != nullptr
			? Napi::String::New(env, _name)
			: env.Null();

		SDL_TouchDeviceType _type = SDL_GetTouchDeviceType(id);
		Napi::Value type = _type != SDL_TOUCH_DEVICE_INVALID
			? Napi::String::New(env, device_types[_type])
			: env.Null();

		Napi::Object device = Napi::Object::New(env);
		device.Set("id", id);
		device.Set("name", name);
		device.Set("type", type);

		devices.Set(i, device);
	}

	return devices;
}
