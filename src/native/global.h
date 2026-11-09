#ifndef _GLOBAL_H_
#define _GLOBAL_H_

#include <napi.h>
#include <SDL3/SDL.h>
#include <mutex>
#include <memory>
#include <sstream>
#include <string>

namespace global {

	namespace detail {

		inline void streamArgs (std::ostream &) {}

		template <typename T, typename... Rest>
		void streamArgs (std::ostream &out, const T &first, const Rest &...rest)
		{
			out << first;
			((out << ", " << rest), ...);
		}

	}; // namespace detail

	template <typename... Args>
	Napi::Error sdlError (Napi::Env &env, const char *call, const Args &...args)
	{
		std::ostringstream message;
		message << call << '(';
		detail::streamArgs(message, args...);
		message << ") error: " << SDL_GetError();
		SDL_ClearError();
		return Napi::Error::New(env, message.str());
	}

	template <typename T>
	T *fromIdOrThrow (Napi::Env &env, T *ptr, const char *call, const char *what, Uint32 id)
	{
		if (ptr != nullptr) { return ptr; }
		std::ostringstream message;
		message << call << '(' << id << ") error: invalid " << what << " id";
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	struct SdlFree { void operator() (void *ptr) const { SDL_free(ptr); } };
	template <typename T> using SdlPtr = std::unique_ptr<T, SdlFree>;
	template <typename T> using SdlArray = std::unique_ptr<T[], SdlFree>;

	std::mutex &lock();
	void assertReady(Napi::Env &env);
	bool isReady();
	bool isMainThread();
	void processInitRequests();
	void teardown();

	Napi::Value initialize(const Napi::CallbackInfo &info);
	Napi::Value initSubsystem(const Napi::CallbackInfo &info);
	Napi::Value cleanup(const Napi::CallbackInfo &info);

}; // namespace global

#endif // _GLOBAL_H_
