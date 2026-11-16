#include "video.h"
#include "global.h"
#include <SDL3/SDL.h>
#include <string>
#include <map>


const std::map<SDL_DisplayOrientation, packed::Str> video::orientations {
	// { SDL_ORIENTATION_UNKNOWN, nullptr },
	{ SDL_ORIENTATION_LANDSCAPE, "landscape" },
	{ SDL_ORIENTATION_LANDSCAPE_FLIPPED, "landscapeFlipped" },
	{ SDL_ORIENTATION_PORTRAIT, "portrait" },
	{ SDL_ORIENTATION_PORTRAIT_FLIPPED, "portraitFlipped" },
};

const std::map<SDL_PixelFormat, packed::Str> video::formats {
	{ SDL_PIXELFORMAT_RGB332, "rgb332" },
	{ SDL_PIXELFORMAT_XRGB4444, "xrgb4444" },
	{ SDL_PIXELFORMAT_XBGR4444, "xbgr4444" },
	{ SDL_PIXELFORMAT_XRGB1555, "xrgb1555" },
	{ SDL_PIXELFORMAT_XBGR1555, "xbgr1555" },
	{ SDL_PIXELFORMAT_ARGB4444, "argb4444" },
	{ SDL_PIXELFORMAT_RGBA4444, "rgba4444" },
	{ SDL_PIXELFORMAT_ABGR4444, "abgr4444" },
	{ SDL_PIXELFORMAT_BGRA4444, "bgra4444" },
	{ SDL_PIXELFORMAT_ARGB1555, "argb1555" },
	{ SDL_PIXELFORMAT_RGBA5551, "rgba5551" },
	{ SDL_PIXELFORMAT_ABGR1555, "abgr1555" },
	{ SDL_PIXELFORMAT_BGRA5551, "bgra5551" },
	{ SDL_PIXELFORMAT_RGB565, "rgb565" },
	{ SDL_PIXELFORMAT_BGR565, "bgr565" },
	{ SDL_PIXELFORMAT_RGB24, "rgb24" },
	{ SDL_PIXELFORMAT_BGR24, "bgr24" },
	{ SDL_PIXELFORMAT_XRGB8888, "xrgb8888" },
	{ SDL_PIXELFORMAT_RGBX8888, "rgbx8888" },
	{ SDL_PIXELFORMAT_XBGR8888, "xbgr8888" },
	{ SDL_PIXELFORMAT_BGRX8888, "bgrx8888" },
	{ SDL_PIXELFORMAT_ARGB8888, "argb8888" },
	{ SDL_PIXELFORMAT_RGBA8888, "rgba8888" },
	{ SDL_PIXELFORMAT_ABGR8888, "abgr8888" },
	{ SDL_PIXELFORMAT_BGRA8888, "bgra8888" },
	{ SDL_PIXELFORMAT_ARGB2101010, "argb2101010" },
	{ SDL_PIXELFORMAT_XRGB2101010, "xrgb2101010" },
	{ SDL_PIXELFORMAT_XBGR2101010, "xbgr2101010" },
	{ SDL_PIXELFORMAT_ABGR2101010, "abgr2101010" },
	{ SDL_PIXELFORMAT_RGB48, "rgb48" },
	{ SDL_PIXELFORMAT_BGR48, "bgr48" },
	{ SDL_PIXELFORMAT_RGBA64, "rgba64" },
	{ SDL_PIXELFORMAT_ARGB64, "argb64" },
	{ SDL_PIXELFORMAT_BGRA64, "bgra64" },
	{ SDL_PIXELFORMAT_ABGR64, "abgr64" },
	{ SDL_PIXELFORMAT_RGB48_FLOAT, "rgb48f" },
	{ SDL_PIXELFORMAT_BGR48_FLOAT, "bgr48f" },
	{ SDL_PIXELFORMAT_RGBA64_FLOAT, "rgba64f" },
	{ SDL_PIXELFORMAT_ARGB64_FLOAT, "argb64f" },
	{ SDL_PIXELFORMAT_BGRA64_FLOAT, "bgra64f" },
	{ SDL_PIXELFORMAT_ABGR64_FLOAT, "abgr64f" },
	{ SDL_PIXELFORMAT_RGB96_FLOAT, "rgb96f" },
	{ SDL_PIXELFORMAT_BGR96_FLOAT, "bgr96f" },
	{ SDL_PIXELFORMAT_RGBA128_FLOAT, "rgba128f" },
	{ SDL_PIXELFORMAT_ARGB128_FLOAT, "argb128f" },
	{ SDL_PIXELFORMAT_BGRA128_FLOAT, "bgra128f" },
	{ SDL_PIXELFORMAT_ABGR128_FLOAT, "abgr128f" },
	{ SDL_PIXELFORMAT_YV12, "yv12" },
	{ SDL_PIXELFORMAT_IYUV, "iyuv" },
	{ SDL_PIXELFORMAT_YUY2, "yuy2" },
	{ SDL_PIXELFORMAT_UYVY, "uyvy" },
	{ SDL_PIXELFORMAT_YVYU, "yvyu" },
	{ SDL_PIXELFORMAT_NV12, "nv12" },
	{ SDL_PIXELFORMAT_NV21, "nv21" },
	{ SDL_PIXELFORMAT_P010, "p010" },
};


