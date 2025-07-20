#include "keyboard.h"
#include <SDL.h>
#include <string>
#include <sstream>

int keyboard::num_keys;
const Uint8 *keyboard::keys;


Napi::Value
keyboard::getKey(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int scancode = info[0].As<Napi::Number>().Int32Value();

	int keycode = SDL_GetKeyFromScancode((SDL_Scancode) scancode);
	const char *keyname = SDL_GetKeyName(keycode);

	return Napi::String::New(env, keyname);
}

Napi::Value
keyboard::getScancode(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::string keyname = info[0].As<Napi::String>().Utf8Value();

	SDL_Keycode keycode = SDL_GetKeyFromName(keyname.c_str());
	if (keycode == SDLK_UNKNOWN) {
		SDL_ClearError();
		return env.Null();
	}

	int scancode = SDL_GetScancodeFromKey(keycode);
	if (scancode == 0) {
		SDL_ClearError();
		return env.Null();
	}

	return Napi::Number::New(env, scancode);
}

Napi::Value
keyboard::getState(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	Napi::Array result = Napi::Array::New(env, keyboard::num_keys);

	for (int i = 0; i < keyboard::num_keys; i++) {
		result.Set(i, !!keyboard::keys[i]);
	}

	return result;
}
