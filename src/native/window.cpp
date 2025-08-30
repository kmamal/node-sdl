#include "window.h"
#include <SDL.h>
#include <SDL_syswm.h>
#include <string>
#include <sstream>
#include <map>

struct CachedTexture {
	SDL_Texture *texture;
	int width;
	int height;
	unsigned int format;
};

std::map<SDL_Window*, CachedTexture> cachedTextures;

#if defined(__LINUX__)
	#define NativeWindowHandle Window
	#define GL_NativeWindow Window
	struct GPU_NativeData {
		Display *display;
		Window window;
	};
	#define GPU_WINDOW_FLAG SDL_WINDOW_VULKAN
#elif defined(__WIN32__)
	#define NativeWindowHandle HWND
	#define GL_NativeWindow HWND
	struct GPU_NativeData {
		HWND hwnd;
		HINSTANCE hinstance;
	};
	#define GPU_WINDOW_FLAG 0
#elif defined(__MACOSX__)
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

	CachedTexture &cached = cachedTextures[window];
	if (cached.texture != nullptr) {
		SDL_DestroyTexture(cached.texture);
		cached.texture = nullptr;
	}

	SDL_Renderer *old_renderer = SDL_GetRenderer(window);
	if (old_renderer != nullptr) {
		SDL_DestroyRenderer(old_renderer);
	}

	SDL_Renderer *renderer;
	for (int i = 0; i < 4; i++) {
		int renderer_flags = 0
			| (*is_accelerated ? SDL_RENDERER_ACCELERATED : SDL_RENDERER_SOFTWARE)
			| (*is_vsync ? SDL_RENDERER_PRESENTVSYNC : 0);

		renderer = SDL_CreateRenderer(window, -1, renderer_flags);
		if (renderer != nullptr) {
			SDL_ClearError();
			break;
		}

		*is_vsync = !*is_vsync;
		if (i % 2) { *is_accelerated = !*is_accelerated; }
	}

	if (renderer == nullptr) {
		std::ostringstream message;
		message << "SDL_CreateRenderer(" << window_id << ", " << is_accelerated << ", " << is_vsync << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_RendererInfo info;
	if (SDL_GetRendererInfo(renderer, &info) < 0) {
		std::ostringstream message;
		message << "SDL_GetRendererInfo(" << window_id << ", " << is_accelerated << ", " << is_vsync << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	*is_accelerated = info.flags & SDL_RENDERER_ACCELERATED;
	*is_vsync = info.flags & SDL_RENDERER_PRESENTVSYNC;
}


Napi::Value
window::create (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std:: string title = info[0].As<Napi::String>().Utf8Value();
	int display = info[1].As<Napi::Number>().Int32Value();
	int x = info[2].IsNull() ? SDL_WINDOWPOS_CENTERED_DISPLAY(display) : info[2].As<Napi::Number>().Int32Value();
	int y = info[3].IsNull() ? SDL_WINDOWPOS_CENTERED_DISPLAY(display) : info[3].As<Napi::Number>().Int32Value();
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
	bool should_skip_taskbar = info[15].As<Napi::Boolean>().Value();
	bool is_popup_menu = info[16].As<Napi::Boolean>().Value();
	bool is_tooltip = info[17].As<Napi::Boolean>().Value();
	bool is_utility = info[18].As<Napi::Boolean>().Value();

	int desired_flags = 0
		| SDL_WINDOW_HIDDEN | SDL_WINDOW_ALLOW_HIGHDPI
		| (is_fullscreen ? SDL_WINDOW_FULLSCREEN_DESKTOP : 0)
		| (is_resizable ? SDL_WINDOW_RESIZABLE : 0)
		| (is_borderless ? SDL_WINDOW_BORDERLESS : 0)
		| (is_always_on_top ? SDL_WINDOW_ALWAYS_ON_TOP : 0)
		| (is_opengl ? SDL_WINDOW_OPENGL : 0)
		| (is_webgpu ? GPU_WINDOW_FLAG : 0)
		| (should_skip_taskbar ? SDL_WINDOW_SKIP_TASKBAR : 0)
		| (is_popup_menu ? SDL_WINDOW_POPUP_MENU : 0)
		| (is_tooltip ? SDL_WINDOW_TOOLTIP : 0)
		| (is_utility ? SDL_WINDOW_UTILITY : 0)
		;

	SDL_Window *window = SDL_CreateWindow(title.c_str(), x, y, width, height, desired_flags);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_CreateWindow() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	int window_id = SDL_GetWindowID(window);
	if (window_id == 0) {
		std::ostringstream message;
		message << "SDL_GetWindowID() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	int actual_flags = SDL_GetWindowFlags(window);
	is_fullscreen = actual_flags & (SDL_WINDOW_FULLSCREEN | SDL_WINDOW_FULLSCREEN_DESKTOP);
	is_resizable = actual_flags & SDL_WINDOW_RESIZABLE;
	is_borderless = actual_flags & SDL_WINDOW_BORDERLESS;
	is_always_on_top = actual_flags & SDL_WINDOW_ALWAYS_ON_TOP;
	should_skip_taskbar = actual_flags & SDL_WINDOW_SKIP_TASKBAR;
	is_popup_menu = actual_flags & SDL_WINDOW_POPUP_MENU;
	is_tooltip = actual_flags & SDL_WINDOW_TOOLTIP;
	is_utility = actual_flags & SDL_WINDOW_UTILITY;

	SDL_GetWindowPosition(window, &x, &y);

	int pixel_width, pixel_height;
	SDL_GetWindowSizeInPixels(window, &pixel_width, &pixel_height);

	display = SDL_GetWindowDisplayIndex(window);
	if (display < 0) {
		std::ostringstream message;
		message << "SDL_GetWindowDisplayIndex(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Object native = Napi::Object::New(env);

	bool has_wm_info;
	std::string message_of_failed_wm_info;
	SDL_SysWMinfo sys_wm_info;
	SDL_VERSION(&(sys_wm_info.version));
	has_wm_info = SDL_GetWindowWMInfo(window, &sys_wm_info) == SDL_TRUE;
	if (!has_wm_info) {
		message_of_failed_wm_info = SDL_GetError();
		SDL_ClearError();
	}

	Napi::Value native_handle;
	if (has_wm_info) {
		NativeWindowHandle _native_handle;
		#if defined(__LINUX__)
			_native_handle = sys_wm_info.info.x11.window;
		#elif defined(__WIN32__)
			_native_handle = sys_wm_info.info.win.window;
		#elif defined(__MACOSX__)
			_native_handle = getCocoaWindowHandle(sys_wm_info.info.cocoa.window);
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
			message << "Window has set { opengl: true } but SDL_GetWindowWMInfo failed with: " << message_of_failed_wm_info;
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		GL_NativeWindow native_gl;
		#if defined(__LINUX__)
			native_gl = sys_wm_info.info.x11.window;
		#elif defined(__WIN32__)
			native_gl = sys_wm_info.info.win.window;
		#elif defined(__MACOSX__)
			native_gl = getCocoaGlView(sys_wm_info.info.cocoa.window);
		#endif
		native.Set("gl", Napi::Buffer<GL_NativeWindow>::Copy(env, &native_gl, 1));
	}
	else if (is_webgpu) {
		if (!has_wm_info) {
			std::ostringstream message;
			message << "Window has set { webgpu: true } but SDL_GetWindowWMInfo failed with: " << message_of_failed_wm_info;
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		GPU_NativeData native_gpu;
		#if defined(__LINUX__)
			native_gpu.display = sys_wm_info.info.x11.display;
			native_gpu.window = sys_wm_info.info.x11.window;
		#elif defined(__WIN32__)
			native_gpu.hwnd = sys_wm_info.info.win.window;
			native_gpu.hinstance = sys_wm_info.info.win.hinstance;
		#elif defined(__MACOSX__)
			native_gpu.layer = getCocoaGpuView(sys_wm_info.info.cocoa.window);
		#endif
		native.Set("gpu", Napi::Buffer<GPU_NativeData>::Copy(env, &native_gpu, 1));
	}
	else {
		cachedTextures[window] = {};
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
	result.Set("displayIndex", display);
	result.Set("fullscreen", is_fullscreen);
	result.Set("resizable", is_resizable);
	result.Set("borderless", is_borderless);
	result.Set("alwaysOnTop", is_always_on_top);
	result.Set("accelerated", is_accelerated);
	result.Set("vsync", is_vsync);
	result.Set("native", native);
	result.Set("skipTaskbar", should_skip_taskbar);
	result.Set("popupMenu", is_popup_menu);
	result.Set("tooltip", is_tooltip);
	result.Set("utility", is_utility);

	return result;
}

Napi::Value
window::setTitle (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	std:: string title = info[1].As<Napi::String>().Utf8Value();

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

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

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

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

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

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
	int is_fullscreen = info[1].As<Napi::Boolean>().Value();

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (SDL_SetWindowFullscreen(window, is_fullscreen ? SDL_WINDOW_FULLSCREEN_DESKTOP : 0) < 0) {
		std::ostringstream message;
		message << "SDL_SetWindowFullscreen(" << window_id << ", " << is_fullscreen << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	int actual_flags = SDL_GetWindowFlags(window);
	is_fullscreen = actual_flags & (SDL_WINDOW_FULLSCREEN | SDL_WINDOW_FULLSCREEN_DESKTOP);

	return Napi::Boolean::New(env, is_fullscreen);
}

Napi::Value
window::setResizable (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	bool is_resizable = info[1].As<Napi::Boolean>().Value();

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_SetWindowResizable(window, is_resizable ? SDL_TRUE : SDL_FALSE);

	int actual_flags = SDL_GetWindowFlags(window);
	is_resizable = actual_flags & SDL_WINDOW_RESIZABLE;

	return Napi::Boolean::New(env, is_resizable);
}

Napi::Value
window::setBorderless (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	bool is_borderless = info[1].As<Napi::Boolean>().Value();

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_SetWindowBordered(window, is_borderless ? SDL_FALSE : SDL_TRUE);

	int actual_flags = SDL_GetWindowFlags(window);
	is_borderless = actual_flags & SDL_WINDOW_BORDERLESS;

	return Napi::Boolean::New(env, is_borderless);
}

Napi::Value
window::setAcceleratedAndVsync (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	bool is_accelerated = info[1].As<Napi::Boolean>().Value();
	bool is_vsync = info[2].As<Napi::Boolean>().Value();

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

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

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_RaiseWindow(window);

	return env.Undefined();
}

Napi::Value
window::show (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_ShowWindow(window);

	return env.Undefined();
}

Napi::Value
window::hide (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_HideWindow(window);

	return env.Undefined();
}

Napi::Value
window::maximize (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_MaximizeWindow(window);

	return env.Undefined();
}

Napi::Value
window::minimize (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_MinimizeWindow(window);

	return env.Undefined();
}

Napi::Value
window::restore (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_RestoreWindow(window);

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
	SDL_Rect rect;
	if (hasDstRect) {
		Napi::Object dstRect = dstRectVal.As<Napi::Object>();
		rect.x = dstRect.Get("x").As<Napi::Number>().Int32Value();
		rect.y = dstRect.Get("y").As<Napi::Number>().Int32Value();
		rect.w = dstRect.Get("width").As<Napi::Number>().Int32Value();
		rect.h = dstRect.Get("height").As<Napi::Number>().Int32Value();
	}

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_Renderer *renderer = SDL_GetRenderer(window);
	if (renderer == nullptr) {
		std::ostringstream message;
		message << "SDL_GetRenderer(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	CachedTexture &cached = cachedTextures[window];
	SDL_Texture *texture = cached.texture;

	if (texture == nullptr
		|| cached.width != width
		|| cached.height != height
		|| cached.format != format
	) {
		if (texture != nullptr) { SDL_DestroyTexture(texture); }

		texture = SDL_CreateTexture(renderer, format, SDL_TEXTUREACCESS_STREAMING, width, height);
		if (texture == nullptr) {
			std::ostringstream message;
			message << "SDL_CreateTexture(" << width << ", " << height << ", " << format << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		if (SDL_SetTextureBlendMode(texture, SDL_BLENDMODE_NONE) < 0) {
			std::ostringstream message;
			message << "SDL_SetTextureBlendMode(" << window_id << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		cached.texture = texture;
		cached.width = width;
		cached.height = height;
		cached.format = format;
	}

	if(SDL_SetTextureScaleMode(texture, scaling) < 0) {
		std::ostringstream message;
		message << "SDL_SetTextureScaleMode(" << window_id << ", " << scaling << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_UpdateTexture(texture, nullptr, pixels, stride);

	if (SDL_RenderClear(renderer) < 0) {
		std::ostringstream message;
		message << "SDL_RenderClear(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (SDL_RenderCopy(renderer, texture, nullptr, hasDstRect ? &rect : nullptr) < 0) {
		std::ostringstream message;
		message << "SDL_RenderCopy(" << window_id << ") error: " << SDL_GetError();
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

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_Surface* surface = SDL_CreateRGBSurfaceWithFormatFrom(pixels, w, h, SDL_BITSPERPIXEL(format), stride, format);
	if (surface == nullptr) {
		std::ostringstream message;
		message << "SDL_CreateRGBSurfaceWithFormatFrom(" << window_id << ", " << w << ", " << h << ", " << format << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_SetWindowIcon(window, surface);

	SDL_FreeSurface(surface);

	return env.Undefined();
}

Napi::Value
window::flash (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	int window_id = info[0].As<Napi::Number>().Int32Value();
	int type = info[1].As<Napi::Number>().Int32Value();

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_FlashOperation op;
	switch (type) {
		case 2: op = SDL_FLASH_UNTIL_FOCUSED; break;
		case 1: op = SDL_FLASH_BRIEFLY; break;
		default: op = SDL_FLASH_CANCEL; break;
	}

	if (SDL_FlashWindow(window, op) < 0) {
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

	SDL_Window *window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		std::ostringstream message;
		message << "SDL_GetWindowFromID(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_Renderer *renderer = SDL_GetRenderer(window);
	if (renderer != nullptr) {
		SDL_DestroyRenderer(renderer);

		CachedTexture &cached = cachedTextures[window];
		if (cached.texture != nullptr) { SDL_DestroyTexture(cached.texture); }
		cachedTextures.erase(window);
	}

	SDL_DestroyWindow(window);

	return env.Undefined();
}
