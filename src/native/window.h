#ifndef _WINDOW_H_
#define _WINDOW_H_

#include <napi.h>
#include <SDL3/SDL.h>

namespace window {

	void resetTexture (SDL_Window *window);
	SDL_HitTestResult SDLCALL hitTest (SDL_Window *window, const SDL_Point *area, void *data);
	void destroyWindow (SDL_Window *window);
	void forgetEnv (napi_env env);
	Napi::Value create (const Napi::CallbackInfo &info);
	Napi::Value setTitle (const Napi::CallbackInfo &info);
	Napi::Value setPosition (const Napi::CallbackInfo &info);
	Napi::Value setSize (const Napi::CallbackInfo &info);
	Napi::Value setFullscreen (const Napi::CallbackInfo &info);
	Napi::Value setFullscreenMode (const Napi::CallbackInfo &info);
	Napi::Value setResizable (const Napi::CallbackInfo &info);
	Napi::Value setBorderless (const Napi::CallbackInfo &info);
	Napi::Value setRelativeMouseMode (const Napi::CallbackInfo &info);
	Napi::Value getMouseCaptured (const Napi::CallbackInfo &info);
	Napi::Value setAcceleratedAndVsync (const Napi::CallbackInfo &info);
	Napi::Value focus (const Napi::CallbackInfo &info);
	Napi::Value show (const Napi::CallbackInfo &info);
	Napi::Value hide (const Napi::CallbackInfo &info);
	Napi::Value maximize (const Napi::CallbackInfo &info);
	Napi::Value minimize (const Napi::CallbackInfo &info);
	Napi::Value restore (const Napi::CallbackInfo &info);
	Napi::Value render (const Napi::CallbackInfo &info);
	Napi::Value setIcon (const Napi::CallbackInfo &info);
	Napi::Value flash (const Napi::CallbackInfo &info);
	Napi::Value registerHitTestHandler (const Napi::CallbackInfo &info);
	Napi::Value setHitTest (const Napi::CallbackInfo &info);
	Napi::Value destroy (const Napi::CallbackInfo &info);

}; // namespace window

#endif // _WINDOW_H_
