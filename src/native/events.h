#ifndef _EVENTS_H_
#define _EVENTS_H_

#include <napi.h>
#include <SDL.h>

namespace events {

	void dispatchEvent(const SDL_Event &event);

	Napi::Value poll(const Napi::CallbackInfo &info);

}; // namespace events

#endif // _EVENTS_H_
