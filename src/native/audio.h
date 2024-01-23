#ifndef _AUDIO_H_
#define _AUDIO_H_

#include <napi.h>

namespace audio {

	Napi::Array _getDevices(Napi::Env &env, bool is_capture);

	Napi::Value getDevices(const Napi::CallbackInfo &info);
	Napi::Value open(const Napi::CallbackInfo &info);
	Napi::Value play(const Napi::CallbackInfo &info);
	Napi::Value getQueueSize(const Napi::CallbackInfo &info);
	Napi::Value enqueue(const Napi::CallbackInfo &info);
	Napi::Value dequeue(const Napi::CallbackInfo &info);
	Napi::Value clearQueue(const Napi::CallbackInfo &info);
	Napi::Value close(const Napi::CallbackInfo &info);

}; // namespace audio

#endif // _AUDIO_H_
