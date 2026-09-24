#include "global.h"
#include "events.h"
#include "keyboard.h"
#include "video.h"
#include "touch.h"
#include "joystick.h"
#include "gamepad.h"
#include "sensor.h"
#include "audio.h"
#include "power.h"
#include <SDL3/SDL.h>
#include <string>
#include <sstream>
#include <vector>

#if defined(SDL_PLATFORM_MACOS)
	#include "cocoa-global.h"
#endif


static SDL_ThreadID mainThreadId;

bool watchEvents(void*, SDL_Event *event) {
	if (true
		&& SDL_GetCurrentThreadID() == mainThreadId
		&& (false
			|| event->type == SDL_EVENT_WINDOW_MOVED
			|| event->type == SDL_EVENT_WINDOW_RESIZED
		)
	) {
		events::dispatchEventFromWatch(*event);
	}
	return true;
}


Napi::Value
global::initialize(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	events::targets::APP = "app";
	events::targets::VIDEO = "video";
	events::targets::WINDOW = "window";
	events::targets::KEYBOARD = "keyboard";
	events::targets::JOYSTICK = "joystick";
	events::targets::GAMEPAD = "gamepad";
	events::targets::SENSOR = "sensor";
	events::targets::CLIPBOARD = "clipboard";
	events::targets::JOYSTICK_DEVICE = "joystickDevice";
	events::targets::GAMEPAD_DEVICE = "gamepadDevice";
	events::targets::AUDIO_DEVICE = "audioDevice";

	events::types::QUIT = "quit";
	events::types::DISPLAY_ADD = "displayAdd";
	events::types::DISPLAY_REMOVE = "displayRemove";
	events::types::DISPLAY_ORIENT = "displayOrient";
	events::types::DISPLAY_MOVE = "displayMove";
	events::types::DISPLAY_SCALE = "displayScaleChange";
	events::types::DISPLAY_MODE = "displayModeChange";
	events::types::DISPLAY_USABLE = "displayUsableChange";
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
	events::types::KEYMAP_CHANGE = "keymapChange";
	events::types::FINGER_DOWN = "fingerDown";
	events::types::FINGER_UP = "fingerUp";
	events::types::FINGER_MOVE = "fingerMove";
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
	video::formats[SDL_PIXELFORMAT_XRGB4444] = "xrgb4444";
	video::formats[SDL_PIXELFORMAT_XBGR4444] = "xbgr4444";
	video::formats[SDL_PIXELFORMAT_XRGB1555] = "xrgb1555";
	video::formats[SDL_PIXELFORMAT_XBGR1555] = "xbgr1555";
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
	video::formats[SDL_PIXELFORMAT_XRGB8888] = "xrgb8888";
	video::formats[SDL_PIXELFORMAT_RGBX8888] = "rgbx8888";
	video::formats[SDL_PIXELFORMAT_XBGR8888] = "xbgr8888";
	video::formats[SDL_PIXELFORMAT_BGRX8888] = "bgrx8888";
	video::formats[SDL_PIXELFORMAT_ARGB8888] = "argb8888";
	video::formats[SDL_PIXELFORMAT_RGBA8888] = "rgba8888";
	video::formats[SDL_PIXELFORMAT_ABGR8888] = "abgr8888";
	video::formats[SDL_PIXELFORMAT_BGRA8888] = "bgra8888";
	video::formats[SDL_PIXELFORMAT_ARGB2101010] = "argb2101010";
	video::formats[SDL_PIXELFORMAT_XRGB2101010] = "xrgb2101010";
	video::formats[SDL_PIXELFORMAT_XBGR2101010] = "xbgr2101010";
	video::formats[SDL_PIXELFORMAT_ABGR2101010] = "abgr2101010";
	video::formats[SDL_PIXELFORMAT_RGB48] = "rgb48";
	video::formats[SDL_PIXELFORMAT_BGR48] = "bgr48";
	video::formats[SDL_PIXELFORMAT_RGBA64] = "rgba64";
	video::formats[SDL_PIXELFORMAT_ARGB64] = "argb64";
	video::formats[SDL_PIXELFORMAT_BGRA64] = "bgra64";
	video::formats[SDL_PIXELFORMAT_ABGR64] = "abgr64";
	video::formats[SDL_PIXELFORMAT_RGB48_FLOAT] = "rgb48f";
	video::formats[SDL_PIXELFORMAT_BGR48_FLOAT] = "bgr48f";
	video::formats[SDL_PIXELFORMAT_RGBA64_FLOAT] = "rgba64f";
	video::formats[SDL_PIXELFORMAT_ARGB64_FLOAT] = "argb64f";
	video::formats[SDL_PIXELFORMAT_BGRA64_FLOAT] = "bgra64f";
	video::formats[SDL_PIXELFORMAT_ABGR64_FLOAT] = "abgr64f";
	video::formats[SDL_PIXELFORMAT_RGB96_FLOAT] = "rgb96f";
	video::formats[SDL_PIXELFORMAT_BGR96_FLOAT] = "bgr96f";
	video::formats[SDL_PIXELFORMAT_RGBA128_FLOAT] = "rgba128f";
	video::formats[SDL_PIXELFORMAT_ARGB128_FLOAT] = "argb128f";
	video::formats[SDL_PIXELFORMAT_BGRA128_FLOAT] = "bgra128f";
	video::formats[SDL_PIXELFORMAT_ABGR128_FLOAT] = "abgr128f";
	video::formats[SDL_PIXELFORMAT_YV12] = "yv12";
	video::formats[SDL_PIXELFORMAT_IYUV] = "iyuv";
	video::formats[SDL_PIXELFORMAT_YUY2] = "yuy2";
	video::formats[SDL_PIXELFORMAT_UYVY] = "uyvy";
	video::formats[SDL_PIXELFORMAT_YVYU] = "yvyu";
	video::formats[SDL_PIXELFORMAT_NV12] = "nv12";
	video::formats[SDL_PIXELFORMAT_NV21] = "nv21";
	video::formats[SDL_PIXELFORMAT_P010] = "p010";

	// touch::device_types[SDL_TOUCH_DEVICE_INVALID] = nullptr;
	touch::device_types[SDL_TOUCH_DEVICE_DIRECT] = "direct";
	touch::device_types[SDL_TOUCH_DEVICE_INDIRECT_ABSOLUTE] = "indirectAbsolute";
	touch::device_types[SDL_TOUCH_DEVICE_INDIRECT_RELATIVE] = "indirectRelative";

	// joystick::types[SDL_JOYSTICK_TYPE_UNKNOWN] = nullptr;
	joystick::types[SDL_JOYSTICK_TYPE_GAMEPAD] = "gamepad";
	joystick::types[SDL_JOYSTICK_TYPE_WHEEL] = "wheel";
	joystick::types[SDL_JOYSTICK_TYPE_ARCADE_STICK] = "arcadeStick";
	joystick::types[SDL_JOYSTICK_TYPE_FLIGHT_STICK] = "flightStick";
	joystick::types[SDL_JOYSTICK_TYPE_DANCE_PAD] = "dancePad";
	joystick::types[SDL_JOYSTICK_TYPE_GUITAR] = "guitar";
	joystick::types[SDL_JOYSTICK_TYPE_DRUM_KIT] = "drumKit";
	joystick::types[SDL_JOYSTICK_TYPE_ARCADE_PAD] = "arcadePad";
	joystick::types[SDL_JOYSTICK_TYPE_THROTTLE] = "throttle";

	joystick::hat_positions[SDL_HAT_CENTERED] = "centered";
	joystick::hat_positions[SDL_HAT_UP] = "up";
	joystick::hat_positions[SDL_HAT_RIGHT] = "right";
	joystick::hat_positions[SDL_HAT_DOWN] = "down";
	joystick::hat_positions[SDL_HAT_LEFT] = "left";
	joystick::hat_positions[SDL_HAT_RIGHTUP] = "rightUp";
	joystick::hat_positions[SDL_HAT_RIGHTDOWN] = "rightDown";
	joystick::hat_positions[SDL_HAT_LEFTUP] = "leftUp";
	joystick::hat_positions[SDL_HAT_LEFTDOWN] = "leftDown";

	// gamepad::types[SDL_GAMEPAD_TYPE_UNKNOWN] = nullptr;
	gamepad::types[SDL_GAMEPAD_TYPE_STANDARD] = "standard";
	gamepad::types[SDL_GAMEPAD_TYPE_XBOX360] = "xbox360";
	gamepad::types[SDL_GAMEPAD_TYPE_XBOXONE] = "xboxOne";
	gamepad::types[SDL_GAMEPAD_TYPE_PS3] = "ps3";
	gamepad::types[SDL_GAMEPAD_TYPE_PS4] = "ps4";
	gamepad::types[SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_PRO] = "nintendoSwitchPro";
	gamepad::types[SDL_GAMEPAD_TYPE_PS5] = "ps5";
	gamepad::types[SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_JOYCON_LEFT] = "nintendoSwitchJoyconLeft";
	gamepad::types[SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_JOYCON_RIGHT] = "nintendoSwitchJoyconRight";
	gamepad::types[SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_JOYCON_PAIR] = "nintendoSwitchJoyconPair";
	gamepad::types[SDL_GAMEPAD_TYPE_GAMECUBE] = "gamecube";

	gamepad::axes[SDL_GAMEPAD_AXIS_LEFTX] = "leftStickX";
	gamepad::axes[SDL_GAMEPAD_AXIS_LEFTY] = "leftStickY";
	gamepad::axes[SDL_GAMEPAD_AXIS_RIGHTX] = "rightStickX";
	gamepad::axes[SDL_GAMEPAD_AXIS_RIGHTY] = "rightStickY";
	gamepad::axes[SDL_GAMEPAD_AXIS_LEFT_TRIGGER] = "leftTrigger";
	gamepad::axes[SDL_GAMEPAD_AXIS_RIGHT_TRIGGER] = "rightTrigger";

	gamepad::buttons[SDL_GAMEPAD_BUTTON_DPAD_LEFT] = "dpadLeft";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_DPAD_RIGHT] = "dpadRight";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_DPAD_UP] = "dpadUp";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_DPAD_DOWN] = "dpadDown";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_SOUTH] = "south";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_EAST] = "east";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_WEST] = "west";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_NORTH] = "north";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_GUIDE] = "guide";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_BACK] = "back";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_START] = "start";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_LEFT_STICK] = "leftStick";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_RIGHT_STICK] = "rightStick";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_LEFT_SHOULDER] = "leftShoulder";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_RIGHT_SHOULDER] = "rightShoulder";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_RIGHT_PADDLE1] = "rightPaddle1";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_LEFT_PADDLE1] = "leftPaddle1";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_RIGHT_PADDLE2] = "rightPaddle2";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_LEFT_PADDLE2] = "leftPaddle2";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_MISC1] = "misc1";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_MISC2] = "misc2";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_MISC3] = "misc3";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_MISC4] = "misc4";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_MISC5] = "misc5";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_MISC6] = "misc6";
	gamepad::buttons[SDL_GAMEPAD_BUTTON_TOUCHPAD] = "touchpad";

	// gamepad::button_labels[SDL_GAMEPAD_BUTTON_LABEL_UNKNOWN] = nullptr;
	gamepad::button_labels[SDL_GAMEPAD_BUTTON_LABEL_A] = "a";
	gamepad::button_labels[SDL_GAMEPAD_BUTTON_LABEL_B] = "b";
	gamepad::button_labels[SDL_GAMEPAD_BUTTON_LABEL_X] = "x";
	gamepad::button_labels[SDL_GAMEPAD_BUTTON_LABEL_Y] = "y";
	gamepad::button_labels[SDL_GAMEPAD_BUTTON_LABEL_CROSS] = "cross";
	gamepad::button_labels[SDL_GAMEPAD_BUTTON_LABEL_CIRCLE] = "circle";
	gamepad::button_labels[SDL_GAMEPAD_BUTTON_LABEL_SQUARE] = "square";
	gamepad::button_labels[SDL_GAMEPAD_BUTTON_LABEL_TRIANGLE] = "triangle";

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
	SDL_SetHint(SDL_HINT_QUIT_ON_LAST_WINDOW_CLOSE, "0");

	if (!SDL_InitSubSystem(SDL_INIT_EVENTS)) {
		std::ostringstream message;
		message << "SDL_Init() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	int sdl_compile_version = SDL_VERSION;

	Napi::Object compile_version = Napi::Object::New(env);
	compile_version.Set("major", SDL_VERSIONNUM_MAJOR(sdl_compile_version));
	compile_version.Set("minor", SDL_VERSIONNUM_MINOR(sdl_compile_version));
	compile_version.Set("patch", SDL_VERSIONNUM_MICRO(sdl_compile_version));

	int sdl_runtime_version = SDL_GetVersion();

	Napi::Object runtime_version = Napi::Object::New(env);
	runtime_version.Set("major", SDL_VERSIONNUM_MAJOR(sdl_runtime_version));
	runtime_version.Set("minor", SDL_VERSIONNUM_MINOR(sdl_runtime_version));
	runtime_version.Set("patch", SDL_VERSIONNUM_MICRO(sdl_runtime_version));

	Napi::Object versions = Napi::Object::New(env);
	versions.Set("compile", compile_version);
	versions.Set("runtime", runtime_version);

	const char *platform = SDL_GetPlatform();

	Napi::Array all_video_drivers = Napi::Array::New(env);

	int num_video_drivers = SDL_GetNumVideoDrivers();
	for (int i = 0; i < num_video_drivers; i ++) {
		all_video_drivers.Set(i, SDL_GetVideoDriver(i));
	}

	Napi::Value current_video_driver;
	if (SDL_InitSubSystem(SDL_INIT_VIDEO)) {
		current_video_driver = Napi::String::New(env, SDL_GetCurrentVideoDriver());
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
	for (int i = 0; i < num_audio_drivers; i ++) {
		all_audio_drivers.Set(i, SDL_GetAudioDriver(i));
	}

	Napi::Value current_audio_driver;
	if (SDL_InitSubSystem(SDL_INIT_AUDIO)) {
		current_audio_driver = Napi::String::New(env, SDL_GetCurrentAudioDriver());
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

	initialized.Set("joystick", SDL_InitSubSystem(SDL_INIT_JOYSTICK));
	initialized.Set("gamepad", SDL_InitSubSystem(SDL_INIT_GAMEPAD));
	initialized.Set("haptic", SDL_InitSubSystem(SDL_INIT_HAPTIC));
	initialized.Set("sensor", SDL_InitSubSystem(SDL_INIT_SENSOR));

	// Drop errors from optional subsystems that failed to initialize
	SDL_ClearError();

	mainThreadId = SDL_GetCurrentThreadID();
	if (!SDL_AddEventWatch(watchEvents, nullptr)) {
		std::ostringstream message;
		message << "SDL_AddEventWatch() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	keyboard::keys = SDL_GetKeyboardState(&keyboard::num_keys);

#if defined(SDL_PLATFORM_MACOS)
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
