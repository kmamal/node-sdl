#ifndef _THREADS_H_
#define _THREADS_H_

#include <napi.h>
#include <SDL3/SDL.h>
#include <memory>
#include <string>
#include "packed.h"

namespace threads {

	enum Kind { JOYSTICK, GAMEPAD, SENSOR };

	struct Event {
		const std::string *target;
		Uint32 target_id;
		std::shared_ptr<const packed::Value> value;
	};

	void trackOpen(Napi::Env &env, Kind kind, Uint32 id);
	void trackClose(Napi::Env &env, Kind kind, Uint32 id);

	void leave(napi_env env);
	void distribute(const Event &event, napi_env except);
	void drain(Napi::Env &env, Napi::Function &callback);
	bool isPollingFast();
	void wakeMain();
	void shutdown();

	Napi::Value registerThread(const Napi::CallbackInfo &info);
	Napi::Value setDemand(const Napi::CallbackInfo &info);

}; // namespace threads

#endif // _THREADS_H_
