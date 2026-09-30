#include "video.h"
#include <SDL3/SDL.h>
#include <string>
#include <sstream>
#include <map>


std::map<SDL_DisplayOrientation, std::string> video::orientations;
std::map<SDL_PixelFormat, std::string> video::formats;


static Napi::Value
_packDisplay (Napi::Env &env, SDL_DisplayID display_id)
{
	const char *_name = SDL_GetDisplayName(display_id);
	Napi::Value name;
	if (_name != nullptr) {
		name = Napi::String::New(env, _name);
	}
	else {
		SDL_ClearError();
		name = env.Null();
	}

	const SDL_DisplayMode *mode = SDL_GetCurrentDisplayMode(display_id);
	if (mode == nullptr) {
		SDL_ClearError();
		return env.Null();
	}

	SDL_Rect rect;
	if(!SDL_GetDisplayBounds(display_id, &rect)) {
		SDL_ClearError();
		return env.Null();
	}

	Napi::Object geometry = Napi::Object::New(env);
	geometry.Set("x", rect.x);
	geometry.Set("y", rect.y);
	geometry.Set("width", rect.w);
	geometry.Set("height", rect.h);

	if(!SDL_GetDisplayUsableBounds(display_id, &rect)) {
		SDL_ClearError();
		return env.Null();
	}

	Napi::Object usable = Napi::Object::New(env);
	usable.Set("x", rect.x);
	usable.Set("y", rect.y);
	usable.Set("width", rect.w);
	usable.Set("height", rect.h);

	Napi::Value scale;
	float _scale = SDL_GetDisplayContentScale(display_id);
	if (_scale == 0.0f) {
		SDL_ClearError();
		scale = env.Null();
	}
	else {
		scale = Napi::Number::New(env, _scale);
	}

	SDL_DisplayOrientation _orientation = SDL_GetCurrentDisplayOrientation(display_id);
	auto orientation_entry = video::orientations.find(_orientation);
	Napi::Value orientation;
	if (orientation_entry != video::orientations.end()) {
		orientation = Napi::String::New(env, orientation_entry->second);
	}
	else {
		SDL_ClearError();
		orientation = env.Null();
	}

	auto format_entry = video::formats.find(mode->format);
	Napi::Value format = format_entry != video::formats.end()
		? Napi::String::New(env, format_entry->second)
		: env.Null();

	Napi::Object display = Napi::Object::New(env);
	display.Set("id", display_id);
	display.Set("name", name);
	display.Set("format", format);
	display.Set("frequency", mode->refresh_rate);
	display.Set("geometry", geometry);
	display.Set("usable", usable);
	display.Set("scale", scale);
	display.Set("orientation", orientation);

	return display;
}

Napi::Value
video::_getDisplay (Napi::Env &env, SDL_DisplayID display_id)
{
	return _packDisplay(env, display_id);
}

Napi::Array
video::_getDisplays (Napi::Env &env)
{
	int num_displays;
	SDL_DisplayID *display_ids = SDL_GetDisplays(&num_displays);
	if (display_ids == nullptr) {
		std::ostringstream message;
		message << "SDL_GetDisplays() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array displays = Napi::Array::New(env);

	try {
		int num_returned = 0;
		for (int i = 0; i < num_displays; i++) {
			Napi::Value display = _packDisplay(env, display_ids[i]);
			if (display.IsNull()) { continue; }
			displays.Set(num_returned++, display);
		}
	}
	catch (...) {
		SDL_free(display_ids);
		throw;
	}
	SDL_free(display_ids);

	return displays;
}

Napi::Value
video::getDisplays(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	return video::_getDisplays(env);
}
