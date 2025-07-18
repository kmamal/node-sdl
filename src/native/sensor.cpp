#include "sensor.h"
#include <SDL.h>
#include <map>
#include <string>
#include <sstream>


std::map<SDL_SensorType, std::string> sensor::types;
std::map<SDL_SensorType, std::string> sensor::sides;


Napi::Value
sensor::getDevices (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int num_devices = SDL_NumSensors();
	if (num_devices < 0) {
		std::ostringstream message;
		message << "SDL_NumSensors() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array devices = Napi::Array::New(env, num_devices);

	for (int i = 0; i < num_devices; i++) {
		int id = SDL_SensorGetDeviceInstanceID(i);
		if (id == -1) {
			std::ostringstream message;
			message << "SDL_SensorGetDeviceInstanceID(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		SDL_SensorType _type = SDL_SensorGetDeviceType(i);
		Napi::Value type = _type != SDL_SENSOR_UNKNOWN
			? Napi::String::New(env, sensor::types[_type])
			: env.Null();
		Napi::Value side = (
			_type != SDL_SENSOR_UNKNOWN &&
			_type != SDL_SENSOR_ACCEL &&
			_type != SDL_SENSOR_GYRO
		)
			? Napi::String::New(env, sensor::sides[_type])
			: env.Null();

		// This function can only error if the index is invalid.
		const char *name = SDL_SensorGetDeviceName(i);

		Napi::Object device = Napi::Object::New(env);
		device.Set("_index", i);
		device.Set("id", id);
		device.Set("name", name);
		device.Set("type", type);
		device.Set("side", side);

		devices.Set(i, device);
	}

	return devices;
}

Napi::Value
sensor::open (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int index = info[0].As<Napi::Number>().Int32Value();

	SDL_Sensor *sensor = SDL_SensorOpen(index);
	if (sensor == nullptr) {
		std::ostringstream message;
		message << "SDL_SensorOpen(" << index << ") error: " << SDL_GetError();
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

	SDL_Sensor *sensor = SDL_SensorFromInstanceID(sensor_id);
	if (sensor == nullptr) {
		std::ostringstream message;
		message << "SDL_SensorFromInstanceID(" << sensor_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Uint64 _timestamp;
	float data[3];
	if (SDL_SensorGetDataWithTimestamp(sensor, &_timestamp, data, 3) == -1) {
		std::ostringstream message;
		message << "SDL_SensorGetDataWithTimestamp(" << sensor_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}
	Napi::Value timestamp = _timestamp != 0
		? Napi::Number::New(env, _timestamp)
		: env.Null();

	Napi::Object result = Napi::Object::New(env);
	result.Set("timestamp", timestamp);
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

	SDL_Sensor *sensor = SDL_SensorFromInstanceID(sensor_id);
	if (sensor == nullptr) {
		std::ostringstream message;
		message << "SDL_SensorFromInstanceID(" << sensor_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_SensorClose(sensor);

	return env.Undefined();
}
