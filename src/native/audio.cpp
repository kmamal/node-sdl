#include "audio.h"
#include "global.h"
#include <SDL.h>
#include <string>
#include <sstream>


std::map<bool, std::string> audio::device_types;


Napi::Array
audio::_getDevices(Napi::Env &env, bool is_capture)
{
	int num_devices = SDL_GetNumAudioDevices(is_capture ? 1 : 0);
	if (num_devices == -1) {
		// SDL_GetNumAudioDevices can return -1 even if there is no error
		const char *error = SDL_GetError();
		if (error != global::no_error) {
			std::ostringstream message;
			message << "SDL_GetNumAudioDevices(" << is_capture << ") error: " << error;
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}
		return Napi::Array::New(env);
	}

	Napi::Array devices = Napi::Array::New(env, num_devices);

	std::string device_type = audio::device_types[is_capture];

	for (int i = 0; i < num_devices; i++) {
		const char *name = SDL_GetAudioDeviceName(i, is_capture);
		if (name == nullptr) {
			std::ostringstream message;
			message << "SDL_GetAudioDeviceName(" << i << ", " << is_capture << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		Napi::Object device = Napi::Object::New(env);
		device.Set("name", name);
		device.Set("type", device_type);

		devices.Set(i, device);
	}

	return devices;
}


Napi::Value
audio::getDevices(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	bool is_capture = info[0].As<Napi::Boolean>().Value();

	return audio::_getDevices(env, is_capture);
}

#include <iostream>

Napi::Value
audio::open (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::string name;
	bool has_name = !info[0].IsNull();
	if (has_name) { name = info[0].As<Napi::String>().Utf8Value(); }
	bool is_capture = info[1].As<Napi::Boolean>().Value();
	int freq = info[2].As<Napi::Number>().Int32Value();
	int format = info[3].As<Napi::Number>().Int32Value();
	int channels = info[4].As<Napi::Number>().Int32Value();
	int samples = info[5].As<Napi::Number>().Int32Value();

	SDL_AudioSpec desired;
	SDL_memset(&desired, 0, sizeof(desired));
	desired.freq = freq;
	desired.format = format;
	desired.channels = channels;
	desired.samples = samples;

	SDL_AudioDeviceID audio_id = SDL_OpenAudioDevice(has_name ? name.c_str() : nullptr, is_capture ? 1 : 0, &desired, nullptr, 0);
	if (audio_id == 0) {
		std::ostringstream message;
		message << "SDL_OpenAudioDevice() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return Napi::Number::New(env, audio_id);
}

Napi::Value
audio::play (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	bool should_play = info[1].As<Napi::Boolean>().Value();

	SDL_PauseAudioDevice(audio_id, should_play ? 0 : 1);

	return env.Undefined();
}

Napi::Value
audio::getQueueSize (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();

	int size = SDL_GetQueuedAudioSize(audio_id);

	return Napi::Number::New(env, size);
}

Napi::Value
audio::clearQueue (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();

	SDL_ClearQueuedAudio(audio_id);

	return env.Undefined();
}

Napi::Value
audio::enqueue (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	void *src = info[1].As<Napi::Buffer<char>>().Data();
	int size = info[2].As<Napi::Number>().Int32Value();

	if (SDL_QueueAudio(audio_id, src, size) < 0) {
		std::ostringstream message;
		message << "SDL_QueueAudio() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
audio::dequeue (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	void *dst = info[1].As<Napi::Buffer<char>>().Data();
	int size = info[2].As<Napi::Number>().Int32Value();

	int num = SDL_DequeueAudio(audio_id, dst, size);
	const char *error = SDL_GetError();
	if (error != global::no_error) {
		std::ostringstream message;
		message << "SDL_DequeueAudio(" << audio_id << ") error: " << error;
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return Napi::Number::New(env, num);
}

Napi::Value
audio::close (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();

	SDL_PauseAudioDevice(audio_id, 1);
	SDL_ClearQueuedAudio(audio_id);
	SDL_CloseAudioDevice(audio_id);

	return env.Undefined();
}
