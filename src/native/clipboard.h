#ifndef _CLIPBOARD_H_
#define _CLIPBOARD_H_

#include <napi.h>

namespace clipboard {

	Napi::Value getText(const Napi::CallbackInfo &info);
	Napi::Value setText(const Napi::CallbackInfo &info);

}; // namespace clipboard

#endif // _CLIPBOARD_H_
