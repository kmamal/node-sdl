#ifndef _VIDEO_H_
#define _VIDEO_H_

#include <napi.h>
#include <SDL.h>
#include <map>

namespace video {

	extern std::map<SDL_PixelFormatEnum, std::string> formats;

	Napi::Value getDisplays(const Napi::CallbackInfo &info);

}; // namespace video

#endif // _VIDEO_H_
