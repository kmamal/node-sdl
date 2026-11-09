#include "video.h"
#include "global.h"
#include <SDL3/SDL.h>
#include <string>
#include <map>


std::map<SDL_DisplayOrientation, packed::Str> video::orientations;
std::map<SDL_PixelFormat, packed::Str> video::formats;


static packed::Value
_packDisplay (SDL_DisplayID display_id)
{
	SDL_Rect rect;

	if (!SDL_GetDisplayBounds(display_id, &rect)) {
		SDL_ClearError();
		return packed::Value();
	}
	packed::Value geometry = packed::Value::object();
	geometry.set("x", rect.x);
	geometry.set("y", rect.y);
	geometry.set("width", rect.w);
	geometry.set("height", rect.h);

	const char *_name = SDL_GetDisplayName(display_id);
	packed::Value name;
	if (_name != nullptr) { name = _name; }
	else { SDL_ClearError(); }

	packed::Value format;
	packed::Value frequency;
	const SDL_DisplayMode *mode = SDL_GetCurrentDisplayMode(display_id);
	if (mode == nullptr) { SDL_ClearError(); }
	else {
		auto format_entry = video::formats.find(mode->format);
		if (format_entry != video::formats.end()) { format = packed::Value::ref(format_entry->second); }
		if (mode->refresh_rate != 0.0f) { frequency = mode->refresh_rate; }
	}

	// Can't fail: SDL only rejects unknown displays (falling back to the full
	// bounds otherwise), and SDL_GetDisplayBounds just succeeded for this one.
	SDL_GetDisplayUsableBounds(display_id, &rect);
	packed::Value usable = packed::Value::object();
	usable.set("x", rect.x);
	usable.set("y", rect.y);
	usable.set("width", rect.w);
	usable.set("height", rect.h);

	packed::Value scale;
	float _scale = SDL_GetDisplayContentScale(display_id);
	if (_scale == 0.0f) { SDL_ClearError(); }
	else { scale = _scale; }

	SDL_DisplayOrientation _orientation = SDL_GetCurrentDisplayOrientation(display_id);
	auto orientation_entry = video::orientations.find(_orientation);
	packed::Value orientation;
	if (orientation_entry != video::orientations.end()) { orientation = packed::Value::ref(orientation_entry->second); }
	else { SDL_ClearError(); }

	packed::Value display = packed::Value::object();
	display.set("id", display_id);
	display.set("name", std::move(name));
	display.set("format", std::move(format));
	display.set("frequency", std::move(frequency));
	display.set("geometry", std::move(geometry));
	display.set("usable", std::move(usable));
	display.set("scale", std::move(scale));
	display.set("orientation", std::move(orientation));

	return display;
}

packed::Value
video::_getDisplay (SDL_DisplayID display_id)
{
	return _packDisplay(display_id);
}

Napi::Array
video::_getDisplays (Napi::Env &env)
{
	int num_displays;
	global::SdlArray<SDL_DisplayID> display_ids(SDL_GetDisplays(&num_displays));
	if (!display_ids) {
		throw global::sdlError(env, "SDL_GetDisplays");
	}

	Napi::Array displays = Napi::Array::New(env);

	int num_returned = 0;
	for (int i = 0; i < num_displays; i++) {
		packed::Value display = _packDisplay(display_ids[i]);
		if (display.isNull()) { continue; }
		displays.Set(num_returned++, display.toNapi(env));
	}

	return displays;
}

Napi::Value
video::getDrivers(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	Napi::Array all = Napi::Array::New(env);
	int num_drivers = SDL_GetNumVideoDrivers();
	for (int i = 0; i < num_drivers; i ++) {
		all.Set(i, SDL_GetVideoDriver(i));
	}

	Napi::Object result = Napi::Object::New(env);
	result.Set("all", all);
	result.Set("current", Napi::String::New(env, SDL_GetCurrentVideoDriver()));

	return result;
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

	std::lock_guard<std::mutex> guard(global::lock());

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
			throw global::sdlError(env, "SDL_ConvertPixels", src_w, src_h, src_format, dst_format);
		}
		return env.Undefined();
	}

	SDL_Surface *src_surface = SDL_CreateSurfaceFrom(src_w, src_h, src_format, src, src_stride);
	if (src_surface == nullptr) {
		throw global::sdlError(env, "SDL_CreateSurfaceFrom", src_w, src_h, src_format);
	}
	SDL_SetSurfaceBlendMode(src_surface, SDL_BLENDMODE_NONE);

	bool is_yuv = SDL_ISPIXELFORMAT_FOURCC(dst_format);
	SDL_Surface *dst_surface = is_yuv
		? SDL_CreateSurface(dst_w, dst_h, SDL_PIXELFORMAT_ARGB8888)
		: SDL_CreateSurfaceFrom(dst_w, dst_h, dst_format, dst, dst_stride);
	if (dst_surface == nullptr) {
		SDL_DestroySurface(src_surface);
		throw global::sdlError(env, is_yuv ? "SDL_CreateSurface" : "SDL_CreateSurfaceFrom", dst_w, dst_h, is_yuv ? SDL_PIXELFORMAT_ARGB8888 : dst_format);
	}

	bool ok = SDL_BlitSurfaceScaled(src_surface, nullptr, dst_surface, nullptr, scaling);
	SDL_DestroySurface(src_surface);
	if (!ok) {
		SDL_DestroySurface(dst_surface);
		throw global::sdlError(env, "SDL_BlitSurfaceScaled", src_w, src_h, src_format, dst_w, dst_h, dst_format);
	}

	if (is_yuv) {
		ok = SDL_ConvertPixels(dst_w, dst_h, dst_surface->format, dst_surface->pixels, dst_surface->pitch, dst_format, dst, dst_stride);
	}
	SDL_DestroySurface(dst_surface);
	if (!ok) {
		throw global::sdlError(env, "SDL_ConvertPixels", dst_w, dst_h, SDL_PIXELFORMAT_ARGB8888, dst_format);
	}

	return env.Undefined();
}
