#include "window.h"
#include <SDL3/SDL.h>
#include <string>
#include <sstream>
#include <cstdint>

static const char *TEXTURE_PROPERTY = "kmamal.sdl.texture";

static SDL_Window *
getWindow (Napi::Env &env, int window_id)
{
	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: invalid window id";
		throw Napi::Error::New(env, message.str());
	}
	return window;
}

#if defined(SDL_PLATFORM_LINUX)
	struct LinuxNativeData {
		uint64_t subsystem; // 1 = x11, 2 = wayland
		void *display;      // Display*   | wl_display*
		uintptr_t window;   // Window XID | wl_surface* / wl_egl_window*
	};
	#define NativeWindowHandle LinuxNativeData
	#define GL_NativeWindow LinuxNativeData
	#define GPU_NativeData LinuxNativeData
	#define GPU_WINDOW_FLAG SDL_WINDOW_VULKAN
#elif defined(SDL_PLATFORM_WIN32)
	#define NativeWindowHandle HWND
	#define GL_NativeWindow HWND
	struct GPU_NativeData {
		HWND hwnd;
		HINSTANCE hinstance;
	};
	#define GPU_WINDOW_FLAG 0
#elif defined(SDL_PLATFORM_MACOS)
	#include "cocoa-window.h"
	#define NativeWindowHandle NSView *
	#define GL_NativeWindow CALayer *
	struct GPU_NativeData {
		CALayer *layer;
	};
	#define GPU_WINDOW_FLAG SDL_WINDOW_METAL
#endif

void
updateRenderer(
	Napi::Env &env,
	SDL_Window *window,
	bool *is_accelerated,
	bool *is_vsync
) {
	int window_id = SDL_GetWindowID(window);
	// Not likely to fail.

	SDL_Renderer *old_renderer = SDL_GetRenderer(window);
	if (old_renderer != nullptr) {
		SDL_DestroyRenderer(old_renderer);
		SDL_SetPointerProperty(SDL_GetWindowProperties(window), TEXTURE_PROPERTY, nullptr);
	}

	SDL_Renderer *renderer = nullptr;
	for (int i = 0; i < 2; i++) {
		renderer = SDL_CreateRenderer(window, *is_accelerated ? nullptr : SDL_SOFTWARE_RENDERER);
		if (renderer != nullptr) {
			SDL_ClearError();
			break;
		}

		*is_accelerated = !*is_accelerated;
	}

	if (renderer == nullptr) {
		std::ostringstream message;
		message << "SDL_CreateRenderer(" << window_id << ", " << *is_accelerated << ", " << *is_vsync << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_SetRenderVSync(renderer, *is_vsync ? 1 : 0)) { SDL_ClearError(); }

	const char *renderer_name = SDL_GetRendererName(renderer);
	if (renderer_name == nullptr) {
		std::ostringstream message;
		message << "SDL_GetRendererName(" << window_id << ", " << *is_accelerated << ", " << *is_vsync << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}
	*is_accelerated = SDL_strcmp(renderer_name, SDL_SOFTWARE_RENDERER) != 0;

	int vsync;
	if (!SDL_GetRenderVSync(renderer, &vsync)) {
		std::ostringstream message;
		message << "SDL_GetRenderVSync(" << window_id << ", " << *is_accelerated << ", " << *is_vsync << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}
	*is_vsync = vsync != 0;
}


