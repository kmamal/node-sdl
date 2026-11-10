#include "keyboard.h"
#include <SDL3/SDL.h>
#include <string>

int keyboard::num_keys;
const bool *keyboard::keys;


packed::Value
keyboard::packKey(SDL_Keycode keycode)
{
	bool is_masked = (keycode & (SDLK_SCANCODE_MASK | SDLK_EXTENDED_MASK)) != 0;

	if (!is_masked) {
		switch (keycode) {
			case SDLK_RETURN:
			case SDLK_ESCAPE:
			case SDLK_BACKSPACE:
			case SDLK_TAB:
			case SDLK_DELETE:
				break;
			default: {
				bool is_control = keycode < 0x20 || (keycode >= 0x80 && keycode <= 0x9F);
				if (is_control) { return packed::Value(); }
				char utf8[5];
				char *end = SDL_UCS4ToUTF8(keycode, utf8);
				*end = '\0';
				return packed::Value(utf8);
			}
		}
	}

	const char *name = SDL_GetKeyName(keycode);
	if (name[0] == '\0') {
		SDL_ClearError();
		return packed::Value();
	}

	return packed::Value(name);
}

Napi::Value
keyboard::getKey(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int scancode = info[0].As<Napi::Number>().Int32Value();

	SDL_Keycode keycode = SDL_GetKeyFromScancode((SDL_Scancode) scancode, SDL_KMOD_NONE, true);
	return packKey(keycode).toNapi(env);
}

static bool
isKeypad(int scancode)
{
	return (scancode >= SDL_SCANCODE_KP_DIVIDE && scancode <= SDL_SCANCODE_KP_PERIOD)
		|| scancode == SDL_SCANCODE_KP_EQUALS
		|| scancode == SDL_SCANCODE_KP_COMMA
		|| scancode == SDL_SCANCODE_KP_EQUALSAS400
		|| (scancode >= SDL_SCANCODE_KP_00 && scancode <= SDL_SCANCODE_KP_HEXADECIMAL);
}

static int
findScancode(SDL_Keycode keycode)
{
	for (int i = 1; i < SDL_SCANCODE_COUNT; i++) {
		if (isKeypad(i)) { continue; }
		if (SDL_GetKeyFromScancode((SDL_Scancode) i, SDL_KMOD_NONE, true) == keycode) { return i; }
	}
	return 0;
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

	const char *cursor = keyname.c_str();
	size_t remaining = keyname.size();
	Uint32 codepoint = SDL_StepUTF8(&cursor, &remaining);
	SDL_Keycode exact = (codepoint != 0 && remaining == 0) ? (SDL_Keycode) codepoint : keycode;

	int scancode = findScancode(exact);
	if (scancode == 0 && exact != keycode) { scancode = findScancode(keycode); }
	if (scancode == 0) {
		scancode = SDL_GetScancodeFromKey(keycode, nullptr);
		if (scancode == 0) {
			SDL_ClearError();
			return env.Null();
		}
	}

	return Napi::Number::New(env, scancode);
}

Napi::Value
keyboard::getState(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	static_assert(sizeof(bool) == 1, "bool must be one byte");

	Napi::Uint8Array result = Napi::Uint8Array::New(env, keyboard::num_keys);
	SDL_memcpy(result.Data(), keyboard::keys, keyboard::num_keys);

	return result;
}
