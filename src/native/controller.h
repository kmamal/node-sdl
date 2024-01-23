#ifndef _CONTROLLER_H_
#define _CONTROLLER_H_

#include <napi.h>
#include <SDL.h>

namespace controller {

	void getState (Napi::Env &env, SDL_GameController *controller, Napi::Object dst);

	Napi::Value addMappings(const Napi::CallbackInfo &info);
	Napi::Value open(const Napi::CallbackInfo &info);
	Napi::Value close(const Napi::CallbackInfo &info);

}; // namespace controller

#endif // _CONTROLLER_H_
