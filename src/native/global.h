#ifndef _GLOBAL_H_
#define _GLOBAL_H_

#include <napi.h>
#include <mutex>

namespace global {

	std::mutex &lock();
	void assertReady(Napi::Env &env);
	void registerEnv(Napi::Env env);

	Napi::Value initialize(const Napi::CallbackInfo &info);
	Napi::Value cleanup(const Napi::CallbackInfo &info);

}; // namespace global

#endif // _GLOBAL_H_
