#include "sensor.h"
#include <SDL3/SDL.h>
#include <map>
#include <string>
#include <sstream>


std::map<SDL_SensorType, std::string> sensor::types;
std::map<SDL_SensorType, std::string> sensor::sides;


Napi::Value
sensor::getDevices (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int num_devices;
	SDL_SensorID *sensor_ids = SDL_GetSensors(&num_devices);
	if (sensor_ids == nullptr) {
		std::ostringstream message;
		message << "SDL_GetSensors() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array devices = Napi::Array::New(env, num_devices);

	try {
		for (int i = 0; i < num_devices; i++) {
			SDL_SensorID id = sensor_ids[i];

			SDL_SensorType _type = SDL_GetSensorTypeForID(id);
			if (_type == SDL_SENSOR_INVALID) { SDL_ClearError(); }
			auto type_entry = sensor::types.find(_type);
			Napi::Value type = type_entry != sensor::types.end()
				? Napi::String::New(env, type_entry->second)
				: env.Null();
			auto side_entry = sensor::sides.find(_type);
			Napi::Value side = side_entry != sensor::sides.end()
				? Napi::String::New(env, side_entry->second)
				: env.Null();

			const char *_name = SDL_GetSensorNameForID(id);
			Napi::Value name;
			if (_name != nullptr) {
				name = Napi::String::New(env, _name);
			}
			else {
				SDL_ClearError();
				name = env.Null();
			}

			Napi::Object device = Napi::Object::New(env);
			device.Set("id", id);
			device.Set("name", name);
			device.Set("type", type);
			device.Set("side", side);

			devices.Set(i, device);
		}
	}
	catch (...) {
		SDL_free(sensor_ids);
		throw;
	}
	SDL_free(sensor_ids);

	return devices;
}

Napi::Value
sensor::open (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int id = info[0].As<Napi::Number>().Int32Value();

	SDL_Sensor *sensor = SDL_OpenSensor(id);
	if (sensor == nullptr) {
		std::ostringstream message;
		message << "SDL_OpenSensor(" << id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
sensor::getData (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int sensor_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Sensor *sensor = SDL_GetSensorFromID(sensor_id);
	if (sensor == nullptr) {
		std::ostringstream message;
		message << "SDL_GetSensorFromID(" << sensor_id << ") error: invalid sensor id";
		throw Napi::Error::New(env, message.str());
	}

	float data[3];
	if (!SDL_GetSensorData(sensor, data, 3)) {
		std::ostringstream message;
		message << "SDL_GetSensorData(" << sensor_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Object result = Napi::Object::New(env);
	result.Set("x", data[0]);
	result.Set("y", data[1]);
	result.Set("z", data[2]);

	return result;
}

Napi::Value
sensor::close (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int sensor_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Sensor *sensor = SDL_GetSensorFromID(sensor_id);
	if (sensor == nullptr) {
		std::ostringstream message;
		message << "SDL_GetSensorFromID(" << sensor_id << ") error: invalid sensor id";
		throw Napi::Error::New(env, message.str());
	}

	SDL_CloseSensor(sensor);

	return env.Undefined();
}
