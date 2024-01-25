#ifndef _CONTROLLER_H_
#define _CONTROLLER_H_

#include <napi.h>
#include <SDL.h>
#include <map>
#include <string>

namespace controller {

	extern std::map<SDL_GameControllerAxis, std::string> axes;
	extern std::map<SDL_GameControllerButton, std::string> buttons;

	void getState (Napi::Env &env, SDL_GameController *controller, Napi::Object dst);

	Napi::Value addMappings(const Napi::CallbackInfo &info);
	Napi::Value open(const Napi::CallbackInfo &info);
	Napi::Value close(const Napi::CallbackInfo &info);

}; // namespace controller

#endif // _CONTROLLER_H_
