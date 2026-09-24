#include "keyboard.h"
#include <SDL3/SDL.h>
#include <string>
#include <sstream>

int keyboard::num_keys;
const bool *keyboard::keys;


Napi::Value
keyboard::packKey(Napi::Env &env, SDL_Keycode keycode)
{
	bool is_character = !(keycode & (SDLK_SCANCODE_MASK | SDLK_EXTENDED_MASK))
		&& keycode >= 0x20
		&& keycode != 0x7F;

	if (is_character) {
		char utf8[5];
		char *end = SDL_UCS4ToUTF8(keycode, utf8);
		*end = '\0';
		return Napi::String::New(env, utf8);
	}

	const char *name = SDL_GetKeyName(keycode);
	if (name[0] == '\0') { return env.Null(); }
	return Napi::String::New(env, name);
}

Napi::Value
keyboard::getKey(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int scancode = info[0].As<Napi::Number>().Int32Value();

	SDL_Keycode keycode = SDL_GetKeyFromScancode((SDL_Scancode) scancode, SDL_KMOD_NONE, false);
	return packKey(env, keycode);
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

	int scancode = SDL_GetScancodeFromKey(keycode, nullptr);
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
		result.Set(i, keyboard::keys[i]);
	}

	return result;
}
