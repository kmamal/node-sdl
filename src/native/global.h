#ifndef _GLOBAL_H_
#define _GLOBAL_H_

#include <napi.h>
#include <SDL3/SDL.h>
#include <mutex>

namespace global {

	std::mutex &lock();
	void assertReady(Napi::Env &env);
	bool isReady();
	bool isMainThread();
	void processInitRequests();
	void teardown();

	Napi::Value initialize(const Napi::CallbackInfo &info);
	Napi::Value initSubsystem(const Napi::CallbackInfo &info);
	Napi::Value cleanup(const Napi::CallbackInfo &info);

}; // namespace global

#endif // _GLOBAL_H_
