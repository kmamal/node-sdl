#include "events.h"
#include "enums.h"
#include "global.h"
#include "joystick.h"
#include "controller.h"
#include "audio.h"
#include <SDL.h>
#include <string>
#include <sstream>


std::string events::families::APP;
std::string events::families::DISPLAY;
std::string events::families::WINDOW;
std::string events::families::DROP;
std::string events::families::KEYBOARD;
std::string events::families::TEXT;
std::string events::families::MOUSE;
std::string events::families::JOYSTICK_DEVICE;
std::string events::families::JOYSTICK;
std::string events::families::CONTROLLER;
std::string events::families::SENSOR;
std::string events::families::AUDIO_DEVICE;
std::string events::families::CLIPBOARD;

std::string events::types::QUIT;
std::string events::types::DISPLAY_ADD;
std::string events::types::DISPLAY_REMOVE;
std::string events::types::DISPLAY_ORIENT;
std::string events::types::SHOW;
std::string events::types::HIDE;
std::string events::types::EXPOSE;
std::string events::types::MOVE;
std::string events::types::RESIZE;
std::string events::types::MINIMIZE;
std::string events::types::MAXIMIZE;
std::string events::types::RESTORE;
std::string events::types::FOCUS;
std::string events::types::BLUR;
std::string events::types::HOVER;
std::string events::types::LEAVE;
std::string events::types::KEY_DOWN;
std::string events::types::KEY_UP;
std::string events::types::TEXT_INPUT;
std::string events::types::MOUSE_MOVE;
std::string events::types::MOUSE_BUTTON_DOWN;
std::string events::types::MOUSE_BUTTON_UP;
std::string events::types::MOUSE_WHEEL;
std::string events::types::DROP_BEGIN;
std::string events::types::DROP_COMPLETE;
std::string events::types::DROP_FILE;
std::string events::types::DROP_TEXT;
std::string events::types::CLOSE;
std::string events::types::DEVICE_ADD;
std::string events::types::DEVICE_REMOVE;
std::string events::types::AXIS_MOTION;
std::string events::types::BUTTON_DOWN;
std::string events::types::BUTTON_UP;
std::string events::types::BALL_MOTION;
std::string events::types::HAT_MOTION;
std::string events::types::REMAP;
std::string events::types::UPDATE;


static Napi::Env *poll_env = nullptr;
static Napi::Function *poll_callback = nullptr;

