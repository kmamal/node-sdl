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

	Napi::Value frequency = mode->refresh_rate != 0.0f
		? Napi::Number::New(env, mode->refresh_rate)
		: env.Null();

	Napi::Object display = Napi::Object::New(env);
	display.Set("id", display_id);
	display.Set("name", name);
	display.Set("format", format);
	display.Set("frequency", frequency);
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

Napi::Value
video::convert(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int src_w = info[0].As<Napi::Number>().Int32Value();
	int src_h = info[1].As<Napi::Number>().Int32Value();
	SDL_PixelFormat src_format = (SDL_PixelFormat) info[2].As<Napi::Number>().Int32Value();
	void *src = info[3].As<Napi::Buffer<char>>().Data();
	int src_stride = info[4].As<Napi::Number>().Int32Value();

	int dst_w = info[5].As<Napi::Number>().Int32Value();
	int dst_h = info[6].As<Napi::Number>().Int32Value();
	SDL_PixelFormat dst_format = (SDL_PixelFormat) info[7].As<Napi::Number>().Int32Value();
	void *dst = info[8].As<Napi::Buffer<char>>().Data();
	int dst_stride = info[9].As<Napi::Number>().Int32Value();

	SDL_ScaleMode scaling = (SDL_ScaleMode) info[10].As<Napi::Number>().Int32Value();

	if (src_w == dst_w && src_h == dst_h) {
		if (!SDL_ConvertPixels(src_w, src_h, src_format, src, src_stride, dst_format, dst, dst_stride)) {
			std::ostringstream message;
			message << "SDL_ConvertPixels(" << src_w << ", " << src_h << ", " << src_format << ", " << dst_format << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}
		return env.Undefined();
	}

	SDL_Surface *src_surface = SDL_CreateSurfaceFrom(src_w, src_h, src_format, src, src_stride);
	if (src_surface == nullptr) {
		std::ostringstream message;
		message << "SDL_CreateSurfaceFrom(" << src_w << ", " << src_h << ", " << src_format << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}
	SDL_SetSurfaceBlendMode(src_surface, SDL_BLENDMODE_NONE);

	bool is_yuv = SDL_ISPIXELFORMAT_FOURCC(dst_format);
	SDL_Surface *dst_surface = is_yuv
		? SDL_CreateSurface(dst_w, dst_h, SDL_PIXELFORMAT_ARGB8888)
		: SDL_CreateSurfaceFrom(dst_w, dst_h, dst_format, dst, dst_stride);
	if (dst_surface == nullptr) {
		SDL_DestroySurface(src_surface);
		std::ostringstream message;
		message << (is_yuv ? "SDL_CreateSurface(" : "SDL_CreateSurfaceFrom(") << dst_w << ", " << dst_h << ", " << dst_format << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	bool ok = SDL_BlitSurfaceScaled(src_surface, nullptr, dst_surface, nullptr, scaling);
	SDL_DestroySurface(src_surface);
	if (!ok) {
		SDL_DestroySurface(dst_surface);
		std::ostringstream message;
		message << "SDL_BlitSurfaceScaled(" << src_w << ", " << src_h << ", " << src_format << ", " << dst_w << ", " << dst_h << ", " << dst_format << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (is_yuv) {
		ok = SDL_ConvertPixels(dst_w, dst_h, dst_surface->format, dst_surface->pixels, dst_surface->pitch, dst_format, dst, dst_stride);
	}
	SDL_DestroySurface(dst_surface);
	if (!ok) {
		std::ostringstream message;
		message << "SDL_ConvertPixels(" << dst_w << ", " << dst_h << ", " << SDL_PIXELFORMAT_ARGB8888 << ", " << dst_format << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}
