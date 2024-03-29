#ifndef _GLOBAL_H_
#define _GLOBAL_H_

#include <napi.h>

namespace global {

	extern const char *no_error;

	Napi::Value initialize(const Napi::CallbackInfo &info);
	Napi::Value cleanup(const Napi::CallbackInfo &info);

}; // namespace global

#endif // _GLOBAL_H_
