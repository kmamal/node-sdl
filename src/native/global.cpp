#include "global.h"
#include "events.h"
#include "keyboard.h"
#include "video.h"
#include "joystick.h"
#include "controller.h"
#include "sensor.h"
#include "audio.h"
#include "power.h"
#include <SDL.h>
#include <string>
#include <sstream>
#include <vector>

#if defined(__MACOSX__)
	#include "cocoa-global.h"
#endif


static SDL_threadID mainThreadId;

int filterEvents(void*, SDL_Event *event) {
	if (true
		&& SDL_ThreadID() == mainThreadId
		&& event->type == SDL_WINDOWEVENT
		&& (false
			|| event->window.event == SDL_WINDOWEVENT_MOVED
			|| event->window.event == SDL_WINDOWEVENT_SIZE_CHANGED
		)
	) { events::dispatchEvent(*event); }

	return 1;
}


const char *global::no_error = nullptr;


Napi::Value
global::initialize(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	events::families::APP = "app";
	events::families::DISPLAY = "display";
	events::families::WINDOW = "window";
	events::families::DROP = "drop";
	events::families::KEYBOARD = "keyboard";
	events::families::TEXT = "text";
	events::families::MOUSE = "mouse";
	events::families::JOYSTICK_DEVICE = "joystickDevice";
	events::families::JOYSTICK = "joystick";
	events::families::CONTROLLER = "controller";
	events::families::SENSOR = "sensor";
	events::families::AUDIO_DEVICE = "audioDevice";
	events::families::CLIPBOARD = "clipboard";

	events::types::QUIT = "quit";
	events::types::DISPLAY_ADD = "displayAdd";
	events::types::DISPLAY_REMOVE = "displayRemove";
	events::types::DISPLAY_ORIENT = "displayOrient";
	events::types::DISPLAY_MOVE = "displayMove";
	events::types::DISPLAY_CHANGE = "displayChange";
	events::types::SHOW = "show";
	events::types::HIDE = "hide";
	events::types::EXPOSE = "expose";
	events::types::MOVE = "move";
	events::types::RESIZE = "resize";
	events::types::MINIMIZE = "minimize";
	events::types::MAXIMIZE = "maximize";
	events::types::RESTORE = "restore";
	events::types::FOCUS = "focus";
	events::types::BLUR = "blur";
	events::types::HOVER = "hover";
	events::types::LEAVE = "leave";
	events::types::KEY_DOWN = "keyDown";
	events::types::KEY_UP = "keyUp";
	events::types::TEXT_INPUT = "textInput";
	events::types::MOUSE_MOVE = "mouseMove";
	events::types::MOUSE_BUTTON_DOWN = "mouseButtonDown";
	events::types::MOUSE_BUTTON_UP = "mouseButtonUp";
	events::types::MOUSE_WHEEL = "mouseWheel";
	events::types::DROP_BEGIN = "dropBegin";
	events::types::DROP_COMPLETE = "dropComplete";
	events::types::DROP_FILE = "dropFile";
	events::types::DROP_TEXT = "dropText";
	events::types::CLOSE = "close";
	events::types::DEVICE_ADD = "deviceAdd";
	events::types::DEVICE_REMOVE = "deviceRemove";
	events::types::AXIS_MOTION = "axisMotion";
	events::types::BUTTON_DOWN = "buttonDown";
	events::types::BUTTON_UP = "buttonUp";
	events::types::BALL_MOTION = "ballMotion";
	events::types::HAT_MOTION = "hatMotion";
	events::types::POWER_UPDATE = "powerUpdate";
	events::types::STEAM_HANDLE_UPDATE = "steamHandleUpdate";
	events::types::REMAP = "remap";
	events::types::UPDATE = "update";

	// video::orientations[SDL_ORIENTATION_UNKNOWN] = nullptr;
	video::orientations[SDL_ORIENTATION_LANDSCAPE] = "landscape";
	video::orientations[SDL_ORIENTATION_LANDSCAPE_FLIPPED] = "landscapeFlipped";
	video::orientations[SDL_ORIENTATION_PORTRAIT] = "portrait";
	video::orientations[SDL_ORIENTATION_PORTRAIT_FLIPPED] = "portraitFlipped";

	video::formats[SDL_PIXELFORMAT_RGB332] = "rgb332";
	video::formats[SDL_PIXELFORMAT_RGB444] = "rgb444";
	video::formats[SDL_PIXELFORMAT_RGB555] = "rgb555";
	video::formats[SDL_PIXELFORMAT_BGR555] = "bgr555";
	video::formats[SDL_PIXELFORMAT_ARGB4444] = "argb4444";
	video::formats[SDL_PIXELFORMAT_RGBA4444] = "rgba4444";
	video::formats[SDL_PIXELFORMAT_ABGR4444] = "abgr4444";
	video::formats[SDL_PIXELFORMAT_BGRA4444] = "bgra4444";
	video::formats[SDL_PIXELFORMAT_ARGB1555] = "argb1555";
	video::formats[SDL_PIXELFORMAT_RGBA5551] = "rgba5551";
	video::formats[SDL_PIXELFORMAT_ABGR1555] = "abgr1555";
	video::formats[SDL_PIXELFORMAT_BGRA5551] = "bgra5551";
	video::formats[SDL_PIXELFORMAT_RGB565] = "rgb565";
	video::formats[SDL_PIXELFORMAT_BGR565] = "bgr565";
	video::formats[SDL_PIXELFORMAT_RGB24] = "rgb24";
	video::formats[SDL_PIXELFORMAT_BGR24] = "bgr24";
	video::formats[SDL_PIXELFORMAT_RGB888] = "rgb888";
	video::formats[SDL_PIXELFORMAT_RGBX8888] = "rgbx8888";
	video::formats[SDL_PIXELFORMAT_BGR888] = "bgr888";
	video::formats[SDL_PIXELFORMAT_BGRX8888] = "bgrx8888";
	video::formats[SDL_PIXELFORMAT_ARGB8888] = "argb8888";
	video::formats[SDL_PIXELFORMAT_RGBA8888] = "rgba8888";
	video::formats[SDL_PIXELFORMAT_ABGR8888] = "abgr8888";
	video::formats[SDL_PIXELFORMAT_BGRA8888] = "bgra8888";
	video::formats[SDL_PIXELFORMAT_ARGB2101010] = "argb2101010";
	video::formats[SDL_PIXELFORMAT_RGBA32] = "rgba32";
	video::formats[SDL_PIXELFORMAT_ARGB32] = "argb32";
	video::formats[SDL_PIXELFORMAT_BGRA32] = "bgra32";
	video::formats[SDL_PIXELFORMAT_ABGR32] = "abgr32";
	video::formats[SDL_PIXELFORMAT_YV12] = "yv12";
	video::formats[SDL_PIXELFORMAT_IYUV] = "iyuv";
	video::formats[SDL_PIXELFORMAT_YUY2] = "yuy2";
	video::formats[SDL_PIXELFORMAT_UYVY] = "uyvy";
	video::formats[SDL_PIXELFORMAT_YVYU] = "yvyu";
	video::formats[SDL_PIXELFORMAT_NV12] = "nv12";
	video::formats[SDL_PIXELFORMAT_NV21] = "nv21";

	// joystick::types[SDL_JOYSTICK_TYPE_UNKNOWN] = nullptr;
	joystick::types[SDL_JOYSTICK_TYPE_GAMECONTROLLER] = "gamecontroller";
	joystick::types[SDL_JOYSTICK_TYPE_WHEEL] = "wheel";
	joystick::types[SDL_JOYSTICK_TYPE_ARCADE_STICK] = "arcadestick";
	joystick::types[SDL_JOYSTICK_TYPE_FLIGHT_STICK] = "flightstick";
	joystick::types[SDL_JOYSTICK_TYPE_DANCE_PAD] = "dancepad";
	joystick::types[SDL_JOYSTICK_TYPE_GUITAR] = "guitar";
	joystick::types[SDL_JOYSTICK_TYPE_DRUM_KIT] = "drumkit";
	joystick::types[SDL_JOYSTICK_TYPE_ARCADE_PAD] = "arcadepad";
	joystick::types[SDL_JOYSTICK_TYPE_THROTTLE] = "throttle";

	// joystick::power_levels[SDL_JOYSTICK_POWER_UNKNOWN] = nullptr;
	joystick::power_levels[SDL_JOYSTICK_POWER_EMPTY] = "empty";
	joystick::power_levels[SDL_JOYSTICK_POWER_LOW] = "low";
	joystick::power_levels[SDL_JOYSTICK_POWER_MEDIUM] = "medium";
	joystick::power_levels[SDL_JOYSTICK_POWER_FULL] = "full";
	joystick::power_levels[SDL_JOYSTICK_POWER_WIRED] = "wired";
	joystick::power_levels[SDL_JOYSTICK_POWER_MAX] = "max";

	joystick::hat_positions[SDL_HAT_CENTERED] = "centered";
	joystick::hat_positions[SDL_HAT_UP] = "up";
	joystick::hat_positions[SDL_HAT_RIGHT] = "right";
	joystick::hat_positions[SDL_HAT_DOWN] = "down";
	joystick::hat_positions[SDL_HAT_LEFT] = "left";
	joystick::hat_positions[SDL_HAT_RIGHTUP] = "rightup";
	joystick::hat_positions[SDL_HAT_RIGHTDOWN] = "rightdown";
	joystick::hat_positions[SDL_HAT_LEFTUP] = "leftup";
	joystick::hat_positions[SDL_HAT_LEFTDOWN] = "leftdown";

	// controller::types[SDL_CONTROLLER_TYPE_UNKNOWN] = nullptr;
	controller::types[SDL_CONTROLLER_TYPE_XBOX360] = "xbox360";
	controller::types[SDL_CONTROLLER_TYPE_XBOXONE] = "xboxOne";
	controller::types[SDL_CONTROLLER_TYPE_PS3] = "ps3";
	controller::types[SDL_CONTROLLER_TYPE_PS4] = "ps4";
	controller::types[SDL_CONTROLLER_TYPE_NINTENDO_SWITCH_PRO] = "nintendoSwitchPro";
	controller::types[SDL_CONTROLLER_TYPE_VIRTUAL] = "virtual";
	controller::types[SDL_CONTROLLER_TYPE_PS5] = "ps5";
	controller::types[SDL_CONTROLLER_TYPE_AMAZON_LUNA] = "amazonLuna";
	controller::types[SDL_CONTROLLER_TYPE_GOOGLE_STADIA] = "googleStadia";
	controller::types[SDL_CONTROLLER_TYPE_NVIDIA_SHIELD] = "nvidiaShield";
	controller::types[SDL_CONTROLLER_TYPE_NINTENDO_SWITCH_JOYCON_LEFT] = "nintendoSwitchJoyconLeft";
	controller::types[SDL_CONTROLLER_TYPE_NINTENDO_SWITCH_JOYCON_RIGHT] = "nintendoSwitchJoyconRight";
	controller::types[SDL_CONTROLLER_TYPE_NINTENDO_SWITCH_JOYCON_PAIR] = "nintendoSwitchJoyconPair";

	controller::axes[SDL_CONTROLLER_AXIS_LEFTX] = "leftStickX";
	controller::axes[SDL_CONTROLLER_AXIS_LEFTY] = "leftStickY";
	controller::axes[SDL_CONTROLLER_AXIS_RIGHTX] = "rightStickX";
	controller::axes[SDL_CONTROLLER_AXIS_RIGHTY] = "rightStickY";
	controller::axes[SDL_CONTROLLER_AXIS_TRIGGERLEFT] = "leftTrigger";
	controller::axes[SDL_CONTROLLER_AXIS_TRIGGERRIGHT] = "rightTrigger";

	controller::buttons[SDL_CONTROLLER_BUTTON_DPAD_LEFT] = "dpadLeft";
	controller::buttons[SDL_CONTROLLER_BUTTON_DPAD_RIGHT] = "dpadRight";
	controller::buttons[SDL_CONTROLLER_BUTTON_DPAD_UP] = "dpadUp";
	controller::buttons[SDL_CONTROLLER_BUTTON_DPAD_DOWN] = "dpadDown";
	controller::buttons[SDL_CONTROLLER_BUTTON_A] = "a";
	controller::buttons[SDL_CONTROLLER_BUTTON_B] = "b";
	controller::buttons[SDL_CONTROLLER_BUTTON_X] = "x";
	controller::buttons[SDL_CONTROLLER_BUTTON_Y] = "y";
	controller::buttons[SDL_CONTROLLER_BUTTON_GUIDE] = "guide";
	controller::buttons[SDL_CONTROLLER_BUTTON_BACK] = "back";
	controller::buttons[SDL_CONTROLLER_BUTTON_START] = "start";
	controller::buttons[SDL_CONTROLLER_BUTTON_LEFTSTICK] = "leftStick";
	controller::buttons[SDL_CONTROLLER_BUTTON_RIGHTSTICK] = "rightStick";
	controller::buttons[SDL_CONTROLLER_BUTTON_LEFTSHOULDER] = "leftShoulder";
	controller::buttons[SDL_CONTROLLER_BUTTON_RIGHTSHOULDER] = "rightShoulder";
	controller::buttons[SDL_CONTROLLER_BUTTON_PADDLE1] = "paddle1";
	controller::buttons[SDL_CONTROLLER_BUTTON_PADDLE2] = "paddle2";
	controller::buttons[SDL_CONTROLLER_BUTTON_PADDLE3] = "paddle3";
	controller::buttons[SDL_CONTROLLER_BUTTON_PADDLE4] = "paddle4";

	// sensor::types[SDL_SENSOR_UNKNOWN] = nullptr;
	sensor::types[SDL_SENSOR_ACCEL] = "accelerometer";
	sensor::types[SDL_SENSOR_GYRO] = "gyroscope";
	sensor::types[SDL_SENSOR_ACCEL_L] = "accelerometer";
	sensor::types[SDL_SENSOR_GYRO_L] = "gyroscope";
	sensor::types[SDL_SENSOR_ACCEL_R] = "accelerometer";
	sensor::types[SDL_SENSOR_GYRO_R] = "gyroscope";

	// sensor::sides[SDL_SENSOR_UNKNOWN] = nullptr;
	// sensor::sides[SDL_SENSOR_ACCEL] = nullptr;
	// sensor::sides[SDL_SENSOR_GYRO] = nullptr;
	sensor::sides[SDL_SENSOR_ACCEL_L] = "left";
	sensor::sides[SDL_SENSOR_GYRO_L] = "left";
	sensor::sides[SDL_SENSOR_ACCEL_R] = "right";
	sensor::sides[SDL_SENSOR_GYRO_R] = "right";

	audio::device_types[true] = "recording";
	audio::device_types[false] = "playback";

	// power::states[SDL_POWERSTATE_UNKNOWN] = nullptr;
	power::states[SDL_POWERSTATE_NO_BATTERY] = "noBattery";
	power::states[SDL_POWERSTATE_ON_BATTERY] = "battery";
	power::states[SDL_POWERSTATE_CHARGING] = "charging";
	power::states[SDL_POWERSTATE_CHARGED] = "charged";


	Napi::Object initialized = Napi::Object::New(env);

	SDL_SetHint(SDL_HINT_FRAMEBUFFER_ACCELERATION, "0");

	if (SDL_InitSubSystem(SDL_INIT_EVENTS) < 0) {
		std::ostringstream message;
		message << "SDL_Init() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_version sdl_compile_version;
	SDL_VERSION(&sdl_compile_version);

	Napi::Object compile_version = Napi::Object::New(env);
	compile_version.Set("major", sdl_compile_version.major);
	compile_version.Set("minor", sdl_compile_version.minor);
	compile_version.Set("patch", sdl_compile_version.patch);

	SDL_version sdl_runtime_version;
	SDL_GetVersion(&sdl_runtime_version);

	Napi::Object runtime_version = Napi::Object::New(env);
	runtime_version.Set("major", sdl_runtime_version.major);
	runtime_version.Set("minor", sdl_runtime_version.minor);
	runtime_version.Set("patch", sdl_runtime_version.patch);

	Napi::Object versions = Napi::Object::New(env);
	versions.Set("compile", compile_version);
	versions.Set("runtime", runtime_version);

	const char *platform = SDL_GetPlatform();

	Napi::Array all_video_drivers = Napi::Array::New(env);

	int num_video_drivers = SDL_GetNumVideoDrivers();
	if (num_video_drivers < 0) {
		std::ostringstream message;
		message << "SDL_GetNumVideoDrivers() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}
	for (int i = 0; i < num_video_drivers; i ++) {
		const char *name = SDL_GetVideoDriver(i);
		if(name == nullptr) {
			std::ostringstream message;
			message << "SDL_GetVideoDriver(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}
		all_video_drivers.Set(all_video_drivers.Length(), name);
	}

	Napi::Value current_video_driver;
	if (SDL_InitSubSystem(SDL_INIT_VIDEO) == 0) {
		const char *name = SDL_GetCurrentVideoDriver();
		if(name == nullptr) {
			std::ostringstream message;
			message << "SDL_GetCurrentVideoDriver() error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}
		current_video_driver = Napi::String::New(env, name);
		initialized.Set("video", true);
	}
	else {
		current_video_driver = env.Null();
		initialized.Set("video", false);
	}

	Napi::Object video_drivers = Napi::Object::New(env);
	video_drivers.Set("all", all_video_drivers);
	video_drivers.Set("current", current_video_driver);

	Napi::Array all_audio_drivers = Napi::Array::New(env);

	int num_audio_drivers = SDL_GetNumAudioDrivers();
	if (num_audio_drivers < 0) {
		std::ostringstream message;
		message << "SDL_GetNumAudioDrivers() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	for (int i = 0; i < num_audio_drivers; i ++) {
		const char *name = SDL_GetAudioDriver(i);
		if(name == nullptr) {
			std::ostringstream message;
			message << "SDL_GetAudioDriver(" << i << ") error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}
		all_audio_drivers.Set(all_audio_drivers.Length(), name);
	}

	Napi::Value current_audio_driver;
	if (SDL_InitSubSystem(SDL_INIT_AUDIO) == 0) {
		const char *name = SDL_GetCurrentAudioDriver();
		if(name == nullptr) {
			std::ostringstream message;
			message << "SDL_GetCurrentAudioDriver() error: " << SDL_GetError();
			SDL_ClearError();
			throw Napi::Error::New(env, message.str());
		}
		current_audio_driver = Napi::String::New(env, name);
		initialized.Set("audio", true);
	}
	else {
		current_audio_driver = env.Null();
		initialized.Set("audio", false);
	}

	Napi::Object audio_drivers = Napi::Object::New(env);
	audio_drivers.Set("all", all_audio_drivers);
	audio_drivers.Set("current", current_audio_driver);

	Napi::Object drivers = Napi::Object::New(env);
	drivers.Set("video", video_drivers);
	drivers.Set("audio", audio_drivers);

	initialized.Set("joystick", SDL_InitSubSystem(SDL_INIT_JOYSTICK) == 0);
	initialized.Set("controller", SDL_InitSubSystem(SDL_INIT_GAMECONTROLLER) == 0);
	initialized.Set("haptic", SDL_InitSubSystem(SDL_INIT_HAPTIC) == 0);
	initialized.Set("sensor", SDL_InitSubSystem(SDL_INIT_SENSOR) == 0);

	SDL_ClearError();
	global::no_error = SDL_GetError();

	mainThreadId = SDL_ThreadID();
	SDL_SetEventFilter(filterEvents, nullptr);

	keyboard::keys = SDL_GetKeyboardState(&keyboard::num_keys);
	SDL_StartTextInput(); // TODO

#if defined(__MACOSX__)
	reenableInertialScrolling();
#endif

	SDL_memset(&joystick::zero_guid, 0, sizeof(joystick::zero_guid));

	Napi::Object result = Napi::Object::New(env);
	result.Set("version", versions);
	result.Set("platform", platform);
	result.Set("drivers", drivers);
	result.Set("initialized", initialized);

	return result;
}


Napi::Value
global::cleanup(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	SDL_Quit();

	return env.Undefined();
}
