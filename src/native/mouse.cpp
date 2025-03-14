#include "mouse.h"
#include <SDL.h>
#include <string>
#include <sstream>

static SDL_Cursor *allocated_cursor = nullptr;


Napi::Value
mouse::getButton (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int button = info[0].As<Napi::Number>().Int32Value();

	int buttons = SDL_GetMouseState(nullptr, nullptr);
	bool state = buttons & SDL_BUTTON(button);

	return Napi::Boolean::New(env, state);
}

Napi::Value
mouse::getPosition (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int x, y;
	SDL_GetGlobalMouseState(&x, &y);

	Napi::Object result = Napi::Object::New(env);
	result.Set("x", x);
	result.Set("y", y);

	return result;
}

Napi::Value
mouse::setPosition (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int x = info[0].As<Napi::Number>().Int32Value();
	int y = info[1].As<Napi::Number>().Int32Value();

	if (SDL_WarpMouseGlobal(x, y) < 0) {
		std::ostringstream message;
		message << "SDL_WarpMouseGlobal(" << x << ", " << y << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
mouse::setCursor (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int cursor_id = info[0].As<Napi::Number>().Int32Value();

	if (allocated_cursor != nullptr) {
		SDL_FreeCursor(allocated_cursor);
		allocated_cursor = nullptr;
	}

	SDL_Cursor *cursor = SDL_CreateSystemCursor((SDL_SystemCursor) cursor_id);
	if (cursor == nullptr) {
		std::ostringstream message;
		message << "SDL_CreateSystemCursor(" << cursor_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_SetCursor(cursor);

	return env.Undefined();
}

Napi::Value
mouse::resetCursor(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	if (allocated_cursor != nullptr) {
		SDL_FreeCursor(allocated_cursor);
		allocated_cursor = nullptr;
	}

	SDL_Cursor *cursor = SDL_GetDefaultCursor();
	if (cursor == nullptr) {
		std::ostringstream message;
		message << "SDL_GetDefaultCursor() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_SetCursor(cursor);

	return env.Undefined();
}

Napi::Value
mouse::setCursorImage (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int w = info[0].As<Napi::Number>().Int32Value();
	int h = info[1].As<Napi::Number>().Int32Value();
	int stride = info[2].As<Napi::Number>().Int32Value();
	unsigned int format = info[3].As<Napi::Number>().Int32Value();
	void *pixels = info[4].As<Napi::Buffer<char>>().Data();
	int x = info[5].As<Napi::Number>().Int32Value();
	int y = info[6].As<Napi::Number>().Int32Value();

	SDL_Surface* surface = SDL_CreateRGBSurfaceWithFormatFrom(pixels, w, h, SDL_BITSPERPIXEL(format), stride, format);
	if (surface == nullptr) {
		std::ostringstream message;
		message << "SDL_CreateRGBSurfaceWithFormatFrom(" << w << ", " << h << ", " << format << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (allocated_cursor != nullptr) {
		SDL_FreeCursor(allocated_cursor);
		allocated_cursor = nullptr;
	}

	allocated_cursor = SDL_CreateColorCursor(surface, x, y);
	if (allocated_cursor == nullptr) {
		SDL_FreeSurface(surface);

		std::ostringstream message;
		message << "SDL_CreateColorCursor(" << x << ", " << y << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_SetCursor(allocated_cursor);

	SDL_FreeSurface(surface);
	return env.Undefined();
}

Napi::Value
mouse::showCursor (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	bool should_show = info[0].As<Napi::Boolean>().Value();

	if (SDL_ShowCursor(should_show ? SDL_ENABLE : SDL_DISABLE) < 0) {
		std::ostringstream message;
		message << "SDL_ShowCursor(" << should_show << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
mouse::redrawCursor (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	SDL_SetCursor(nullptr);

	return env.Undefined();
}

Napi::Value
mouse::capture (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	bool should_capture = info[0].As<Napi::Boolean>().Value();

	if (SDL_CaptureMouse(should_capture ? SDL_TRUE : SDL_FALSE) == -1) {
		std::ostringstream message;
		message << "SDL_CaptureMouse(" << should_capture << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}
