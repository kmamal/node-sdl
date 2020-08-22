#include "sdl-helpers.h"
#include <SDL2/SDL.h>
#include <cstdio>
#include <cstdlib>
#include <map>


#define RETURN_ERROR(...) do { \
	char * error; \
	int result = asprintf(&error, __VA_ARGS__); \
	return result == -1 ? new ErrorMessage("asprintf failed", false) : new ErrorMessage(error); \
} while (0)


#define CALL_LOGGER(...) do { \
	if (logger) { \
		int length = logger(__VA_ARGS__); \
		if (length < 0) { RETURN_ERROR("logger failed\n"); } \
	} \
} while (0)

namespace SdlHelpers {

static bool initialized = false;
static bool initialized_video = false;
static bool initialized_audio = false;

bool anyInitialized ()
{
	return initialized_video || initialized_audio;
}

ErrorMessage::
ErrorMessage(const char * _message, bool _should_dispose)
	: message(_message)
	, should_dispose(_should_dispose)
{}

ErrorMessage::
~ErrorMessage()
{
	if (!this->should_dispose) { return; }
	free((void *) this->message);
}


ErrorMessage *
init (Logger logger)
{
	if (initialized) { return nullptr; }

	// Init
	{
		if (SDL_Init(0) != 0) { RETURN_ERROR("SDL_Init(0) error: %s\n", SDL_GetError()); }
	}

	// Version
	{
		SDL_version compile_version;
		SDL_VERSION(&compile_version);

		SDL_version runtime_version;
		SDL_GetVersion(&runtime_version);

		CALL_LOGGER("SDL Compile Version: %d.%d.%d\n",
			compile_version.major,
			compile_version.minor,
			compile_version.patch
		);

		CALL_LOGGER("SDL Runtime Version: %d.%d.%d\n",
			runtime_version.major,
			runtime_version.minor,
			runtime_version.patch
		);

		const char * platform_name = SDL_GetPlatform();
		CALL_LOGGER("Platform: %s\n", platform_name);
	}

	initialized = true;
	return nullptr;
}

ErrorMessage *
initVideo (Logger logger)
{
	if (initialized_video) { return nullptr; }

	ErrorMessage * error = init(logger);
	if (error) { return error; }

	// Available Video Drivers
	{
		int num_drivers = SDL_GetNumVideoDrivers();
		if (num_drivers < 0) {
			RETURN_ERROR("SDL_GetNumVideoDrivers() error: %s\n", SDL_GetError());
		}

		CALL_LOGGER("Available video drivers:");
		const char * driver_name;

		for (int i = 0; i < num_drivers; i ++) {
			driver_name = SDL_GetVideoDriver(i);
			if(driver_name == nullptr) {
				RETURN_ERROR("SDL_GetVideoDriver(%d) error: %s\n", i, SDL_GetError());
			}
			CALL_LOGGER(" %s", driver_name);
		}

		CALL_LOGGER("\n");
	}

	// Init Video
	{
		if (SDL_VideoInit(nullptr) != 0) {
			RETURN_ERROR("SDL_VideoInit(NULL) error: %s\n", SDL_GetError());
		}
	}

	// Selected Video Driver
	{
		const char * driver_name = SDL_GetCurrentVideoDriver();
		if(driver_name == nullptr) {
			RETURN_ERROR("SDL_GetCurrentVideoDriver() error: %s\n", SDL_GetError());
		}
		CALL_LOGGER("Selected video driver: %s\n", driver_name);
	}

	// Available Displays
	{
		int num_displays = SDL_GetNumVideoDisplays();
		if (num_displays < 0) {
			RETURN_ERROR("SDL_GetNumVideoDisplays() error: %s\n", SDL_GetError());
		}

		CALL_LOGGER("Available displays:\n");
		const char * display_name;
		SDL_Rect display_rect;
		SDL_Rect display_usable_rect;
		SDL_DisplayMode display_mode;
		float display_ddpi;
		float display_hdpi;
		float display_vdpi;

		for (int i = 0; i < num_displays; i++) {
			display_name = SDL_GetDisplayName(i);
			if(display_name == nullptr) {
				RETURN_ERROR("SDL_GetDisplayName(%d) error: %s\n", i, SDL_GetError());
			}
			CALL_LOGGER("  \"%s\"", display_name);

			if(SDL_GetDisplayBounds(i, &display_rect) != 0) {
				RETURN_ERROR("SDL_GetDisplayBounds(%d) error: %s\n", i, SDL_GetError());
			}
			CALL_LOGGER(" (%d %d %d %d)",
				display_rect.x,
				display_rect.y,
				display_rect.w,
				display_rect.h
			);

			if(SDL_GetDisplayUsableBounds(i, &display_usable_rect) != 0) {
				RETURN_ERROR("SDL_GetDisplayUsableBounds(%d) error: %s\n", i, SDL_GetError());
			}
			CALL_LOGGER(" (%d %d %d %d)",
				display_usable_rect.x,
				display_usable_rect.y,
				display_usable_rect.w,
				display_usable_rect.h
			);

			if (SDL_GetCurrentDisplayMode(i, &display_mode) != 0) {
				RETURN_ERROR("SDL_GetCurrentDisplayMode(%d) error: %s\n", i, SDL_GetError());
			}
			CALL_LOGGER(" %dHz", display_mode.refresh_rate);

			if (SDL_GetDisplayDPI(i, &display_ddpi, &display_hdpi, &display_vdpi) != 0) {
				RETURN_ERROR("SDL_GetDisplayDPI(%d) error: %s\n", i, SDL_GetError());
			}
			CALL_LOGGER(" (%.2f %.2f %.2f)", display_ddpi, display_hdpi, display_vdpi);

			const char * display_format_name = SDL_GetPixelFormatName(display_mode.format);
			if (display_format_name == nullptr) {
				RETURN_ERROR("SDL_GetPixelFormatName(%d) error: %s\n", display_mode.format, SDL_GetError());
			}
			CALL_LOGGER(" %s", display_format_name);

			CALL_LOGGER("\n");
		}
	}

	// Available Render Drivers
	{
		int num_render_drivers = SDL_GetNumRenderDrivers();
		if (num_render_drivers < 0) {
			RETURN_ERROR("SDL_GetNumRenderDrivers() error: %s\n", SDL_GetError());
		}

		CALL_LOGGER("Available render drivers:\n");
		SDL_RendererInfo renderer_info;
		for (int i = 0; i < num_render_drivers; i++) {
			if (SDL_GetRenderDriverInfo(i, &renderer_info) != 0) {
				RETURN_ERROR("SDL_GetRenderDriverInfo(%d) error: %s\n", i, SDL_GetError());
			}
			CALL_LOGGER("  \"%s\" accelerated:%d vsync:%d texture-target:%d\n",
				renderer_info.name,
				!!(renderer_info.flags & SDL_RENDERER_ACCELERATED),
				!!(renderer_info.flags & SDL_RENDERER_PRESENTVSYNC),
				!!(renderer_info.flags & SDL_RENDERER_TARGETTEXTURE)
			);
		}
	}

	initialized_video = true;
	return nullptr;
}

ErrorMessage *
initAudio (Logger logger)
{
	if (initialized_audio) { return nullptr; }

	ErrorMessage * error = init(logger);
	if (error) { return error; }

	// Available Audio Drivers
	{
		int num_drivers = SDL_GetNumAudioDrivers();
		if (num_drivers < 0) {
			RETURN_ERROR("SDL_GetNumAudioDrivers() error: %s\n", SDL_GetError());
		}

		CALL_LOGGER("Available audio drivers:");
		const char * driver_name;

		for (int i = 0; i < num_drivers; i ++) {
			driver_name = SDL_GetAudioDriver(i);
			if(driver_name == nullptr) {
				RETURN_ERROR("SDL_GetAudioDriver(%d) error: %s\n", i, SDL_GetError());
			}
			CALL_LOGGER(" %s", driver_name);
		}

		CALL_LOGGER("\n");
	}

	// Init Audio
	{
		if (SDL_InitSubSystem(SDL_INIT_AUDIO) != 0) {
			RETURN_ERROR("SDL_InitSubSystem(SDL_INIT_AUDIO) error: %s\n", SDL_GetError());
		}

		if (SDL_AudioInit(nullptr) != 0) {
			RETURN_ERROR("SDL_AudioInit(NULL) error: %s\n", SDL_GetError());
		}
	}

	// Selected Audio Driver
	{
		const char * driver_name = SDL_GetCurrentAudioDriver();
		if(driver_name == nullptr) {
			RETURN_ERROR("SDL_GetCurrentAudioDriver() error: %s\n", SDL_GetError());
		}
		CALL_LOGGER("Selected audio driver: %s\n", driver_name);
	}

	// Available Audio Devices
	{
		int num_audio_devices = SDL_GetNumAudioDevices(0);
		if (num_audio_devices < 0) { goto no_audio_devices; }

		CALL_LOGGER("Available audio_devices:");
		const char * audio_device_name;

		for (int i = 0; i < num_audio_devices; i++) {
			audio_device_name = SDL_GetAudioDeviceName(i, 0);
			if(audio_device_name == nullptr) {
				RETURN_ERROR("SDL_GetAudioDeviceName(%d) error: %s\n", i, SDL_GetError());
			}
			CALL_LOGGER(" \"%s\"", audio_device_name);
		}
		CALL_LOGGER("\n");
	}
	no_audio_devices:

	initialized_audio = true;
	return nullptr;
}

void
quit ()
{
	if (!initialized) { return; }

	// Quit
	{
		SDL_Quit();
	}

	initialized = false;
}

void quitVideo()
{
	if (!initialized_video) { return; }

	// Quit Video
	{
		SDL_VideoQuit();
	}

	initialized_video = false;
	if (!anyInitialized()) { quit(); }
}

void quitAudio()
{
	if (!initialized_audio) { return; }

	// Quit Audio
	{
		SDL_AudioQuit();
		SDL_QuitSubSystem(SDL_INIT_AUDIO);
	}

	initialized_audio = false;
	if (!anyInitialized()) { quit(); }
}

ErrorMessage *
createWindow (Logger logger, const char * title, int x, int y, int w, int h, int * window_id, Framebuffer * fb)
{
	ErrorMessage * error = initVideo(logger);
	if (error) { return error; }

	// Create Window
	SDL_Window * window;
	SDL_Surface * surface;
	{
		if (x == -1) { x = SDL_WINDOWPOS_CENTERED; }
		if (y == -1) { y = SDL_WINDOWPOS_CENTERED; }
		if (w == -1) { w = 640; }
		if (h == -1) { h = 480; }
		window = SDL_CreateWindow(title, x, y, w, h, SDL_WINDOW_RESIZABLE);
		if (window == nullptr) {
			RETURN_ERROR("SDL_CreateWindow() error: %s\n", SDL_GetError());
		}

		*window_id = SDL_GetWindowID(window);
		if (*window_id == 0) {
			RETURN_ERROR("SDL_GetWindowID() error: %s\n", SDL_GetError());
		}

		surface =  SDL_GetWindowSurface(window);
		if (surface == nullptr) {
			RETURN_ERROR("SDL_GetWindowSurface() error: %s\n", SDL_GetError());
		}

		Uint32 format = surface->format->format;
		bool is_packed_32 = SDL_PIXELTYPE(format) == SDL_PIXELTYPE_PACKED32;
		bool is_packed_lil_endian = SDL_PIXELORDER(format) == SDL_PACKEDORDER_XRGB;
		bool is_packed_big_endian = SDL_PIXELORDER(format) == SDL_PACKEDORDER_BGRX;
		bool is_device_lil_endian = SDL_BYTEORDER == SDL_LIL_ENDIAN;

		bool can_use_surface = is_packed_32 && (is_device_lil_endian
			? is_packed_lil_endian
			: is_packed_big_endian
		);

		if (!can_use_surface) {
			RETURN_ERROR("Can't use surface with format %d\n", format);
		}

		fb->w = surface->w;
		fb->h = surface->h;
		fb->stride = surface->pitch;
		fb->pixels = surface->pixels;
	}

	return nullptr;
}

// After resizing a window this function must be called again to return a valid surface.

// You may not combine this with 3D or the rendering API on this window.

// Force the window's pixel format

ErrorMessage *
updateWindow (Logger logger, int window_id)
{
	// Update Window
	{
		SDL_Window * window = SDL_GetWindowFromID(window_id);
		if (window == nullptr) {
			RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
		}

		if (SDL_UpdateWindowSurface(window) != 0) {
			RETURN_ERROR("SDL_UpdateWindowSurface(%d) error: %s\n", window_id, SDL_GetError());
		}
	}

	if (false) { quitVideo(); }

	return nullptr;
}

ErrorMessage *
destroyWindow (Logger logger, int window_id)
{
	// Destroy Window
	{
		SDL_Window * window = SDL_GetWindowFromID(window_id);
		if (window == nullptr) {
			RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
		}

		// SDL_DestroyRenderer(renderer);
		SDL_DestroyWindow(window);
	}

	if (false) { quitVideo(); }

	return nullptr;
}


void
packageEvent (const SDL_Event & event, Variant & object)
{
	object.emplace<1>(VariantMap());

	Variant value;
	switch (event.type) {

		case SDL_QUIT: {
			value.emplace<4>("quit");
			std::get<VariantMap>(object).insert({ "type", value });
			break;
		}

		case SDL_WINDOWEVENT: {
			value.emplace<3>(event.window.windowID);
			std::get<VariantMap>(object).insert({ "_window", value });

			switch (event.window.event) {

				case SDL_WINDOWEVENT_RESIZED: {
					value.emplace<4>("window-resized");
					std::get<VariantMap>(object).insert({ "type", value });

					value.emplace<3>(event.window.data1);
					std::get<VariantMap>(object).insert({ "width", value });

					value.emplace<3>(event.window.data2);
					std::get<VariantMap>(object).insert({ "height", value });

					break;
				}

			}

			break;
		}

		case SDL_KEYDOWN:
		case SDL_KEYUP: {
			SDL_Keysym symbol = event.key.keysym;
			const char * code_name = SDL_GetScancodeName(symbol.scancode);
			const char * key_name = SDL_GetKeyName(symbol.sym);

			value.emplace<4>(event.key.type == SDL_KEYDOWN ? "key-down" : "key-up");
			std::get<VariantMap>(object).insert({ "type", value });

			value.emplace<4>(key_name);
			std::get<VariantMap>(object).insert({ "key", value });

			value.emplace<4>(code_name);
			std::get<VariantMap>(object).insert({ "code", value });

			value.emplace<3>(event.key.repeat);
			std::get<VariantMap>(object).insert({ "repeat", value });

			value.emplace<3>(!!(symbol.mod & KMOD_ALT));
			std::get<VariantMap>(object).insert({ "alt", value });

			value.emplace<3>(!!(symbol.mod & KMOD_CTRL));
			std::get<VariantMap>(object).insert({ "ctrl", value });

			value.emplace<3>(!!(symbol.mod & KMOD_SHIFT));
			std::get<VariantMap>(object).insert({ "shift", value });

			value.emplace<3>(!!(symbol.mod & KMOD_GUI));
			std::get<VariantMap>(object).insert({ "super", value });

			value.emplace<3>(!!(symbol.mod & KMOD_MODE));
			std::get<VariantMap>(object).insert({ "altgr", value });

			value.emplace<3>(!!(symbol.mod & KMOD_NUM));
			std::get<VariantMap>(object).insert({ "numlock", value });

			value.emplace<3>(!!(symbol.mod & KMOD_CAPS));
			std::get<VariantMap>(object).insert({ "capslock", value });

			break;
		}

		case SDL_MOUSEMOTION: {
			value.emplace<4>("mouse-move");
			std::get<VariantMap>(object).insert({ "type", value });

			value.emplace<3>(event.motion.x);
			std::get<VariantMap>(object).insert({ "x", value });

			value.emplace<3>(event.motion.y);
			std::get<VariantMap>(object).insert({ "y", value });

			break;
		}

		case SDL_MOUSEBUTTONDOWN:
		case SDL_MOUSEBUTTONUP: {
			value.emplace<4>(event.button.type == SDL_MOUSEBUTTONDOWN ? "mouse-button-down" : "mouse-button-up");
			std::get<VariantMap>(object).insert({ "type", value });

			value.emplace<3>(event.button.button);
			std::get<VariantMap>(object).insert({ "button", value });

			break;
		}

		case SDL_MOUSEWHEEL: {
			value.emplace<4>("mouse-wheel");
			std::get<VariantMap>(object).insert({ "type", value });

			value.emplace<3>(event.wheel.x);
			std::get<VariantMap>(object).insert({ "x", value });

			value.emplace<3>(event.wheel.y);
			std::get<VariantMap>(object).insert({ "y", value });

			value.emplace<3>(event.wheel.direction);
			std::get<VariantMap>(object).insert({ "direction", value });

			break;
		}

	}
}

ErrorMessage *
pollEvent (Logger, Variant & object)
{
	SDL_Event event;
	bool got_event = SDL_PollEvent(&event);

	if (!got_event) { return nullptr; }

	packageEvent(event, object);

	return nullptr;
}

ErrorMessage *
waitEvent (Logger, Variant & object, int timeout)
{
	SDL_Event event;

	bool got_event = SDL_WaitEventTimeout(&event, timeout);
	SDL_ClearError();

	if (!got_event) { return nullptr; }

	packageEvent(event, object);

	return nullptr;
}


ErrorMessage *
startAudio (Logger logger)
{
	ErrorMessage * error = initAudio(logger);
	if (error) { return error; }

	return nullptr;
}

ErrorMessage *
stopAudio (Logger logger)
{
	// // Close Audio Device
	// {
	// 	SDL_PauseAudioDevice(audio_device, 1);
	// 	SDL_CloseAudioDevice(audio_device);
	// }

	if (false) { quitAudio(); }

	return nullptr;
}


ErrorMessage *
cleanup (Logger)
{
	quitVideo();
	quitAudio();
	return nullptr;
}


} // namespace
