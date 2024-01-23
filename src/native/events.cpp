#include "events.h"
#include "enums.h"
#include "global.h"
#include "joystick.h"
#include "controller.h"
#include "audio.h"
#include <SDL.h>
#include <string>
#include <sstream>

Napi::Env *poll_env = nullptr;
Napi::Function *poll_callback = nullptr;

Napi::Object
packageEvent (Napi::Env &env, const SDL_Event &event)
{
	Napi::Object result = Napi::Object::New(env);

	switch (event.type) {
		case SDL_DISPLAYEVENT: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::DISPLAY));
			result.Set("displayIndex", Napi::Number::New(env, event.display.display));

			switch (event.display.event) {
				case SDL_DISPLAYEVENT_CONNECTED: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::DISPLAY_ADD)); break; }
				case SDL_DISPLAYEVENT_DISCONNECTED: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::DISPLAY_REMOVE)); break; }
				case SDL_DISPLAYEVENT_ORIENTATION: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::DISPLAY_ORIENT)); break; }
			}
			break;
		}

		case SDL_WINDOWEVENT: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::WINDOW));
			result.Set("windowId", Napi::Number::New(env, event.window.windowID));

			switch (event.window.event) {
				case SDL_WINDOWEVENT_SHOWN: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::SHOW)); break; }
				case SDL_WINDOWEVENT_HIDDEN: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::HIDE)); break; }
				case SDL_WINDOWEVENT_EXPOSED: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::EXPOSE)); break; }
				case SDL_WINDOWEVENT_MOVED: {
					result.Set("type", Napi::Number::New(env, (int) enums::EventType::MOVE));
					result.Set("x", Napi::Number::New(env, event.window.data1));
					result.Set("y", Napi::Number::New(env, event.window.data2));
					break;
				}
				case SDL_WINDOWEVENT_SIZE_CHANGED: {
					SDL_Window *window = SDL_GetWindowFromID(event.window.windowID);
					if (window == nullptr) {
						std::ostringstream message;
						message << "SDL_GetWindowFromID() error: " << SDL_GetError();
						SDL_ClearError();
						throw Napi::Error::New(env, message.str());
					}

					int pixel_width, pixel_height;
					SDL_GetWindowSizeInPixels(window, &pixel_width, &pixel_height);

					result.Set("type", Napi::Number::New(env, (int) enums::EventType::RESIZE));
					result.Set("width", Napi::Number::New(env, event.window.data1));
					result.Set("height", Napi::Number::New(env, event.window.data2));
					result.Set("pixelWidth", Napi::Number::New(env, pixel_width));
					result.Set("pixelHeight", Napi::Number::New(env, pixel_height));
					break;
				}
				case SDL_WINDOWEVENT_MINIMIZED: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::MINIMIZE)); break; }
				case SDL_WINDOWEVENT_MAXIMIZED: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::MAXIMIZE)); break; }
				case SDL_WINDOWEVENT_RESTORED: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::RESTORE)); break; }
				case SDL_WINDOWEVENT_FOCUS_GAINED: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::FOCUS)); break; }
				case SDL_WINDOWEVENT_FOCUS_LOST: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::BLUR)); break; }
				case SDL_WINDOWEVENT_ENTER: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::HOVER)); break; }
				case SDL_WINDOWEVENT_LEAVE: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::LEAVE)); break; }
				case SDL_WINDOWEVENT_CLOSE: { result.Set("type", Napi::Number::New(env, (int) enums::EventType::CLOSE)); break; }
			}
			break;
		}

		case SDL_DROPBEGIN:
		case SDL_DROPCOMPLETE: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::DROP));
			result.Set("type", Napi::Number::New(env, (int) (event.type == SDL_DROPBEGIN ? enums::EventType::DROP_BEGIN : enums::EventType::DROP_COMPLETE)));
			result.Set("windowId", Napi::Number::New(env, event.drop.windowID));
			break;
		}
		case SDL_DROPFILE:
		case SDL_DROPTEXT: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::DROP));
			bool is_file = event.type == SDL_DROPFILE;
			result.Set("type", Napi::Number::New(env, (int) (is_file ? enums::EventType::DROP_FILE : enums::EventType::DROP_TEXT)));
			result.Set("windowId", Napi::Number::New(env, event.drop.windowID));
			result.Set(is_file ? "file" : "text", Napi::String::New(env, event.drop.file));
			break;
		}

		case SDL_KEYDOWN:
		case SDL_KEYUP: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::KEYBOARD));
			result.Set("type", Napi::Number::New(env, (int) (event.type == SDL_KEYDOWN ? enums::EventType::KEY_DOWN : enums::EventType::KEY_UP)));
			result.Set("windowId", Napi::Number::New(env, event.key.windowID));

			SDL_Keysym symbol = event.key.keysym;
			result.Set("scancode", Napi::Number::New(env, symbol.scancode));

			const char *name = SDL_GetKeyName(symbol.sym);
			if (name[0] != '\0') {
				result.Set("key", Napi::String::New(env, name));
			}
			else {
				result.Set("key", env.Null());
			}

			if (event.type == SDL_KEYDOWN) {
				result.Set("repeat", Napi::Boolean::New(env, !!event.key.repeat));
			}

			result.Set("alt", Napi::Boolean::New(env, !!(symbol.mod & KMOD_ALT)));
			result.Set("ctrl", Napi::Boolean::New(env, !!(symbol.mod & KMOD_CTRL)));
			result.Set("shift", Napi::Boolean::New(env, !!(symbol.mod & KMOD_SHIFT)));
			result.Set("super", Napi::Boolean::New(env, !!(symbol.mod & KMOD_GUI)));
			result.Set("altgr", Napi::Boolean::New(env, !!(symbol.mod & KMOD_MODE)));
			result.Set("numlock", Napi::Boolean::New(env, !!(symbol.mod & KMOD_NUM)));
			result.Set("capslock", Napi::Boolean::New(env, !!(symbol.mod & KMOD_CAPS)));
			break;
		}

		case SDL_TEXTINPUT: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::TEXT));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::TEXT_INPUT));
			result.Set("windowId", Napi::Number::New(env, event.text.windowID));
			result.Set("text", Napi::String::New(env, event.text.text));
			break ;
		}

		case SDL_MOUSEMOTION: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::MOUSE));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::MOUSE_MOVE));
			result.Set("windowId", Napi::Number::New(env, event.motion.windowID));
			result.Set("touch", Napi::Boolean::New(env, event.motion.which == SDL_TOUCH_MOUSEID));
			result.Set("x", Napi::Number::New(env, event.motion.x));
			result.Set("y", Napi::Number::New(env, event.motion.y));
			break;
		}
		case SDL_MOUSEBUTTONDOWN:
		case SDL_MOUSEBUTTONUP: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::MOUSE));
			result.Set("type", Napi::Number::New(env, (int) (event.type == SDL_MOUSEBUTTONDOWN ? enums::EventType::MOUSE_BUTTON_DOWN : enums::EventType::MOUSE_BUTTON_UP)));
			result.Set("windowId", Napi::Number::New(env, event.button.windowID));
			result.Set("touch", Napi::Boolean::New(env, event.button.which == SDL_TOUCH_MOUSEID));
			result.Set("button", Napi::Number::New(env, event.button.button));
			result.Set("x", Napi::Number::New(env, event.button.x));
			result.Set("y", Napi::Number::New(env, event.button.y));
			break;
		}
		case SDL_MOUSEWHEEL: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::MOUSE));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::MOUSE_WHEEL));
			result.Set("windowId", Napi::Number::New(env, event.wheel.windowID));
			result.Set("touch", Napi::Boolean::New(env, event.wheel.which == SDL_TOUCH_MOUSEID));

			int x, y;
			SDL_GetMouseState(&x, &y);
			result.Set("x", Napi::Number::New(env, x));
			result.Set("y", Napi::Number::New(env, y));

			result.Set("dx", Napi::Number::New(env, event.wheel.x));
			result.Set("dy", Napi::Number::New(env, event.wheel.y));
			result.Set("flipped", Napi::Boolean::New(env, event.wheel.direction));
			break;
		}

		case SDL_JOYDEVICEADDED: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::JOYSTICK_DEVICE));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::DEVICE_ADD));
			result.Set("devices", joystick::_getDevices(env));
			break;
		}
		case SDL_JOYDEVICEREMOVED: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::JOYSTICK_DEVICE));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::DEVICE_REMOVE));
			result.Set("joystickId", Napi::Number::New(env, event.jdevice.which));
			result.Set("devices", joystick::_getDevices(env));
			break;
		}

		case SDL_JOYAXISMOTION: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::JOYSTICK));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::AXIS_MOTION));
			result.Set("joystickId", Napi::Number::New(env, event.jaxis.which));
			result.Set("axis", Napi::Number::New(env, event.jaxis.axis));
			result.Set("value", Napi::Number::New(env, joystick::mapAxis(event.jaxis.value)));
			break ;
		}
		case SDL_JOYBALLMOTION: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::JOYSTICK));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::BALL_MOTION));
			result.Set("joystickId", Napi::Number::New(env, event.jball.which));
			result.Set("ball", Napi::Number::New(env, event.jball.ball));
			result.Set("x", Napi::Number::New(env, event.jball.xrel));
			result.Set("y", Napi::Number::New(env, event.jball.yrel));
			break ;
		}
		case SDL_JOYBUTTONDOWN:
		case SDL_JOYBUTTONUP: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::JOYSTICK));
			result.Set("type", Napi::Number::New(env, (int) (event.type == SDL_JOYBUTTONDOWN ? enums::EventType::BUTTON_DOWN : enums::EventType::BUTTON_UP)));
			result.Set("joystickId", Napi::Number::New(env, event.jbutton.which));
			result.Set("button", Napi::Number::New(env, event.jbutton.button));
			break ;
		}
		case SDL_JOYHATMOTION: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::JOYSTICK));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::HAT_MOTION));
			result.Set("joystickId", Napi::Number::New(env, event.jhat.which));
			result.Set("hat", Napi::Number::New(env, event.jhat.hat));
			result.Set("value", Napi::Number::New(env, event.jhat.value));
			break ;
		}

		case SDL_CONTROLLERDEVICEREMAPPED: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::CONTROLLER));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::REMAP));
			SDL_JoystickID controller_id = event.cdevice.which;
			result.Set("controllerId", Napi::Number::New(env, controller_id));

			SDL_GameController *controller = SDL_GameControllerFromInstanceID(controller_id);
			if (controller == nullptr) {
				std::ostringstream message;
				message << "SDL_GameControllerFromInstanceID(" << controller_id << ") error: " << SDL_GetError();
				SDL_ClearError();
				throw Napi::Error::New(env, message.str());
			}

			controller::getState(env, controller, result);
			break;
		}

		case SDL_CONTROLLERAXISMOTION: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::CONTROLLER));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::AXIS_MOTION));
			result.Set("controllerId", Napi::Number::New(env, event.caxis.which));
			result.Set("axis", Napi::Number::New(env, event.caxis.axis));
			result.Set("value", Napi::Number::New(env, joystick::mapAxis(event.caxis.value)));
			break;
		}
		case SDL_CONTROLLERBUTTONDOWN:
		case SDL_CONTROLLERBUTTONUP: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::CONTROLLER));
			result.Set("type", Napi::Number::New(env, (int) (event.type == SDL_CONTROLLERBUTTONDOWN ? enums::EventType::BUTTON_DOWN : enums::EventType::BUTTON_UP)));
			result.Set("controllerId", Napi::Number::New(env, event.cbutton.which));
			result.Set("button", Napi::Number::New(env, event.cbutton.button));
			break;
		}

		case SDL_SENSORUPDATE: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::SENSOR));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::UPDATE));
			result.Set("sensorId", Napi::Number::New(env, event.sensor.which));
			break;
		}

		case SDL_AUDIODEVICEADDED: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::AUDIO_DEVICE));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::DEVICE_ADD));
			bool is_capture = event.adevice.iscapture;
			result.Set("isRecorder", Napi::Boolean::New(env, is_capture));
			result.Set("devices", audio::_getDevices(env, is_capture));
			break;
		}
		case SDL_AUDIODEVICEREMOVED: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::AUDIO_DEVICE));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::DEVICE_REMOVE));
			result.Set("audioId", Napi::Number::New(env, event.adevice.which));
			bool is_capture = event.adevice.iscapture;
			result.Set("isRecorder", Napi::Boolean::New(env, is_capture));
			result.Set("devices", audio::_getDevices(env, is_capture));
			break;
		}

		case SDL_CLIPBOARDUPDATE: {
			result.Set("family", Napi::Number::New(env, (int) enums::EventFamily::CLIPBOARD));
			result.Set("type", Napi::Number::New(env, (int) enums::EventType::UPDATE));
			break;
		}

		// case SDL_FINGERUP:
		// case SDL_FINGERDOWN: {
		// 	SET_STRING(object, "type", event.type == SDL_FINGERUP
		// 		? "fingerUp"
		// 		: "fingerDown");
		// 	result.Set("touch_id", Napi::Number::New(env, event.tfinger.touchId));
		// 	result.Set("finger_id", Napi::Number::New(env, event.tfinger.fingerId));
		// 	result.Set("pressure", Napi::Number::New(env, event.tfinger.pressure));
		// 	result.Set("x", Napi::Number::New(env, event.tfinger.x));
		// 	result.Set("y", Napi::Number::New(env, event.tfinger.y));
		// 	break;
		// }
		// case SDL_FINGERMOTION: {
		// 	SET_STRING(object, "type", "fingerMotion");
		// 	result.Set("touch_id", Napi::Number::New(env, event.tfinger.touchId));
		// 	result.Set("finger_id", Napi::Number::New(env, event.tfinger.fingerId));
		// 	result.Set("pressure", Napi::Number::New(env, event.tfinger.pressure));
		// 	result.Set("x", Napi::Number::New(env, event.tfinger.x));
		// 	result.Set("y", Napi::Number::New(env, event.tfinger.y));
		// 	result.Set("dx", Napi::Number::New(env, event.tfinger.dx));
		// 	result.Set("dy", Napi::Number::New(env, event.tfinger.dy));
		// 	break;
		// }
	}

	return result;
}


void
events::dispatchEvent(const SDL_Event &event)
{
	if (poll_env == nullptr || poll_callback == nullptr) { return; }

	Napi::Value packed = packageEvent(*poll_env, event);
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
