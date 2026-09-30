#include "clipboard.h"
#include <SDL3/SDL.h>
#include <string>
#include <sstream>

Napi::Value
clipboard::getText (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	bool has_text = SDL_HasClipboardText();

	// Clear any stale error, since an empty result is otherwise ambiguous
	SDL_ClearError();

	if (!has_text) {
		return Napi::String::New(env, "");
	}

	char *text = SDL_GetClipboardText();
	if (text[0] == '\0') {
		SDL_free(text);

		// The clipboard may have been legitimately emptied since the check above
		const char *error = SDL_GetError();
		if (error[0] == '\0') {
			return Napi::String::New(env, "");
		}

		std::ostringstream message;
		message << "SDL_GetClipboardText() error: " << error;
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
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
		std::ostringstream message;
		message << "SDL_SetClipboardText() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}
