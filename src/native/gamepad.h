#ifndef _GAMEPAD_H_
#define _GAMEPAD_H_

#include <napi.h>
#include <SDL3/SDL.h>
#include <map>
#include <string>

namespace gamepad {

	extern std::map<SDL_GamepadType, std::string> types;
	extern std::map<SDL_GamepadAxis, std::string> axes;
	extern std::map<SDL_GamepadButton, std::string> buttons;
	extern std::map<SDL_GamepadButtonLabel, std::string> button_labels;

	double mapAxis (SDL_Gamepad *gamepad, SDL_GamepadAxis axis);
	double mapAxisValue (int value);
	void getState (Napi::Env &env, SDL_Gamepad *gamepad, Napi::Object dst);
	Napi::Value getSteamHandle(Napi::Env &env, SDL_Gamepad *gamepad);

	Napi::Value addMappings(const Napi::CallbackInfo &info);
	Napi::Value open(const Napi::CallbackInfo &info);
	Napi::Value close(const Napi::CallbackInfo &info);

}; // namespace gamepad

#endif // _GAMEPAD_H_