packed::Value
video::_getDisplay (SDL_DisplayID display_id)
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
		packed::Value display = video::_getDisplay(display_ids[i]);
		if (display.isNull()) { continue; }
		displays.Set(num_returned++, display.toNapi(env));
	}

	return displays;
}

Napi::Value
video::getDrivers (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	Napi::Array all = Napi::Array::New(env);
	int num_drivers = SDL_GetNumVideoDrivers();
	for (int i = 0; i < num_drivers; i ++) {
		all.Set(i, SDL_GetVideoDriver(i));
	}

	Napi::Object result = Napi::Object::New(env);
	result.Set("all", all);
	// Only NULL before the video subsystem is initialized, which the JS
	// assertInitialized() guard rules out, so this can never be NULL here.
	result.Set("current", Napi::String::New(env, SDL_GetCurrentVideoDriver()));

	return result;
}

Napi::Value
video::getDisplays (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	return video::_getDisplays(env);
}

Napi::Value
video::convert (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::recursive_mutex> guard(global::lock());

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
	if (!SDL_SetSurfaceBlendMode(src_surface, SDL_BLENDMODE_NONE)) {
		Napi::Error error = global::sdlError(env, "SDL_SetSurfaceBlendMode");
		SDL_DestroySurface(src_surface);
		throw error;
	}

	bool is_yuv = SDL_ISPIXELFORMAT_FOURCC(dst_format);
	SDL_Surface *dst_surface = is_yuv
		? SDL_CreateSurface(dst_w, dst_h, SDL_PIXELFORMAT_ARGB8888)
		: SDL_CreateSurfaceFrom(dst_w, dst_h, dst_format, dst, dst_stride);
	if (dst_surface == nullptr) {
		Napi::Error error = global::sdlError(env, is_yuv ? "SDL_CreateSurface" : "SDL_CreateSurfaceFrom", dst_w, dst_h, is_yuv ? SDL_PIXELFORMAT_ARGB8888 : dst_format);
		SDL_DestroySurface(src_surface);
		throw error;
	}

	if (!SDL_BlitSurfaceScaled(src_surface, nullptr, dst_surface, nullptr, scaling)) {
		Napi::Error error = global::sdlError(env, "SDL_BlitSurfaceScaled", src_w, src_h, src_format, dst_w, dst_h, dst_format);
		SDL_DestroySurface(src_surface);
		SDL_DestroySurface(dst_surface);
		throw error;
	}
	SDL_DestroySurface(src_surface);

	if (is_yuv) {
		if (!SDL_ConvertPixels(dst_w, dst_h, dst_surface->format, dst_surface->pixels, dst_surface->pitch, dst_format, dst, dst_stride)) {
			Napi::Error error = global::sdlError(env, "SDL_ConvertPixels", dst_w, dst_h, SDL_PIXELFORMAT_ARGB8888, dst_format);
			SDL_DestroySurface(dst_surface);
			throw error;
		}
	}
	SDL_DestroySurface(dst_surface);

	return env.Undefined();
}
