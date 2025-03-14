#ifndef _CONTROLLER_H_
#define _CONTROLLER_H_

#include <napi.h>
#include <SDL.h>
#include <map>
#include <string>

namespace controller {

	extern std::map<SDL_GameControllerType, std::string> types;
	extern std::map<SDL_GameControllerAxis, std::string> axes;
	extern std::map<SDL_GameControllerButton, std::string> buttons;

	double mapAxis (SDL_GameController *controller, SDL_GameControllerAxis axis);
	double mapAxisValue (SDL_GameController *controller, SDL_GameControllerAxis axis, int value);
	void getState (Napi::Env &env, SDL_GameController *controller, Napi::Object dst);

	Napi::Value addMappings(const Napi::CallbackInfo &info);
	Napi::Value open(const Napi::CallbackInfo &info);
	Napi::Value close(const Napi::CallbackInfo &info);

}; // namespace controller

#endif // _CONTROLLER_H_
