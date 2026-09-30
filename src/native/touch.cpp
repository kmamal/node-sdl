#include "touch.h"
#include "global.h"
#include <SDL3/SDL.h>
#include <string>
#include <sstream>

std::map<SDL_TouchDeviceType, std::string> touch::device_types;

Napi::Value
touch::getDevices(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int num_devices;
	SDL_TouchID *touch_ids = SDL_GetTouchDevices(&num_devices);
	if (touch_ids == nullptr) {
		std::ostringstream message;
		message << "SDL_GetTouchDevices() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array devices = Napi::Array::New(env);

	try {
		int num_returned = 0;
		for (int i = 0; i < num_devices; i++) {
			SDL_TouchID id = touch_ids[i];
			if (id == SDL_MOUSE_TOUCHID || id == SDL_PEN_TOUCHID) { continue; }

			const char *_name = SDL_GetTouchDeviceName(id);
			Napi::Value name;
			if (_name != nullptr) {
				name = Napi::String::New(env, _name);
			}
			else {
				SDL_ClearError();
				name = env.Null();
			}

			SDL_TouchDeviceType _type = SDL_GetTouchDeviceType(id);
			auto type_entry = device_types.find(_type);
			Napi::Value type;
			if (type_entry != device_types.end()) {
				type = Napi::String::New(env, type_entry->second);
			}
			else {
				SDL_ClearError();
				type = env.Null();
			}

			Napi::Object device = Napi::Object::New(env);
			device.Set("id", Napi::BigInt::New(env, id));
			device.Set("name", name);
			device.Set("type", type);

			devices.Set(num_returned++, device);
		}
	}
	catch (...) {
		SDL_free(touch_ids);
		throw;
	}
	SDL_free(touch_ids);

	return devices;
}
