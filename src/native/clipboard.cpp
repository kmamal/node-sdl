#include "clipboard.h"
#include "global.h"
#include <SDL3/SDL.h>
#include <string>

Napi::Value
clipboard::getText (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	global::SdlPtr<char> text(SDL_GetClipboardText());
	if (!text) {
		throw global::sdlError(env, "SDL_GetClipboardText");
	}

	SDL_ClearError();
	return Napi::String::New(env, text.get());
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