Napi::Value
window::create (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std:: string title = info[0].As<Napi::String>().Utf8Value();
	int display = info[1].As<Napi::Number>().Int32Value();
	int x = info[2].IsNull() ? (int) SDL_WINDOWPOS_CENTERED_DISPLAY(display) : info[2].As<Napi::Number>().Int32Value();
	int y = info[3].IsNull() ? (int) SDL_WINDOWPOS_CENTERED_DISPLAY(display) : info[3].As<Napi::Number>().Int32Value();
	int width = info[4].IsNull() ? 640 : info[4].As<Napi::Number>().Int32Value();
	int height = info[5].IsNull() ? 480 : info[5].As<Napi::Number>().Int32Value();
	bool is_visible = info[6].As<Napi::Boolean>().Value();
	bool is_fullscreen = info[7].As<Napi::Boolean>().Value();
	bool is_resizable = info[8].As<Napi::Boolean>().Value();
	bool is_borderless = info[9].As<Napi::Boolean>().Value();
	bool is_always_on_top = info[10].As<Napi::Boolean>().Value();
	bool is_accelerated = info[11].As<Napi::Boolean>().Value();
	bool is_vsync = info[12].As<Napi::Boolean>().Value();
	bool is_opengl = info[13].As<Napi::Boolean>().Value();
	bool is_webgpu = info[14].As<Napi::Boolean>().Value();

	Uint64 desired_flags = 0
		| SDL_WINDOW_HIDDEN | SDL_WINDOW_HIGH_PIXEL_DENSITY
		| (is_fullscreen ? SDL_WINDOW_FULLSCREEN : 0)
		| (is_resizable ? SDL_WINDOW_RESIZABLE : 0)
		| (is_borderless ? SDL_WINDOW_BORDERLESS : 0)
		| (is_always_on_top ? SDL_WINDOW_ALWAYS_ON_TOP : 0)
		| (is_opengl ? SDL_WINDOW_OPENGL : 0)
		| (is_webgpu ? GPU_WINDOW_FLAG : 0)
		;

	SDL_PropertiesID create_props = SDL_CreateProperties();
	SDL_SetStringProperty(create_props, SDL_PROP_WINDOW_CREATE_TITLE_STRING, title.c_str());
	SDL_SetNumberProperty(create_props, SDL_PROP_WINDOW_CREATE_X_NUMBER, x);
	SDL_SetNumberProperty(create_props, SDL_PROP_WINDOW_CREATE_Y_NUMBER, y);
	SDL_SetNumberProperty(create_props, SDL_PROP_WINDOW_CREATE_WIDTH_NUMBER, width);
	SDL_SetNumberProperty(create_props, SDL_PROP_WINDOW_CREATE_HEIGHT_NUMBER, height);
	SDL_SetNumberProperty(create_props, SDL_PROP_WINDOW_CREATE_FLAGS_NUMBER, desired_flags);

	SDL_Window *window = SDL_CreateWindowWithProperties(create_props);
	SDL_DestroyProperties(create_props);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_CreateWindow() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	try {
		int window_id = SDL_GetWindowID(window);
		if (window_id == 0) {
			std::ostringstream message;
			message << "SDL_GetWindowID() error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		Uint64 actual_flags = SDL_GetWindowFlags(window);
		is_fullscreen = actual_flags & SDL_WINDOW_FULLSCREEN;
		is_resizable = actual_flags & SDL_WINDOW_RESIZABLE;
		is_borderless = actual_flags & SDL_WINDOW_BORDERLESS;
		is_always_on_top = actual_flags & SDL_WINDOW_ALWAYS_ON_TOP;

		SDL_GetWindowPosition(window, &x, &y);
		SDL_GetWindowSize(window, &width, &height);

		int pixel_width, pixel_height;
		SDL_GetWindowSizeInPixels(window, &pixel_width, &pixel_height);

		display = SDL_GetDisplayForWindow(window);
		if (display == 0) {
			std::ostringstream message;
			message << "SDL_GetDisplayForWindow(" << window_id << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		if (!SDL_StartTextInput(window)) { SDL_ClearError(); }

		Napi::Object native = Napi::Object::New(env);

		SDL_PropertiesID window_props = SDL_GetWindowProperties(window);
		bool has_wm_info = window_props != 0;
		std::string message_of_failed_wm_info;
		if (!has_wm_info) {
			message_of_failed_wm_info = SDL_GetError();
			SDL_ClearError();
		}

		#if defined(SDL_PLATFORM_LINUX)
			const char *video_driver = SDL_GetCurrentVideoDriver();
			bool is_x11 = false;
			if (has_wm_info) {
				bool is_wayland = SDL_strcmp(video_driver, "wayland") == 0;
				is_x11 = SDL_strcmp(video_driver, "x11") == 0;
				if (!is_x11 && !is_wayland) {
					has_wm_info = false;
					message_of_failed_wm_info = "native handles are only supported under the x11 and wayland video drivers";
				}
			}

			if (has_wm_info) {
				native.Set("subsystem", Napi::String::New(env, is_x11 ? "x11" : "wayland"));
			}
			else {
				native.Set("subsystem", env.Null());
			}
		#else
			native.Set("subsystem", env.Null());
		#endif

		Napi::Value native_handle;
		if (has_wm_info) {
			NativeWindowHandle _native_handle;
			#if defined(SDL_PLATFORM_LINUX)
				if (is_x11) {
					_native_handle = {
						1,
						SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_X11_DISPLAY_POINTER, nullptr),
						(uintptr_t) SDL_GetNumberProperty(window_props, SDL_PROP_WINDOW_X11_WINDOW_NUMBER, 0),
					};
				}
				else {
					_native_handle = {
						2,
						SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_WAYLAND_DISPLAY_POINTER, nullptr),
						(uintptr_t) SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_WAYLAND_SURFACE_POINTER, nullptr),
					};
				}
			#elif defined(SDL_PLATFORM_WIN32)
				_native_handle = (HWND) SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_WIN32_HWND_POINTER, nullptr);
			#elif defined(SDL_PLATFORM_MACOS)
				NSWindow *cocoa_window = (NSWindow *) SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_COCOA_WINDOW_POINTER, nullptr);
				_native_handle = getCocoaWindowHandle(cocoa_window);
			#endif
			native_handle = Napi::Buffer<NativeWindowHandle>::Copy(env, &_native_handle, 1);
		}
		else {
			native_handle = env.Null();
		}
		native.Set("handle", native_handle);

		if (is_opengl) {
			if (!has_wm_info) {
				std::ostringstream message;
				message << "Window has set { opengl: true } but querying the native handles failed with: " << message_of_failed_wm_info;
				SDL_ClearError();
				throw Napi::Error::New(env, message.str());
			}

			GL_NativeWindow native_gl;
			#if defined(SDL_PLATFORM_LINUX)
				if (is_x11) {
					native_gl = {
						1,
						SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_X11_DISPLAY_POINTER, nullptr),
						(uintptr_t) SDL_GetNumberProperty(window_props, SDL_PROP_WINDOW_X11_WINDOW_NUMBER, 0),
					};
				}
				else {
					native_gl = {
						2,
						SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_WAYLAND_DISPLAY_POINTER, nullptr),
						(uintptr_t) SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_WAYLAND_EGL_WINDOW_POINTER, nullptr),
					};
				}
			#elif defined(SDL_PLATFORM_WIN32)
				native_gl = (HWND) SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_WIN32_HWND_POINTER, nullptr);
			#elif defined(SDL_PLATFORM_MACOS)
				NSWindow *cocoa_gl_window = (NSWindow *) SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_COCOA_WINDOW_POINTER, nullptr);
				native_gl = getCocoaGlView(cocoa_gl_window);
			#endif
			native.Set("gl", Napi::Buffer<GL_NativeWindow>::Copy(env, &native_gl, 1));
		}
		else if (is_webgpu) {
			if (!has_wm_info) {
				std::ostringstream message;
				message << "Window has set { webgpu: true } but querying the native handles failed with: " << message_of_failed_wm_info;
				SDL_ClearError();
				throw Napi::Error::New(env, message.str());
			}

			GPU_NativeData native_gpu;
			#if defined(SDL_PLATFORM_LINUX)
				if (is_x11) {
					native_gpu = {
						1,
						SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_X11_DISPLAY_POINTER, nullptr),
						(uintptr_t) SDL_GetNumberProperty(window_props, SDL_PROP_WINDOW_X11_WINDOW_NUMBER, 0),
					};
				}
				else {
					native_gpu = {
						2,
						SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_WAYLAND_DISPLAY_POINTER, nullptr),
						(uintptr_t) SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_WAYLAND_SURFACE_POINTER, nullptr),
					};
				}
			#elif defined(SDL_PLATFORM_WIN32)
				native_gpu.hwnd = (HWND) SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_WIN32_HWND_POINTER, nullptr);
				native_gpu.hinstance = (HINSTANCE) SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_WIN32_INSTANCE_POINTER, nullptr);
			#elif defined(SDL_PLATFORM_MACOS)
				NSWindow *cocoa_gpu_window = (NSWindow *) SDL_GetPointerProperty(window_props, SDL_PROP_WINDOW_COCOA_WINDOW_POINTER, nullptr);
				native_gpu.layer = getCocoaGpuView(cocoa_gpu_window);
			#endif
			native.Set("gpu", Napi::Buffer<GPU_NativeData>::Copy(env, &native_gpu, 1));
		}
		else {
			updateRenderer(env, window, &is_accelerated, &is_vsync);
		}

		if (is_visible) { SDL_ShowWindow(window); }

		Napi::Object result = Napi::Object::New(env);
		result.Set("id", window_id);
		result.Set("x", x);
		result.Set("y", y);
		result.Set("width", width);
		result.Set("height", height);
		result.Set("pixelWidth", pixel_width);
		result.Set("pixelHeight", pixel_height);
		result.Set("displayId", display);
		result.Set("fullscreen", is_fullscreen);
		result.Set("resizable", is_resizable);
		result.Set("borderless", is_borderless);
		result.Set("alwaysOnTop", is_always_on_top);
		result.Set("accelerated", is_accelerated);
		result.Set("vsync", is_vsync);
		result.Set("native", native);

		return result;
	}
	catch (...) {
		SDL_Renderer *renderer = SDL_GetRenderer(window);
		if (renderer != nullptr) { SDL_DestroyRenderer(renderer); }
		SDL_DestroyWindow(window);
		throw;
	}
}

