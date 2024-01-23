#ifndef _VIDEO_H_
#define _VIDEO_H_

#include <napi.h>

namespace video {

	Napi::Value getDisplays(const Napi::CallbackInfo &info);

}; // namespace video

#endif // _VIDEO_H_
