#include "sensor.h"
#include "global.h"
#include "threads.h"
#include <SDL3/SDL.h>
#include <map>
#include <string>


std::map<SDL_SensorType, packed::Str> sensor::types;
std::map<SDL_SensorType, packed::Str> sensor::sides;


Napi::Value
sensor::getDevices (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int num_devices;
	global::SdlArray<SDL_SensorID> sensor_ids(SDL_GetSensors(&num_devices));
	if (!sensor_ids) {
		throw global::sdlError(env, "SDL_GetSensors");
	}

	Napi::Array devices = Napi::Array::New(env, num_devices);

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

	return devices;
}

Napi::Value
sensor::open (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	SDL_SensorID id = info[0].As<Napi::Number>().Uint32Value();

	SDL_Sensor *sensor = SDL_OpenSensor(id);
	if (sensor == nullptr) {
		throw global::sdlError(env, "SDL_OpenSensor", id);
	}
	SDL_ClearError();

	threads::trackOpen(env, threads::SENSOR, id);

	return env.Undefined();
}

Napi::Value
sensor::getData (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	SDL_SensorID sensor_id = info[0].As<Napi::Number>().Uint32Value();

	SDL_Sensor *sensor = global::fromIdOrThrow(env, SDL_GetSensorFromID(sensor_id), "SDL_GetSensorFromID", "sensor", sensor_id);

	float data[3];
	if (!SDL_GetSensorData(sensor, data, 3)) {
		throw global::sdlError(env, "SDL_GetSensorData", sensor_id);
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

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	SDL_SensorID sensor_id = info[0].As<Napi::Number>().Uint32Value();

	threads::trackClose(env, threads::SENSOR, sensor_id);

	SDL_Sensor *sensor = global::fromIdOrThrow(env, SDL_GetSensorFromID(sensor_id), "SDL_GetSensorFromID", "sensor", sensor_id);

	SDL_CloseSensor(sensor);

	return env.Undefined();
}
