#include "power.h"
#include <SDL.h>

Napi::Value
power::getInfo (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int seconds, percent;
	SDL_PowerState state = SDL_GetPowerInfo(&seconds, &percent);

	Napi::Object result = Napi::Object::New(env);
	result.Set("state", Napi::Number::New(env, (int) state));
	result.Set("seconds", seconds == -1 ? env.Null() : Napi::Number::New(env, seconds));
	result.Set("percent", percent == -1 ? env.Null() : Napi::Number::New(env, percent));

	return result;
}
