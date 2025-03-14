#include "power.h"
#include <SDL.h>
#include <map>


std::map<SDL_PowerState, std::string> power::states;


Napi::Value
power::getInfo (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int _seconds, _percent;
	SDL_PowerState _state = SDL_GetPowerInfo(&_seconds, &_percent);

	Napi::Value state = _state != SDL_POWERSTATE_UNKNOWN
		? Napi::String::New(env, power::states[_state])
		: env.Null();
	Napi::Value seconds = _seconds != -1
		? Napi::Number::New(env, _seconds)
		: env.Null();
	Napi::Value percent = _percent != -1
		? Napi::Number::New(env, _percent)
		: env.Null();

	Napi::Object result = Napi::Object::New(env);
	result.Set("state", state);
	result.Set("seconds", seconds);
	result.Set("percent", percent);

	return result;
}
