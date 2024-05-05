#include "video.h"
#include <SDL.h>
#include <string>
#include <sstream>
#include <map>


std::map<SDL_PixelFormatEnum, std::string> video::formats;


Napi::Value
video::getDisplays(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int num_displays = SDL_GetNumVideoDisplays();
	if (num_displays < 0) {
		std::ostringstream message;
		message << "SDL_GetNumVideoDisplays() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array displays = Napi::Array::New(env, num_displays);

	for (int i = 0; i < num_displays; i++) {
		const char *name = SDL_GetDisplayName(i);
		if(name == nullptr) {
			std::ostringstream message;
			message << "SDL_GetDisplayName(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		SDL_DisplayMode mode;
		if (SDL_GetCurrentDisplayMode(i, &mode) < 0) {
			std::ostringstream message;
			message << "SDL_GetCurrentDisplayMode(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		SDL_Rect rect;
		if(SDL_GetDisplayBounds(i, &rect) < 0) {
			std::ostringstream message;
			message << "SDL_GetDisplayBounds(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		Napi::Object geometry = Napi::Object::New(env);
		geometry.Set("x", Napi::Number::New(env, rect.x));
		geometry.Set("y", Napi::Number::New(env, rect.y));
		geometry.Set("width", Napi::Number::New(env, rect.w));
		geometry.Set("height", Napi::Number::New(env, rect.h));

		if(SDL_GetDisplayUsableBounds(i, &rect) < 0) {
			std::ostringstream message;
			message << "SDL_GetDisplayUsableBounds(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		Napi::Object usable = Napi::Object::New(env);
		usable.Set("x", Napi::Number::New(env, rect.x));
		usable.Set("y", Napi::Number::New(env, rect.y));
		usable.Set("width", Napi::Number::New(env, rect.w));
		usable.Set("height", Napi::Number::New(env, rect.h));

		Napi::Value dpi;
		float ddpi, hdpi, vdpi;
		if (true || SDL_GetDisplayDPI(i, &ddpi, &hdpi, &vdpi) < 0) {
			dpi = env.Null();
		} else {
			Napi::Object dpi_obj = Napi::Object::New(env);
			dpi_obj.Set("diagonal", Napi::Number::New(env, ddpi));
			dpi_obj.Set("horizontal", Napi::Number::New(env, hdpi));
			dpi_obj.Set("vertical", Napi::Number::New(env, vdpi));
			dpi = dpi_obj;
		}

		Napi::Object display = Napi::Object::New(env);
		display.Set("name", Napi::String::New(env, name));
		display.Set("format", video::formats[(SDL_PixelFormatEnum) mode.format]);
		display.Set("frequency", Napi::Number::New(env, mode.refresh_rate));
		display.Set("geometry", geometry);
		display.Set("usable", usable);
		display.Set("dpi", dpi);

		displays.Set(i, display);
	}

	return displays;
}
