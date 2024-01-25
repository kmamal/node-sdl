#ifndef _POWER_H_
#define _POWER_H_

#include <napi.h>
#include <SDL.h>
#include <map>
#include <string>

namespace power {

	extern std::map<SDL_PowerState, std::string> states;

	Napi::Value getInfo(const Napi::CallbackInfo &info);

}; // namespace power

#endif // _POWER_H_