Napi::Value
window::setTitle (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	std:: string title = info[1].As<Napi::String>().Utf8Value();

	SDL_Window *window = getWindow(env, window_id);

	SDL_SetWindowTitle(window, title.c_str());

	return env.Undefined();
}

Napi::Value
window::setPosition (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	int x = info[1].As<Napi::Number>().Int32Value();
	int y = info[2].As<Napi::Number>().Int32Value();

	SDL_Window *window = getWindow(env, window_id);

	SDL_SetWindowPosition(window, x, y);

	return env.Undefined();
}

Napi::Value
window::setSize (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	int width = info[1].As<Napi::Number>().Int32Value();
	int height = info[2].As<Napi::Number>().Int32Value();

	SDL_Window *window = getWindow(env, window_id);

	SDL_SetWindowSize(window, width, height);

	int pixel_width, pixel_height;
	SDL_GetWindowSizeInPixels(window, &pixel_width, &pixel_height);

	Napi::Object result = Napi::Object::New(env);
	result.Set("pixelWidth", pixel_width);
	result.Set("pixelHeight", pixel_height);

	return result;
}

Napi::Value
window::setFullscreen (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	bool is_fullscreen = info[1].As<Napi::Boolean>().Value();

	SDL_Window *window = getWindow(env, window_id);

	if (!SDL_SetWindowFullscreen(window, is_fullscreen)) {
		std::ostringstream message;
		message << "SDL_SetWindowFullscreen(" << window_id << ", " << is_fullscreen << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
window::setResizable (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	bool is_resizable = info[1].As<Napi::Boolean>().Value();

	SDL_Window *window = getWindow(env, window_id);

	SDL_SetWindowResizable(window, is_resizable);

	Uint64 actual_flags = SDL_GetWindowFlags(window);
	is_resizable = actual_flags & SDL_WINDOW_RESIZABLE;

	return Napi::Boolean::New(env, is_resizable);
}

Napi::Value
window::setBorderless (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	bool is_borderless = info[1].As<Napi::Boolean>().Value();

	SDL_Window *window = getWindow(env, window_id);

	SDL_SetWindowBordered(window, !is_borderless);

	Uint64 actual_flags = SDL_GetWindowFlags(window);
	is_borderless = actual_flags & SDL_WINDOW_BORDERLESS;

	return Napi::Boolean::New(env, is_borderless);
}

Napi::Value
window::setRelativeMouseMode (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	bool relative = info[1].As<Napi::Boolean>().Value();

	SDL_Window *window = getWindow(env, window_id);

	if (!SDL_SetWindowRelativeMouseMode(window, relative)) {
		std::ostringstream message;
		message << "SDL_SetWindowRelativeMouseMode(" << window_id << ", " << relative << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return Napi::Boolean::New(env, SDL_GetWindowRelativeMouseMode(window));
}

Napi::Value
window::setAcceleratedAndVsync (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	bool is_accelerated = info[1].As<Napi::Boolean>().Value();
	bool is_vsync = info[2].As<Napi::Boolean>().Value();

	SDL_Window *window = getWindow(env, window_id);

	updateRenderer(env, window, &is_accelerated, &is_vsync);

	Napi::Object result = Napi::Object::New(env);
	result.Set("accelerated", is_accelerated);
	result.Set("vsync", is_vsync);

	return result;
}

Napi::Value
window::focus (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Window *window = getWindow(env, window_id);

	SDL_RaiseWindow(window);

	return env.Undefined();
}

Napi::Value
window::show (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Window *window = getWindow(env, window_id);

	SDL_ShowWindow(window);

	return env.Undefined();
}

Napi::Value
window::hide (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Window *window = getWindow(env, window_id);

	SDL_HideWindow(window);

	return env.Undefined();
}

Napi::Value
window::maximize (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Window *window = getWindow(env, window_id);

	if (!SDL_MaximizeWindow(window)) {
		std::ostringstream message;
		message << "SDL_MaximizeWindow(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
window::minimize (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Window *window = getWindow(env, window_id);

	if (!SDL_MinimizeWindow(window)) {
		std::ostringstream message;
		message << "SDL_MinimizeWindow(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
window::restore (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Window *window = getWindow(env, window_id);

	if (!SDL_RestoreWindow(window)) {
		std::ostringstream message;
		message << "SDL_RestoreWindow(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
window::render (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	int width = info[1].As<Napi::Number>().Int32Value();
	int height = info[2].As<Napi::Number>().Int32Value();
	int stride = info[3].As<Napi::Number>().Int32Value();
	unsigned int format = info[4].As<Napi::Number>().Int32Value();
	void *pixels = info[5].As<Napi::Buffer<char>>().Data();
	SDL_ScaleMode scaling = static_cast<SDL_ScaleMode>(info[6].As<Napi::Number>().Int32Value());
	Napi::Value dstRectVal = info[7];
	bool hasDstRect = !dstRectVal.IsNull();
	SDL_FRect rect;
	if (hasDstRect) {
		Napi::Object dstRect = dstRectVal.As<Napi::Object>();
		rect.x = dstRect.Get("x").As<Napi::Number>().FloatValue();
		rect.y = dstRect.Get("y").As<Napi::Number>().FloatValue();
		rect.w = dstRect.Get("width").As<Napi::Number>().FloatValue();
		rect.h = dstRect.Get("height").As<Napi::Number>().FloatValue();
	}

	SDL_Window *window = getWindow(env, window_id);

	SDL_Renderer *renderer = SDL_GetRenderer(window);
	if (renderer == nullptr) {
		std::ostringstream message;
		message << "SDL_GetRenderer(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_PropertiesID props = SDL_GetWindowProperties(window);
	SDL_Texture *texture = (SDL_Texture *) SDL_GetPointerProperty(props, TEXTURE_PROPERTY, nullptr);

	if (texture == nullptr
		|| texture->w != width
		|| texture->h != height
		|| texture->format != (SDL_PixelFormat) format
	) {
		if (texture != nullptr) {
			SDL_DestroyTexture(texture);
			SDL_SetPointerProperty(props, TEXTURE_PROPERTY, nullptr);
		}

		texture = SDL_CreateTexture(renderer, (SDL_PixelFormat) format, SDL_TEXTUREACCESS_STREAMING, width, height);
		if (texture == nullptr) {
			std::ostringstream message;
			message << "SDL_CreateTexture(" << width << ", " << height << ", " << format << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		if (!SDL_SetTextureBlendMode(texture, SDL_BLENDMODE_NONE)) {
			std::ostringstream message;
			message << "SDL_SetTextureBlendMode(" << window_id << ") error: " << SDL_GetError();
			SDL_ClearError();
			SDL_DestroyTexture(texture);
			throw Napi::Error::New(env, message.str());
		}

		SDL_SetPointerProperty(props, TEXTURE_PROPERTY, texture);
	}

	if(!SDL_SetTextureScaleMode(texture, scaling)) {
		std::ostringstream message;
		message << "SDL_SetTextureScaleMode(" << window_id << ", " << scaling << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_UpdateTexture(texture, nullptr, pixels, stride)) {
		std::ostringstream message;
		message << "SDL_UpdateTexture(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_RenderClear(renderer)) {
		std::ostringstream message;
		message << "SDL_RenderClear(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_RenderTexture(renderer, texture, nullptr, hasDstRect ? &rect : nullptr)) {
		std::ostringstream message;
		message << "SDL_RenderTexture(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_RenderPresent(renderer);

	return env.Undefined();
}

Napi::Value
window::setIcon (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	int w = info[1].As<Napi::Number>().Int32Value();
	int h = info[2].As<Napi::Number>().Int32Value();
	int stride = info[3].As<Napi::Number>().Int32Value();
	unsigned int format = info[4].As<Napi::Number>().Int32Value();
	void *pixels = info[5].As<Napi::Buffer<char>>().Data();

	SDL_Window *window = getWindow(env, window_id);

	SDL_Surface* surface = SDL_CreateSurfaceFrom(w, h, (SDL_PixelFormat) format, pixels, stride);
	if (surface == nullptr) {
		std::ostringstream message;
		message << "SDL_CreateSurfaceFrom(" << window_id << ", " << w << ", " << h << ", " << format << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_SetWindowIcon(window, surface);

	SDL_DestroySurface(surface);

	return env.Undefined();
}

Napi::Value
window::flash (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	int type = info[1].As<Napi::Number>().Int32Value();

	SDL_Window *window = getWindow(env, window_id);

	SDL_FlashOperation op;
	switch (type) {
		case 2: op = SDL_FLASH_UNTIL_FOCUSED; break;
		case 1: op = SDL_FLASH_BRIEFLY; break;
		default: op = SDL_FLASH_CANCEL; break;
	}

	if (!SDL_FlashWindow(window, op)) {
		std::ostringstream message;
		message << "SDL_FlashWindow(" << window_id << ", " << type << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
window::destroy (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Window *window = getWindow(env, window_id);

	SDL_Renderer *renderer = SDL_GetRenderer(window);
	if (renderer != nullptr) { SDL_DestroyRenderer(renderer); }

	SDL_DestroyWindow(window);

	return env.Undefined();
}
