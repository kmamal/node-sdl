#include "power.h"
#include "global.h"
#include <SDL3/SDL.h>
#include <map>


std::map<SDL_PowerState, packed::Str> power::states;


Napi::Value
power::getInfo (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());

	// SDL_GetPowerInfo() reads the battery state straight from the OS and needs
	// no SDL_Init(), so unlike the other worker-reachable bindings this one
	// deliberately skips global::assertReady().
	int _seconds, _percent;
	SDL_PowerState _state = SDL_GetPowerInfo(&_seconds, &_percent);

	auto state_entry = power::states.find(_state);
	Napi::Value state;
	if (state_entry != power::states.end()) {
		state = Napi::String::New(env, state_entry->second);
	}
	else {
		SDL_ClearError();
		state = env.Null();
	}
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
