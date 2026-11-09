#include "mouse.h"
#include "global.h"
#include <SDL3/SDL.h>
#include <string>

static SDL_Cursor *allocated_cursor = nullptr;

template <typename... Args>
static void
_adoptCursor (Napi::Env &env, SDL_Cursor *cursor, const Args &...args)
{
	if (!SDL_SetCursor(cursor)) {
		Napi::Error error = global::sdlError(env, "SDL_SetCursor", args...);
		SDL_DestroyCursor(cursor);
		throw error;
	}

	if (allocated_cursor != nullptr) { SDL_DestroyCursor(allocated_cursor); }
	allocated_cursor = cursor;
}


Napi::Value
mouse::getButton (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int button = info[0].As<Napi::Number>().Int32Value();

	Uint32 buttons = SDL_GetMouseState(nullptr, nullptr);
	bool state = buttons & SDL_BUTTON_MASK(button);

	return Napi::Boolean::New(env, state);
}

Napi::Value
mouse::getPosition (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	float x, y;
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

	float x = info[0].As<Napi::Number>().FloatValue();
	float y = info[1].As<Napi::Number>().FloatValue();

	if (!SDL_WarpMouseGlobal(x, y)) {
		throw global::sdlError(env, "SDL_WarpMouseGlobal", x, y);
	}

	return env.Undefined();
}

Napi::Value
mouse::setCursor (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int cursor_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Cursor *cursor = SDL_CreateSystemCursor((SDL_SystemCursor) cursor_id);
	if (cursor == nullptr) {
		throw global::sdlError(env, "SDL_CreateSystemCursor", cursor_id);
	}

	_adoptCursor(env, cursor, cursor_id);

	return env.Undefined();
}

Napi::Value
mouse::resetCursor(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	SDL_Cursor *cursor = SDL_GetDefaultCursor();
	if (cursor == nullptr) {
		throw global::sdlError(env, "SDL_GetDefaultCursor");
	}

	if (!SDL_SetCursor(cursor)) {
		throw global::sdlError(env, "SDL_SetCursor");
	}

	if (allocated_cursor != nullptr) {
		SDL_DestroyCursor(allocated_cursor);
		allocated_cursor = nullptr;
	}

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

	SDL_Surface* surface = SDL_CreateSurfaceFrom(w, h, (SDL_PixelFormat) format, pixels, stride);
	if (surface == nullptr) {
		throw global::sdlError(env, "SDL_CreateSurfaceFrom", w, h, format);
	}

	SDL_Cursor *cursor = SDL_CreateColorCursor(surface, x, y);
	if (cursor == nullptr) {
		SDL_DestroySurface(surface);

		throw global::sdlError(env, "SDL_CreateColorCursor", x, y);
	}

	SDL_DestroySurface(surface);

	_adoptCursor(env, cursor);

	return env.Undefined();
}

Napi::Value
mouse::showCursor (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	bool should_show = info[0].As<Napi::Boolean>().Value();

	bool success = should_show ? SDL_ShowCursor() : SDL_HideCursor();
	if (!success) {
		throw global::sdlError(env, should_show ? "SDL_ShowCursor" : "SDL_HideCursor");
	}

	return env.Undefined();
}

Napi::Value
mouse::redrawCursor (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	if (!SDL_SetCursor(nullptr)) {
		throw global::sdlError(env, "SDL_SetCursor", "nullptr");
	}

	return env.Undefined();
}

Napi::Value
mouse::capture (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	bool should_capture = info[0].As<Napi::Boolean>().Value();

	if (!SDL_CaptureMouse(should_capture)) {
		throw global::sdlError(env, "SDL_CaptureMouse", should_capture);
	}

	return env.Undefined();
}
