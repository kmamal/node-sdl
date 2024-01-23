#ifndef _MOUSE_H_
#define _MOUSE_H_

#include <napi.h>

namespace mouse {

	Napi::Value getButton(const Napi::CallbackInfo &info);
	Napi::Value getPosition(const Napi::CallbackInfo &info);
	Napi::Value setPosition(const Napi::CallbackInfo &info);
	Napi::Value getCursor(const Napi::CallbackInfo &info);
	Napi::Value setCursor(const Napi::CallbackInfo &info);
	Napi::Value resetCursor(const Napi::CallbackInfo &info);
	Napi::Value setCursorImage(const Napi::CallbackInfo &info);
	Napi::Value showCursor(const Napi::CallbackInfo &info);
	Napi::Value redrawCursor(const Napi::CallbackInfo &info);
	Napi::Value capture(const Napi::CallbackInfo &info);

}; // namespace mouse

#endif // _MOUSE_H_
