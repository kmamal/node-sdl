#ifndef _AUDIO_H_
#define _AUDIO_H_

#include <napi.h>
#include "packed.h"
#include <SDL3/SDL.h>
#include <map>
#include <string>

namespace audio {

	extern std::map<bool, std::string> device_types;
	extern std::map<SDL_AudioFormat, std::string> formats;

	void closeAllStreams();

	packed::Value _getDevice(SDL_AudioDeviceID id);
	packed::Value _getFormat(SDL_AudioDeviceID id);
	packed::Value _getDefaultDevice(bool is_recording);
	Napi::Array _getDevices(Napi::Env &env, bool is_recording);

	Napi::Value getDrivers(const Napi::CallbackInfo &info);
	Napi::Value getDevices(const Napi::CallbackInfo &info);
	Napi::Value open(const Napi::CallbackInfo &info);
	Napi::Value play(const Napi::CallbackInfo &info);
	Napi::Value getQueued(const Napi::CallbackInfo &info);
	Napi::Value getAvailable(const Napi::CallbackInfo &info);
	Napi::Value putData(const Napi::CallbackInfo &info);
	Napi::Value getData(const Napi::CallbackInfo &info);
	Napi::Value clear(const Napi::CallbackInfo &info);
	Napi::Value close(const Napi::CallbackInfo &info);
	Napi::Value setNotify(const Napi::CallbackInfo &info);
	Napi::Value setGain(const Napi::CallbackInfo &info);
	Napi::Value setFrequencyRatio(const Napi::CallbackInfo &info);
	Napi::Value convert(const Napi::CallbackInfo &info);

}; // namespace audio

#endif // _AUDIO_H_
