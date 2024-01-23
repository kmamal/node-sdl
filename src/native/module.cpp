#include <napi.h>

#include "enums.h"
#include "global.h"
#include "events.h"
#include "video.h"
#include "window.h"
#include "keyboard.h"
#include "mouse.h"
#include "joystick.h"
#include "controller.h"
#include "sensor.h"
#include "audio.h"
#include "clipboard.h"
#include "power.h"


Napi::Object
init (Napi::Env env, Napi::Object exports)
{
	exports.Set("enums_get", Napi::Function::New<enums::get>(env));

	exports.Set("global_initialize", Napi::Function::New<global::initialize>(env));
	exports.Set("global_cleanup", Napi::Function::New<global::cleanup>(env));

	exports.Set("events_poll", Napi::Function::New<events::poll>(env));

	exports.Set("video_getDisplays", Napi::Function::New<video::getDisplays>(env));

	exports.Set("window_create", Napi::Function::New<window::create>(env));
	exports.Set("window_setTitle", Napi::Function::New<window::setTitle>(env));
	exports.Set("window_setPosition", Napi::Function::New<window::setPosition>(env));
	exports.Set("window_setSize", Napi::Function::New<window::setSize>(env));
	exports.Set("window_setFullscreen", Napi::Function::New<window::setFullscreen>(env));
	exports.Set("window_setResizable", Napi::Function::New<window::setResizable>(env));
	exports.Set("window_setBorderless", Napi::Function::New<window::setBorderless>(env));
	exports.Set("window_setAcceleratedAndVsync", Napi::Function::New<window::setAcceleratedAndVsync>(env));
	exports.Set("window_focus", Napi::Function::New<window::focus>(env));
	exports.Set("window_show", Napi::Function::New<window::show>(env));
	exports.Set("window_hide", Napi::Function::New<window::hide>(env));
	exports.Set("window_maximize", Napi::Function::New<window::maximize>(env));
	exports.Set("window_minimize", Napi::Function::New<window::minimize>(env));
	exports.Set("window_restore", Napi::Function::New<window::restore>(env));
	exports.Set("window_render", Napi::Function::New<window::render>(env));
	exports.Set("window_setIcon", Napi::Function::New<window::setIcon>(env));
	exports.Set("window_flash", Napi::Function::New<window::flash>(env));
	exports.Set("window_destroy", Napi::Function::New<window::destroy>(env));

	exports.Set("keyboard_getKey", Napi::Function::New<keyboard::getKey>(env));
	exports.Set("keyboard_getScancode", Napi::Function::New<keyboard::getScancode>(env));
	exports.Set("keyboard_getState", Napi::Function::New<keyboard::getState>(env));

	exports.Set("mouse_getButton", Napi::Function::New<mouse::getButton>(env));
	exports.Set("mouse_getPosition", Napi::Function::New<mouse::getPosition>(env));
	exports.Set("mouse_setPosition", Napi::Function::New<mouse::setPosition>(env));
	exports.Set("mouse_capture", Napi::Function::New<mouse::capture>(env));
	exports.Set("mouse_setCursor", Napi::Function::New<mouse::setCursor>(env));
	exports.Set("mouse_resetCursor", Napi::Function::New<mouse::resetCursor>(env));
	exports.Set("mouse_setCursorImage", Napi::Function::New<mouse::setCursorImage>(env));
	exports.Set("mouse_showCursor", Napi::Function::New<mouse::showCursor>(env));
	exports.Set("mouse_redrawCursor", Napi::Function::New<mouse::redrawCursor>(env));

	exports.Set("joystick_getDevices", Napi::Function::New<joystick::getDevices>(env));
	exports.Set("joystick_open", Napi::Function::New<joystick::open>(env));
	exports.Set("joystick_getPower", Napi::Function::New<joystick::getPower>(env));
	exports.Set("joystick_setLed", Napi::Function::New<joystick::setLed>(env));
	exports.Set("joystick_setPlayer", Napi::Function::New<joystick::setPlayer>(env));
	exports.Set("joystick_rumble", Napi::Function::New<joystick::rumble>(env));
	exports.Set("joystick_rumbleTriggers", Napi::Function::New<joystick::rumbleTriggers>(env));
	exports.Set("joystick_close", Napi::Function::New<joystick::close>(env));

	exports.Set("controller_addMappings", Napi::Function::New<controller::addMappings>(env));
	exports.Set("controller_open", Napi::Function::New<controller::open>(env));
	exports.Set("controller_close", Napi::Function::New<controller::close>(env));

	exports.Set("sensor_getDevices", Napi::Function::New<sensor::getDevices>(env));
	exports.Set("sensor_open", Napi::Function::New<sensor::open>(env));
	exports.Set("sensor_getData", Napi::Function::New<sensor::getData>(env));
	exports.Set("sensor_close", Napi::Function::New<sensor::close>(env));

	exports.Set("audio_getDevices", Napi::Function::New<audio::getDevices>(env));
	exports.Set("audio_open", Napi::Function::New<audio::open>(env));
	exports.Set("audio_play", Napi::Function::New<audio::play>(env));
	exports.Set("audio_getQueueSize", Napi::Function::New<audio::getQueueSize>(env));
	exports.Set("audio_enqueue", Napi::Function::New<audio::enqueue>(env));
	exports.Set("audio_dequeue", Napi::Function::New<audio::dequeue>(env));
	exports.Set("audio_clearQueue", Napi::Function::New<audio::clearQueue>(env));
	exports.Set("audio_close", Napi::Function::New<audio::close>(env));

	exports.Set("clipboard_getText", Napi::Function::New<clipboard::getText>(env));
	exports.Set("clipboard_setText", Napi::Function::New<clipboard::setText>(env));

	exports.Set("power_getInfo", Napi::Function::New<power::getInfo>(env));

	return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, init)
