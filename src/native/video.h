#ifndef _VIDEO_H_
#define _VIDEO_H_

#include <napi.h>
#include <SDL3/SDL.h>
#include <map>

namespace video {

	extern std::map<SDL_DisplayOrientation, std::string> orientations;
	extern std::map<SDL_PixelFormat, std::string> formats;

	Napi::Value _getDisplay (Napi::Env &env, SDL_DisplayID display_id);
	Napi::Array _getDisplays (Napi::Env &env);

	Napi::Value getDisplays(const Napi::CallbackInfo &info);

}; // namespace video

#endif // _VIDEO_H_
