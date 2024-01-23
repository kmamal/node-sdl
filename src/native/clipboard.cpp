#include "clipboard.h"
#include <SDL.h>
#include <string>
#include <sstream>

Napi::Value
clipboard::getText (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	if (SDL_HasClipboardText() == SDL_FALSE) {
		return Napi::String::New(env, "");
	}

	char *text = SDL_GetClipboardText();
	if (text[0] == '\0') {
		SDL_free(text);
		std::ostringstream message;
		message << "SDL_GetClipboardText() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::String result = Napi::String::New(env, text);
	SDL_free(text);

	return result;
}

Napi::Value
clipboard::setText (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::string text = info[0].As<Napi::String>().Utf8Value();

	if (SDL_SetClipboardText(text.c_str()) < 0) {
		std::ostringstream message;
		message << "SDL_SetClipboardText() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}
