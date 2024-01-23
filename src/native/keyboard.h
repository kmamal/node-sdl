#ifndef _KEYBOARD_H_
#define _KEYBOARD_H_

#include <napi.h>
#include <SDL.h>

namespace keyboard {

	extern int num_keys;
	extern const Uint8 *keys;

	Napi::Value getKey(const Napi::CallbackInfo &info);
	Napi::Value getScancode(const Napi::CallbackInfo &info);
	Napi::Value getState(const Napi::CallbackInfo &info);

}; // namespace keyboard

#endif // _KEYBOARD_H_
