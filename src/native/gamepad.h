#ifndef _GAMEPAD_H_
#define _GAMEPAD_H_

#include <napi.h>
#include "packed.h"
#include <SDL3/SDL.h>
#include <map>

namespace gamepad {

	extern std::map<SDL_GamepadType, packed::Str> types;
	extern std::map<SDL_GamepadAxis, packed::Str> axes;
	extern std::map<SDL_GamepadButton, packed::Str> buttons;
	extern std::map<SDL_GamepadButtonLabel, packed::Str> button_labels;

	double mapAxis (SDL_Gamepad *gamepad, SDL_GamepadAxis axis);
	void getState (SDL_Gamepad *gamepad, packed::Value &dst);
	packed::Value getSteamHandle(SDL_Gamepad *gamepad);

	Napi::Value addMappings(const Napi::CallbackInfo &info);
	Napi::Value open(const Napi::CallbackInfo &info);
	Napi::Value close(const Napi::CallbackInfo &info);

}; // namespace gamepad

#endif // _GAMEPAD_H_
