#ifndef _POWER_H_
#define _POWER_H_

#include <napi.h>

namespace power {

	Napi::Value getInfo(const Napi::CallbackInfo &info);

}; // namespace power

#endif // _POWER_H_
