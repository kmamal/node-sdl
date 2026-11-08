#include "clipboard.h"
#include "global.h"
#include <SDL3/SDL.h>
#include <string>

Napi::Value
clipboard::getText (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	SDL_ClearError();

	char *text = SDL_GetClipboardText();
	if (text == nullptr || text[0] == '\0') {
		SDL_free(text);

		const char *error = SDL_GetError();
		if (error[0] == '\0') {
			return Napi::String::New(env, "");
		}

		throw global::sdlError(env, "SDL_GetClipboardText");
	}

	Napi::String result;
	try { result = Napi::String::New(env, text); }
	catch (...) {
		SDL_free(text);
		throw;
	}
	SDL_free(text);

	return result;
}

Napi::Value
clipboard::setText (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::string text = info[0].As<Napi::String>().Utf8Value();

	if (!SDL_SetClipboardText(text.c_str())) {
		throw global::sdlError(env, "SDL_SetClipboardText");
	}

	return env.Undefined();
}
