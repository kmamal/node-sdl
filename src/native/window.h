#ifndef _WINDOW_H_
#define _WINDOW_H_

#include <napi.h>
#include <SDL.h>

namespace window {

		Napi::Value create(const Napi::CallbackInfo &info);
		Napi::Value setTitle(const Napi::CallbackInfo &info);
		Napi::Value setPosition(const Napi::CallbackInfo &info);
		Napi::Value setSize(const Napi::CallbackInfo &info);
		Napi::Value setFullscreen(const Napi::CallbackInfo &info);
		Napi::Value setResizable(const Napi::CallbackInfo &info);
		Napi::Value setBorderless(const Napi::CallbackInfo &info);
		Napi::Value setAcceleratedAndVsync(const Napi::CallbackInfo &info);
		Napi::Value focus(const Napi::CallbackInfo &info);
		Napi::Value show(const Napi::CallbackInfo &info);
		Napi::Value hide(const Napi::CallbackInfo &info);
		Napi::Value maximize(const Napi::CallbackInfo &info);
		Napi::Value minimize(const Napi::CallbackInfo &info);
		Napi::Value restore(const Napi::CallbackInfo &info);
		Napi::Value render(const Napi::CallbackInfo &info);
		Napi::Value setIcon(const Napi::CallbackInfo &info);
		Napi::Value flash(const Napi::CallbackInfo &info);
		Napi::Value destroy(const Napi::CallbackInfo &info);

}; // namespace window

#endif // _WINDOW_H_