void
events::dispatchEvent(const SDL_Event &event)
{
	if (poll_env == nullptr) { return; }
	Napi::Env &env = *poll_env;

	Napi::Object packed = Napi::Object::New(env);

	switch (event.type) {
		case SDL_QUIT: {
			packed.Set("family", events::families::APP);
			packed.Set("type", events::types::QUIT);
			break;
		}

		case SDL_DISPLAYEVENT: {
			packed.Set("family", events::families::DISPLAY);
			packed.Set("displayIndex", Napi::Number::New(env, event.display.display));

			switch (event.display.event) {
				case SDL_DISPLAYEVENT_CONNECTED: { packed.Set("type", events::types::DISPLAY_ADD); break; }
				case SDL_DISPLAYEVENT_DISCONNECTED: { packed.Set("type", events::types::DISPLAY_REMOVE); break; }
				case SDL_DISPLAYEVENT_ORIENTATION: { packed.Set("type", events::types::DISPLAY_ORIENT); break; }
			}
			break;
		}

		case SDL_WINDOWEVENT: {
			packed.Set("family", events::families::WINDOW);
			packed.Set("windowId", Napi::Number::New(env, event.window.windowID));

			switch (event.window.event) {
				case SDL_WINDOWEVENT_SHOWN: { packed.Set("type", events::types::SHOW); break; }
				case SDL_WINDOWEVENT_HIDDEN: { packed.Set("type", events::types::HIDE); break; }
				case SDL_WINDOWEVENT_EXPOSED: { packed.Set("type", events::types::EXPOSE); break; }
				case SDL_WINDOWEVENT_MOVED: {
					packed.Set("type", events::types::MOVE);
					packed.Set("x", Napi::Number::New(env, event.window.data1));
					packed.Set("y", Napi::Number::New(env, event.window.data2));
					break;
				}
				case SDL_WINDOWEVENT_SIZE_CHANGED: {
					SDL_Window *window = SDL_GetWindowFromID(event.window.windowID);
					if (window == nullptr) {
						const char *error = SDL_GetError();
						if (error == global::no_error) { return; }

						std::ostringstream message;
						message << "SDL_GetWindowFromID() error: " << SDL_GetError();
						SDL_ClearError();
						throw Napi::Error::New(env, message.str());
					}

					int pixel_width, pixel_height;
					SDL_GetWindowSizeInPixels(window, &pixel_width, &pixel_height);

					packed.Set("type", events::types::RESIZE);
					packed.Set("width", Napi::Number::New(env, event.window.data1));
					packed.Set("height", Napi::Number::New(env, event.window.data2));
					packed.Set("pixelWidth", Napi::Number::New(env, pixel_width));
					packed.Set("pixelHeight", Napi::Number::New(env, pixel_height));
					break;
				}
				case SDL_WINDOWEVENT_MINIMIZED: { packed.Set("type", events::types::MINIMIZE); break; }
				case SDL_WINDOWEVENT_MAXIMIZED: { packed.Set("type", events::types::MAXIMIZE); break; }
				case SDL_WINDOWEVENT_RESTORED: { packed.Set("type", events::types::RESTORE); break; }
				case SDL_WINDOWEVENT_FOCUS_GAINED: { packed.Set("type", events::types::FOCUS); break; }
				case SDL_WINDOWEVENT_FOCUS_LOST: { packed.Set("type", events::types::BLUR); break; }
				case SDL_WINDOWEVENT_ENTER: { packed.Set("type", events::types::HOVER); break; }
				case SDL_WINDOWEVENT_LEAVE: { packed.Set("type", events::types::LEAVE); break; }
				case SDL_WINDOWEVENT_CLOSE: { packed.Set("type", events::types::CLOSE); break; }
			}
			break;
		}

		case SDL_DROPBEGIN:
		case SDL_DROPCOMPLETE: {
			packed.Set("family", events::families::DROP);
			packed.Set("type", event.type == SDL_DROPBEGIN ? events::types::DROP_BEGIN : events::types::DROP_COMPLETE);
			packed.Set("windowId", Napi::Number::New(env, event.drop.windowID));
			break;
		}
		case SDL_DROPFILE:
		case SDL_DROPTEXT: {
			packed.Set("family", events::families::DROP);
			bool is_file = event.type == SDL_DROPFILE;
			packed.Set("type", is_file ? events::types::DROP_FILE : events::types::DROP_TEXT);
			packed.Set("windowId", Napi::Number::New(env, event.drop.windowID));
			packed.Set(is_file ? "file" : "text", Napi::String::New(env, event.drop.file));
			break;
		}

		case SDL_KEYDOWN:
		case SDL_KEYUP: {
			packed.Set("family", events::families::KEYBOARD);
			packed.Set("type", event.type == SDL_KEYDOWN ? events::types::KEY_DOWN : events::types::KEY_UP);
			packed.Set("windowId", Napi::Number::New(env, event.key.windowID));

			SDL_Keysym symbol = event.key.keysym;
			packed.Set("scancode", Napi::Number::New(env, symbol.scancode));

			const char *name = SDL_GetKeyName(symbol.sym);
			if (name[0] != '\0') {
				packed.Set("key", Napi::String::New(env, name));
			}
			else {
				packed.Set("key", env.Null());
			}

			if (event.type == SDL_KEYDOWN) {
				packed.Set("repeat", Napi::Boolean::New(env, !!event.key.repeat));
			}

			packed.Set("alt", Napi::Boolean::New(env, !!(symbol.mod & KMOD_ALT)));
			packed.Set("ctrl", Napi::Boolean::New(env, !!(symbol.mod & KMOD_CTRL)));
			packed.Set("shift", Napi::Boolean::New(env, !!(symbol.mod & KMOD_SHIFT)));
			packed.Set("super", Napi::Boolean::New(env, !!(symbol.mod & KMOD_GUI)));
			packed.Set("altgr", Napi::Boolean::New(env, !!(symbol.mod & KMOD_MODE)));
			packed.Set("numlock", Napi::Boolean::New(env, !!(symbol.mod & KMOD_NUM)));
			packed.Set("capslock", Napi::Boolean::New(env, !!(symbol.mod & KMOD_CAPS)));
			break;
		}

		case SDL_TEXTINPUT: {
			packed.Set("family", events::families::TEXT);
			packed.Set("type", events::types::TEXT_INPUT);
			packed.Set("windowId", Napi::Number::New(env, event.text.windowID));
			packed.Set("text", Napi::String::New(env, event.text.text));
			break ;
		}

		case SDL_MOUSEMOTION: {
			packed.Set("family", events::families::MOUSE);
			packed.Set("type", events::types::MOUSE_MOVE);
			packed.Set("windowId", Napi::Number::New(env, event.motion.windowID));
			packed.Set("touch", Napi::Boolean::New(env, event.motion.which == SDL_TOUCH_MOUSEID));
			packed.Set("x", Napi::Number::New(env, event.motion.x));
			packed.Set("y", Napi::Number::New(env, event.motion.y));
			break;
		}
		case SDL_MOUSEBUTTONDOWN:
		case SDL_MOUSEBUTTONUP: {
			packed.Set("family", events::families::MOUSE);
			packed.Set("type", event.type == SDL_MOUSEBUTTONDOWN ? events::types::MOUSE_BUTTON_DOWN : events::types::MOUSE_BUTTON_UP);
			packed.Set("windowId", Napi::Number::New(env, event.button.windowID));
			packed.Set("touch", Napi::Boolean::New(env, event.button.which == SDL_TOUCH_MOUSEID));
			packed.Set("button", Napi::Number::New(env, event.button.button));
			packed.Set("x", Napi::Number::New(env, event.button.x));
			packed.Set("y", Napi::Number::New(env, event.button.y));
			break;
		}
		case SDL_MOUSEWHEEL: {
			packed.Set("family", events::families::MOUSE);
			packed.Set("type", events::types::MOUSE_WHEEL);
			packed.Set("windowId", Napi::Number::New(env, event.wheel.windowID));
			packed.Set("touch", Napi::Boolean::New(env, event.wheel.which == SDL_TOUCH_MOUSEID));

			int x, y;
			SDL_GetMouseState(&x, &y);
			packed.Set("x", Napi::Number::New(env, x));
			packed.Set("y", Napi::Number::New(env, y));

			packed.Set("dx", Napi::Number::New(env, event.wheel.x));
			packed.Set("dy", Napi::Number::New(env, event.wheel.y));
			packed.Set("flipped", Napi::Boolean::New(env, event.wheel.direction));
			break;
		}

		case SDL_JOYDEVICEADDED: {
			packed.Set("family", events::families::JOYSTICK_DEVICE);
			packed.Set("type", events::types::DEVICE_ADD);
			packed.Set("devices", joystick::_getDevices(env));
			break;
		}
		case SDL_JOYDEVICEREMOVED: {
			packed.Set("family", events::families::JOYSTICK_DEVICE);
			packed.Set("type", events::types::DEVICE_REMOVE);
			packed.Set("joystickId", Napi::Number::New(env, event.jdevice.which));
			packed.Set("devices", joystick::_getDevices(env));
			break;
		}

		case SDL_JOYAXISMOTION: {
			packed.Set("family", events::families::JOYSTICK);
			packed.Set("type", events::types::AXIS_MOTION);
			packed.Set("joystickId", Napi::Number::New(env, event.jaxis.which));
			packed.Set("axis", Napi::Number::New(env, event.jaxis.axis));
			packed.Set("value", Napi::Number::New(env, joystick::mapAxis(event.jaxis.value)));
			break ;
		}
		case SDL_JOYBALLMOTION: {
			packed.Set("family", events::families::JOYSTICK);
			packed.Set("type", events::types::BALL_MOTION);
			packed.Set("joystickId", Napi::Number::New(env, event.jball.which));
			packed.Set("ball", Napi::Number::New(env, event.jball.ball));
			packed.Set("x", Napi::Number::New(env, event.jball.xrel));
			packed.Set("y", Napi::Number::New(env, event.jball.yrel));
			break ;
		}
		case SDL_JOYBUTTONDOWN:
		case SDL_JOYBUTTONUP: {
			packed.Set("family", events::families::JOYSTICK);
			packed.Set("type", event.type == SDL_JOYBUTTONDOWN ? events::types::BUTTON_DOWN : events::types::BUTTON_UP);
			packed.Set("joystickId", Napi::Number::New(env, event.jbutton.which));
			packed.Set("button", Napi::Number::New(env, event.jbutton.button));
			break ;
		}
		case SDL_JOYHATMOTION: {
			packed.Set("family", events::families::JOYSTICK);
			packed.Set("type", events::types::HAT_MOTION);
			packed.Set("joystickId", Napi::Number::New(env, event.jhat.which));
			packed.Set("hat", Napi::Number::New(env, event.jhat.hat));
			packed.Set("value", joystick::hat_positions[event.jhat.value]);
			break ;
		}

		case SDL_CONTROLLERDEVICEREMAPPED: {
			packed.Set("family", events::families::CONTROLLER);
			packed.Set("type", events::types::REMAP);
			SDL_JoystickID controller_id = event.cdevice.which;
			packed.Set("controllerId", Napi::Number::New(env, controller_id));

			SDL_GameController *controller = SDL_GameControllerFromInstanceID(controller_id);
			if (controller == nullptr) {
				std::ostringstream message;
				message << "SDL_GameControllerFromInstanceID(" << controller_id << ") error: " << SDL_GetError();
				SDL_ClearError();
				throw Napi::Error::New(env, message.str());
			}

			controller::getState(env, controller, packed);
			break;
		}

		case SDL_CONTROLLERAXISMOTION: {
			packed.Set("family", events::families::CONTROLLER);
			packed.Set("type", events::types::AXIS_MOTION);
			packed.Set("controllerId", Napi::Number::New(env, event.caxis.which));
			packed.Set("axis", controller::axes[(SDL_GameControllerAxis) event.caxis.axis]);
			packed.Set("value", Napi::Number::New(env, joystick::mapAxis(event.caxis.value)));
			break;
		}
		case SDL_CONTROLLERBUTTONDOWN:
		case SDL_CONTROLLERBUTTONUP: {
			packed.Set("family", events::families::CONTROLLER);
			packed.Set("type", event.type == SDL_CONTROLLERBUTTONDOWN ? events::types::BUTTON_DOWN : events::types::BUTTON_UP);
			packed.Set("controllerId", Napi::Number::New(env, event.cbutton.which));
			packed.Set("button", controller::buttons[(SDL_GameControllerButton) event.cbutton.button]);
			break;
		}

		case SDL_SENSORUPDATE: {
			packed.Set("family", events::families::SENSOR);
			packed.Set("type", events::types::UPDATE);
			packed.Set("sensorId", Napi::Number::New(env, event.sensor.which));
			break;
		}

		case SDL_AUDIODEVICEADDED: {
			packed.Set("family", events::families::AUDIO_DEVICE);
			packed.Set("type", events::types::DEVICE_ADD);
			bool is_capture = event.adevice.iscapture;
			packed.Set("isRecorder", Napi::Boolean::New(env, is_capture));
			packed.Set("devices", audio::_getDevices(env, is_capture));
			break;
		}
		case SDL_AUDIODEVICEREMOVED: {
			packed.Set("family", events::families::AUDIO_DEVICE);
			packed.Set("type", events::types::DEVICE_REMOVE);
			packed.Set("audioId", Napi::Number::New(env, event.adevice.which));
			bool is_capture = event.adevice.iscapture;
			packed.Set("isRecorder", Napi::Boolean::New(env, is_capture));
			packed.Set("devices", audio::_getDevices(env, is_capture));
			break;
		}

		case SDL_CLIPBOARDUPDATE: {
			packed.Set("family", events::families::CLIPBOARD);
			packed.Set("type", events::types::UPDATE);
			break;
		}

		// case SDL_FINGERUP:
		// case SDL_FINGERDOWN: {
		// 	SET_STRING(object, "type", event.type == SDL_FINGERUP
		// 		? "fingerUp"
		// 		: "fingerDown");
		// 	packed.Set("touch_id", Napi::Number::New(env, event.tfinger.touchId));
		// 	packed.Set("finger_id", Napi::Number::New(env, event.tfinger.fingerId));
		// 	packed.Set("pressure", Napi::Number::New(env, event.tfinger.pressure));
		// 	packed.Set("x", Napi::Number::New(env, event.tfinger.x));
		// 	packed.Set("y", Napi::Number::New(env, event.tfinger.y));
		// 	break;
		// }
		// case SDL_FINGERMOTION: {
		// 	SET_STRING(object, "type", "fingerMotion");
		// 	packed.Set("touch_id", Napi::Number::New(env, event.tfinger.touchId));
		// 	packed.Set("finger_id", Napi::Number::New(env, event.tfinger.fingerId));
		// 	packed.Set("pressure", Napi::Number::New(env, event.tfinger.pressure));
		// 	packed.Set("x", Napi::Number::New(env, event.tfinger.x));
		// 	packed.Set("y", Napi::Number::New(env, event.tfinger.y));
		// 	packed.Set("dx", Napi::Number::New(env, event.tfinger.dx));
		// 	packed.Set("dy", Napi::Number::New(env, event.tfinger.dy));
		// 	break;
		// }
	}

	poll_callback->Call(poll_env->Global(), { packed });
}

Napi::Value
events::poll (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	Napi::Function callback = info[0].As<Napi::Function>();

	poll_env = &env;
	poll_callback = &callback;

	SDL_Event event;
	while (SDL_PollEvent(&event)) { events::dispatchEvent(event); }

	poll_env = nullptr;
	poll_callback = nullptr;

	return env.Undefined();
}
