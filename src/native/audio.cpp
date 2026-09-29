#include "audio.h"
#include <SDL3/SDL.h>
#include <string>
#include <sstream>

std::map<bool, std::string> audio::device_types;
std::map<SDL_AudioFormat, std::string> audio::formats;

static std::map<SDL_AudioDeviceID, SDL_AudioStream *> open_streams;

static SDL_AudioStream *
_getStream (Napi::Env &env, SDL_AudioDeviceID audio_id)
{
	auto entry = open_streams.find(audio_id);
	if (entry == open_streams.end()) {
		std::ostringstream message;
		message << "getAudioStream(" << audio_id << ") error: invalid audio stream id";
		throw Napi::Error::New(env, message.str());
	}
	return entry->second;
}


static Napi::Value
_packDevice (Napi::Env &env, SDL_AudioDeviceID id, bool is_recording)
{
	const char *name = SDL_GetAudioDeviceName(id);
	if (name == nullptr) {
		SDL_ClearError();
		return env.Null();
	}

	Napi::Object device = Napi::Object::New(env);
	device.Set("id", id);
	device.Set("name", name);

	return device;
}

Napi::Value
audio::_getDevice(Napi::Env &env, SDL_AudioDeviceID id, bool is_recording)
{
	return _packDevice(env, id, is_recording);
}

Napi::Array
audio::_getDevices(Napi::Env &env, bool is_recording)
{
	int num_devices;
	SDL_AudioDeviceID *device_ids = is_recording
		? SDL_GetAudioRecordingDevices(&num_devices)
		: SDL_GetAudioPlaybackDevices(&num_devices);
	if (device_ids == nullptr) {
		std::ostringstream message;
		message << "SDL_GetAudio" << (is_recording ? "Recording" : "Playback") << "Devices() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array devices = Napi::Array::New(env);

	try {
		int num_returned = 0;
		for (int i = 0; i < num_devices; i++) {
			Napi::Value device = _packDevice(env, device_ids[i], is_recording);
			if (device.IsNull()) { continue; }
			devices.Set(num_returned++, device);
		}
	}
	catch (...) {
		SDL_free(device_ids);
		throw;
	}
	SDL_free(device_ids);

	return devices;
}


Napi::Value
audio::getDevices(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	bool is_recording = info[0].As<Napi::Boolean>().Value();

	return audio::_getDevices(env, is_recording);
}

Napi::Value
audio::open (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	bool has_id = !info[0].IsNull();
	bool is_recording = info[1].As<Napi::Boolean>().Value();
	int freq = info[2].As<Napi::Number>().Int32Value();
	int format = info[3].As<Napi::Number>().Int32Value();
	int channels = info[4].As<Napi::Number>().Int32Value();
	int samples = info[5].As<Napi::Number>().Int32Value();

	SDL_AudioDeviceID device_id = has_id
		? info[0].As<Napi::Number>().Uint32Value()
		: is_recording
			? SDL_AUDIO_DEVICE_DEFAULT_RECORDING
			: SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK;

	SDL_AudioSpec desired;
	SDL_memset(&desired, 0, sizeof(desired));
	desired.freq = freq;
	desired.format = (SDL_AudioFormat) format;
	desired.channels = channels;

	std::string samples_string = std::to_string(samples);
	SDL_SetHint(SDL_HINT_AUDIO_DEVICE_SAMPLE_FRAMES, samples_string.c_str());

	SDL_AudioStream *stream = SDL_OpenAudioDeviceStream(device_id, &desired, nullptr, nullptr);
	SDL_ResetHint(SDL_HINT_AUDIO_DEVICE_SAMPLE_FRAMES);
	if (stream == nullptr) {
		std::ostringstream message;
		message << "SDL_OpenAudioDeviceStream() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_AudioDeviceID audio_id = SDL_GetAudioStreamDevice(stream);
	if (audio_id == 0) {
		std::ostringstream message;
		message << "SDL_GetAudioStreamDevice() error: " << SDL_GetError();
		SDL_ClearError();
		SDL_DestroyAudioStream(stream);
		throw Napi::Error::New(env, message.str());
	}

	open_streams[audio_id] = stream;

	return Napi::Number::New(env, audio_id);
}

Napi::Value
audio::getDeviceFormat (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();

	SDL_AudioSpec spec;
	int sample_frames;
	if (!SDL_GetAudioDeviceFormat(audio_id, &spec, &sample_frames)) {
		std::ostringstream message;
		message << "SDL_GetAudioDeviceFormat(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	auto format_entry = audio::formats.find(spec.format);
	Napi::Value format = format_entry != audio::formats.end()
		? Napi::String::New(env, format_entry->second)
		: env.Null();

	Napi::Object result = Napi::Object::New(env);
	result.Set("format", format);
	result.Set("channels", spec.channels);
	result.Set("frequency", spec.freq);
	result.Set("buffered", sample_frames);

	return result;
}

Napi::Value
audio::play (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	bool should_play = info[1].As<Napi::Boolean>().Value();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	bool success = should_play
		? SDL_ResumeAudioStreamDevice(stream)
		: SDL_PauseAudioStreamDevice(stream);
	if (!success) {
		std::ostringstream message;
		message << (should_play ? "SDL_ResumeAudioStreamDevice(" : "SDL_PauseAudioStreamDevice(") << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
audio::getQueued (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	int size = SDL_GetAudioStreamQueued(stream);
	if (size == -1) {
		std::ostringstream message;
		message << "SDL_GetAudioStreamQueued(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return Napi::Number::New(env, size);
}

Napi::Value
audio::getAvailable (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	int size = SDL_GetAudioStreamAvailable(stream);
	if (size == -1) {
		std::ostringstream message;
		message << "SDL_GetAudioStreamAvailable(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return Napi::Number::New(env, size);
}

Napi::Value
audio::clear (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	if (!SDL_ClearAudioStream(stream)) {
		std::ostringstream message;
		message << "SDL_ClearAudioStream(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
audio::putData (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	void *src = info[1].As<Napi::Buffer<char>>().Data();
	int size = info[2].As<Napi::Number>().Int32Value();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	if (!SDL_PutAudioStreamData(stream, src, size)) {
		std::ostringstream message;
		message << "SDL_PutAudioStreamData(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
audio::getData (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	void *dst = info[1].As<Napi::Buffer<char>>().Data();
	int size = info[2].As<Napi::Number>().Int32Value();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	int num = SDL_GetAudioStreamData(stream, dst, size);
	if (num == -1) {
		std::ostringstream message;
		message << "SDL_GetAudioStreamData(" << audio_id << ") error: " << SDL_GetError();
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

	SDL_AudioStream *stream = _getStream(env, audio_id);

	SDL_DestroyAudioStream(stream);
	open_streams.erase(audio_id);

	return env.Undefined();
}
