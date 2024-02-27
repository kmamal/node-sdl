#include "window.h"
#include <SDL.h>
#include <SDL_syswm.h>
#include <string>
#include <sstream>


#if defined(__LINUX__)
	#define GL_NativeWindow Window
	struct GPU_NativeData {
		Display *display;
		Window window;
	};
	#define GPU_WINDOW_FLAG SDL_WINDOW_VULKAN
#elif defined(__WIN32__)
	#define GL_NativeWindow HWND
	struct GPU_NativeData {
		HWND hwnd;
		HINSTANCE hinstance;
	};
	#define GPU_WINDOW_FLAG 0
#elif defined(__MACOSX__)
	#include "cocoa-window.h"
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

	Napi::Value native;

	if (is_opengl || is_webgpu) {
		SDL_SysWMinfo info;
		SDL_VERSION(&(info.version));
		bool got_info = SDL_GetWindowWMInfo(window, &info);
		if (got_info == SDL_FALSE) {
			std::ostringstream message;
			message << "SDL_GetWindowWMInfo(" << window_id << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}

		if (is_opengl) {
			int native_size = sizeof(GL_NativeWindow);
			Napi::Buffer<char> native_buffer = Napi::Buffer<char>::New(env, native_size);
			GL_NativeWindow *native_window = (GL_NativeWindow *) native_buffer.Data();
			native = native_buffer;

			#if defined(__LINUX__)
				*native_window = info.info.x11.window;
			#elif defined(__WIN32__)
				*native_window = info.info.win.window;
			#elif defined(__MACOSX__)
				*native_window = getCocoaGlView(info.info.cocoa.window);
			#endif
		} else if (is_webgpu) {
			int native_size = sizeof(GPU_NativeData);
			Napi::Buffer<char> native_buffer = Napi::Buffer<char>::New(env, native_size);
			GPU_NativeData *native_data = (GPU_NativeData *) native_buffer.Data();
			native = native_buffer;

			#if defined(__LINUX__)
				native_data->display = info.info.x11.display;
				native_data->window = info.info.x11.window;
			#elif defined(__WIN32__)
				native_data->hwnd = info.info.win.window;
				native_data->hinstance = info.info.win.hinstance;
			#elif defined(__MACOSX__)
				native_data->layer = getCocoaGpuView(info.info.cocoa.window);
			#endif
		}
	}
	else {
		updateRenderer(env, window, &is_accelerated, &is_vsync);
		native = env.Null();
	}

	if (is_visible) { SDL_ShowWindow(window); }

	Napi::Object result = Napi::Object::New(env);
	result.Set("id", Napi::Number::New(env, window_id));
	result.Set("x", Napi::Number::New(env, x));
	result.Set("y", Napi::Number::New(env, y));
	result.Set("width", Napi::Number::New(env, width));
	result.Set("height", Napi::Number::New(env, height));
	result.Set("pixelWidth", Napi::Number::New(env, pixel_width));
	result.Set("pixelHeight", Napi::Number::New(env, pixel_height));
	result.Set("fullscreen", Napi::Boolean::New(env, is_fullscreen));
	result.Set("resizable", Napi::Boolean::New(env, is_resizable));
	result.Set("borderless", Napi::Boolean::New(env, is_borderless));
	result.Set("alwaysOnTop", Napi::Boolean::New(env, is_always_on_top));
	result.Set("accelerated", Napi::Boolean::New(env, is_accelerated));
	result.Set("vsync", Napi::Boolean::New(env, is_vsync));
	result.Set("native", native);
	result.Set("skipTaskbar", Napi::Boolean::New(env, should_skip_taskbar));
	result.Set("popupMenu", Napi::Boolean::New(env, is_popup_menu));
	result.Set("tooltip", Napi::Boolean::New(env, is_tooltip));
	result.Set("utility", Napi::Boolean::New(env, is_utility));

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
	result.Set("pixelWidth", Napi::Number::New(env, pixel_width));
	result.Set("pixelHeight", Napi::Number::New(env, pixel_height));

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
	result.Set("accelerated", Napi::Boolean::New(env, is_accelerated));
	result.Set("vsync", Napi::Boolean::New(env, is_vsync));

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

	SDL_Renderer *renderer = SDL_GetRenderer(window);
	if (renderer == nullptr) {
		std::ostringstream message;
		message << "SDL_GetRenderer(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_Surface *surface = SDL_CreateRGBSurfaceWithFormatFrom(pixels, w, h, SDL_BITSPERPIXEL(format), stride, format);
	if (surface == nullptr) {
		std::ostringstream message;
		message << "SDL_CreateRGBSurfaceWithFormatFrom(" << window_id << ", " << w << ", " << h << ", " << stride << ", " << format << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (SDL_SetSurfaceBlendMode(surface, SDL_BLENDMODE_NONE) < 0) {
		std::ostringstream message;
		message << "SDL_SetSurfaceBlendMode(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_Texture *texture = SDL_CreateTextureFromSurface(renderer, surface);
	if (texture == nullptr) {
		SDL_FreeSurface(surface);

		std::ostringstream message;
		message << "SDL_CreateTextureFromSurface(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (SDL_RenderClear(renderer) < 0) {
		SDL_DestroyTexture(texture);
		SDL_FreeSurface(surface);

		std::ostringstream message;
		message << "SDL_RenderClear(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (SDL_RenderCopy(renderer, texture, nullptr, nullptr) < 0) {
		SDL_DestroyTexture(texture);
		SDL_FreeSurface(surface);

		std::ostringstream message;
		message << "SDL_RenderCopy(" << window_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_RenderPresent(renderer);

	SDL_DestroyTexture(texture);
	SDL_FreeSurface(surface);
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
	if (renderer != nullptr) { SDL_DestroyRenderer(renderer); }

	SDL_DestroyWindow(window);

	return env.Undefined();
}
