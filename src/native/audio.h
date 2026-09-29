#ifndef _AUDIO_H_
#define _AUDIO_H_

#include <napi.h>
#include <SDL3/SDL.h>
#include <map>
#include <string>

namespace audio {

	extern std::map<bool, std::string> device_types;
	extern std::map<SDL_AudioFormat, std::string> formats;

	Napi::Value _getDevice(Napi::Env &env, SDL_AudioDeviceID id, bool is_recording);
	Napi::Array _getDevices(Napi::Env &env, bool is_recording);

	Napi::Value getDevices(const Napi::CallbackInfo &info);
	Napi::Value open(const Napi::CallbackInfo &info);
	Napi::Value getDeviceFormat(const Napi::CallbackInfo &info);
	Napi::Value play(const Napi::CallbackInfo &info);
	Napi::Value getQueued(const Napi::CallbackInfo &info);
	Napi::Value getAvailable(const Napi::CallbackInfo &info);
	Napi::Value putData(const Napi::CallbackInfo &info);
	Napi::Value getData(const Napi::CallbackInfo &info);
	Napi::Value clear(const Napi::CallbackInfo &info);
	Napi::Value close(const Napi::CallbackInfo &info);

}; // namespace audio

#endif // _AUDIO_H_
