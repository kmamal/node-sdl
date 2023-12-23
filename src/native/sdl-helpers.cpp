#include "sdl-helpers.h"
#include <SDL.h>
#include <SDL_syswm.h>
#include <cstdio>
#include <cstdlib>
#include <cstring>

#if defined(_WIN32)
	#include "asprintf.h"
#endif


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


#define RETURN_ERROR(...) do { \
	char * error; \
	int result = asprintf(&error, __VA_ARGS__); \
	return result == -1 ? new ErrorMessage("asprintf failed", false) : new ErrorMessage(error); \
} while (0)


static const char * no_error = nullptr;

static char * allocated_drop_file = nullptr ;
static char * allocated_clipboard = nullptr ;
static SDL_Cursor * allocated_cursor = nullptr;

struct AllocString {
	char * buffer;
	AllocString * next;
};
static AllocString * allocated_guid_strings = nullptr;
char * _allocateString (int size) {
	AllocString * node = (AllocString*) malloc(sizeof(AllocString));
	node->buffer = (char *) malloc(size);
	AllocString * head = allocated_guid_strings;
	allocated_guid_strings = node;
	node->next = head;
	return node->buffer;
}

static const Uint8 * keys;
static int num_keys;

static char text_input[32];

const static int SDL_JOYSTICK_AXIS_RANGE = SDL_JOYSTICK_AXIS_MAX - SDL_JOYSTICK_AXIS_MIN;

double _joystickMapAxis (int value) {
	return (value - SDL_JOYSTICK_AXIS_MIN) / (SDL_JOYSTICK_AXIS_RANGE / 2.0) - 1;
}


namespace SdlHelpers {


#define MAKE_VAR(target, type, value) do { \
	target.emplace<type>(value); \
} while (false)

#define MAKE_MAP(target) MAKE_VAR(target, 1, VariantMap())

static Variant var;

#define SET_PROP(object, prop, type, value) do { \
	MAKE_VAR(var, type, value); \
	std::get<VariantMap>(object).insert({ prop, var }); \
} while (false)

#define SET_NULL(object, prop) SET_PROP(object, prop, 0, std::monostate())
#define SET_MAP(object, prop, val) SET_PROP(object, prop, 1, std::get<VariantMap>(val))
#define SET_LIST(object, prop, val) SET_PROP(object, prop, 2, std::get<VariantList>(val))
#define SET_NUM(object, prop, val) SET_PROP(object, prop, 3, val)
#define SET_STRING(object, prop, val) SET_PROP(object, prop, 4, val)
#define SET_BOOL(object, prop, val) SET_PROP(object, prop, 5, val)

#define MAKE_LIST(target) MAKE_VAR(target, 2, VariantList())

#define APPEND(list, item) do { \
	std::get<VariantList>(list).push_back(item); \
} while (false)

#define APPEND_VALUE(list, type, value) do { \
	MAKE_VAR(var, type, value); \
	APPEND(list, var); \
} while (false)

#define MAKE_NUM(target, value) MAKE_VAR(target, 3, value)

#define MAKE_STRING(target, value) MAKE_VAR(target, 4, value)

#define MAKE_BOOL(target, value) MAKE_VAR(target, 5, value)


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


enum class EventFamily {
	DISPLAY,
	WINDOW,
	KEYBOARD,
	MOUSE,
	TEXT,
	DROP,
	JOYSTICK_DEVICE,
	JOYSTICK,
	CONTROLLER,
	SENSOR,
	AUDIO_DEVICE,
	CLIPBOARD,
};

ErrorMessage *
enum_getEventFamilies (Variant & families)
{
	MAKE_MAP(families);

	SET_NUM(families, "display", (int) EventFamily::DISPLAY);
	SET_NUM(families, "window", (int) EventFamily::WINDOW);
	SET_NUM(families, "keyboard", (int) EventFamily::KEYBOARD);
	SET_NUM(families, "mouse", (int) EventFamily::MOUSE);
	SET_NUM(families, "text", (int) EventFamily::TEXT);
	SET_NUM(families, "drop", (int) EventFamily::DROP);
	SET_NUM(families, "joystickDevice", (int) EventFamily::JOYSTICK_DEVICE);
	SET_NUM(families, "joystick", (int) EventFamily::JOYSTICK);
	SET_NUM(families, "controller", (int) EventFamily::CONTROLLER);
	SET_NUM(families, "audioDevice", (int) EventFamily::AUDIO_DEVICE);
	SET_NUM(families, "clipboard", (int) EventFamily::CLIPBOARD);

	return nullptr;
}


enum class EventType {
	QUIT,
	DISPLAY_ADD,
	DISPLAY_REMOVE,
	DISPLAY_ORIENT,
	SHOW,
	HIDE,
	EXPOSE,
	MOVE,
	RESIZE,
	MINIMIZE,
	MAXIMIZE,
	RESTORE,
	FOCUS,
	BLUR,
	HOVER,
	LEAVE,
	CLOSE,
	DROP_BEGIN,
	DROP_COMPLETE,
	DROP_FILE,
	DROP_TEXT,
	KEY_DOWN,
	KEY_UP,
	TEXT_INPUT,
	MOUSE_MOVE,
	MOUSE_BUTTON_DOWN,
	MOUSE_BUTTON_UP,
	MOUSE_WHEEL,
	DEVICE_ADD,
	DEVICE_REMOVE,
	AXIS_MOTION,
	BALL_MOTION,
	BUTTON_DOWN,
	BUTTON_UP,
	HAT_MOTION,
	REMAP,
	UPDATE,
};

ErrorMessage *
enum_getEventTypes (Variant & types)
{
	MAKE_MAP(types);

	SET_NUM(types, "quit", (int) EventType::QUIT);
	SET_NUM(types, "displayAdd", (int) EventType::DISPLAY_ADD);
	SET_NUM(types, "displayRemove", (int) EventType::DISPLAY_REMOVE);
	SET_NUM(types, "displayOrient", (int) EventType::DISPLAY_ORIENT);
	SET_NUM(types, "show", (int) EventType::SHOW);
	SET_NUM(types, "hide", (int) EventType::HIDE);
	SET_NUM(types, "expose", (int) EventType::EXPOSE);
	SET_NUM(types, "move", (int) EventType::MOVE);
	SET_NUM(types, "resize", (int) EventType::RESIZE);
	SET_NUM(types, "minimize", (int) EventType::MINIMIZE);
	SET_NUM(types, "maximize", (int) EventType::MAXIMIZE);
	SET_NUM(types, "restore", (int) EventType::RESTORE);
	SET_NUM(types, "focus", (int) EventType::FOCUS);
	SET_NUM(types, "blur", (int) EventType::BLUR);
	SET_NUM(types, "hover", (int) EventType::HOVER);
	SET_NUM(types, "leave", (int) EventType::LEAVE);
	SET_NUM(types, "close", (int) EventType::CLOSE);
	SET_NUM(types, "dropBegin", (int) EventType::DROP_BEGIN);
	SET_NUM(types, "dropComplete", (int) EventType::DROP_COMPLETE);
	SET_NUM(types, "dropFile", (int) EventType::DROP_FILE);
	SET_NUM(types, "dropText", (int) EventType::DROP_TEXT);
	SET_NUM(types, "keyDown", (int) EventType::KEY_DOWN);
	SET_NUM(types, "keyUp", (int) EventType::KEY_UP);
	SET_NUM(types, "textInput", (int) EventType::TEXT_INPUT);
	SET_NUM(types, "mouseMove", (int) EventType::MOUSE_MOVE);
	SET_NUM(types, "mouseButtonDown", (int) EventType::MOUSE_BUTTON_DOWN);
	SET_NUM(types, "mouseButtonUp", (int) EventType::MOUSE_BUTTON_UP);
	SET_NUM(types, "mouseWheel", (int) EventType::MOUSE_WHEEL);
	SET_NUM(types, "deviceAdd", (int) EventType::DEVICE_ADD);
	SET_NUM(types, "deviceRemove", (int) EventType::DEVICE_REMOVE);
	SET_NUM(types, "axisMotion", (int) EventType::AXIS_MOTION);
	SET_NUM(types, "ballMotion", (int) EventType::BALL_MOTION);
	SET_NUM(types, "buttonDown", (int) EventType::BUTTON_DOWN);
	SET_NUM(types, "buttonUp", (int) EventType::BUTTON_UP);
	SET_NUM(types, "hatMotion", (int) EventType::HAT_MOTION);
	SET_NUM(types, "remap", (int) EventType::REMAP);
	SET_NUM(types, "update", (int) EventType::UPDATE);

	return nullptr;
}


ErrorMessage *
enum_getPixelFormats (Variant & formats)
{
	MAKE_MAP(formats);

	SET_NUM(formats, "rgb332", SDL_PIXELFORMAT_RGB332);
	SET_NUM(formats, "rgb444", SDL_PIXELFORMAT_RGB444);
	SET_NUM(formats, "rgb555", SDL_PIXELFORMAT_RGB555);
	SET_NUM(formats, "bgr555", SDL_PIXELFORMAT_BGR555);
	SET_NUM(formats, "argb4444", SDL_PIXELFORMAT_ARGB4444);
	SET_NUM(formats, "rgba4444", SDL_PIXELFORMAT_RGBA4444);
	SET_NUM(formats, "abgr4444", SDL_PIXELFORMAT_ABGR4444);
	SET_NUM(formats, "bgra4444", SDL_PIXELFORMAT_BGRA4444);
	SET_NUM(formats, "argb1555", SDL_PIXELFORMAT_ARGB1555);
	SET_NUM(formats, "rgba5551", SDL_PIXELFORMAT_RGBA5551);
	SET_NUM(formats, "abgr1555", SDL_PIXELFORMAT_ABGR1555);
	SET_NUM(formats, "bgra5551", SDL_PIXELFORMAT_BGRA5551);
	SET_NUM(formats, "rgb565", SDL_PIXELFORMAT_RGB565);
	SET_NUM(formats, "bgr565", SDL_PIXELFORMAT_BGR565);
	SET_NUM(formats, "rgb24", SDL_PIXELFORMAT_RGB24);
	SET_NUM(formats, "bgr24", SDL_PIXELFORMAT_BGR24);
	SET_NUM(formats, "rgb888", SDL_PIXELFORMAT_RGB888);
	SET_NUM(formats, "rgbx8888", SDL_PIXELFORMAT_RGBX8888);
	SET_NUM(formats, "bgr888", SDL_PIXELFORMAT_BGR888);
	SET_NUM(formats, "bgrx8888", SDL_PIXELFORMAT_BGRX8888);
	SET_NUM(formats, "argb8888", SDL_PIXELFORMAT_ARGB8888);
	SET_NUM(formats, "rgba8888", SDL_PIXELFORMAT_RGBA8888);
	SET_NUM(formats, "abgr8888", SDL_PIXELFORMAT_ABGR8888);
	SET_NUM(formats, "bgra8888", SDL_PIXELFORMAT_BGRA8888);
	SET_NUM(formats, "argb2101010", SDL_PIXELFORMAT_ARGB2101010);
	SET_NUM(formats, "rgba32", SDL_PIXELFORMAT_RGBA32);
	SET_NUM(formats, "argb32", SDL_PIXELFORMAT_ARGB32);
	SET_NUM(formats, "bgra32", SDL_PIXELFORMAT_BGRA32);
	SET_NUM(formats, "abgr32", SDL_PIXELFORMAT_ABGR32);
	SET_NUM(formats, "yv12", SDL_PIXELFORMAT_YV12);
	SET_NUM(formats, "iyuv", SDL_PIXELFORMAT_IYUV);
	SET_NUM(formats, "yuy2", SDL_PIXELFORMAT_YUY2);
	SET_NUM(formats, "uyvy", SDL_PIXELFORMAT_UYVY);
	SET_NUM(formats, "yvyu", SDL_PIXELFORMAT_YVYU);
	SET_NUM(formats, "nv12", SDL_PIXELFORMAT_NV12);
	SET_NUM(formats, "nv21", SDL_PIXELFORMAT_NV21);

	return nullptr;
}

ErrorMessage *
enum_getAudioFormats (Variant & formats)
{
	MAKE_MAP(formats);

	SET_NUM(formats, "s8", AUDIO_S8);
	SET_NUM(formats, "u8", AUDIO_U8);
	SET_NUM(formats, "s16lsb", AUDIO_S16LSB);
	SET_NUM(formats, "s16msb", AUDIO_S16MSB);
	SET_NUM(formats, "s16sys", AUDIO_S16SYS);
	SET_NUM(formats, "s16", AUDIO_S16);
	SET_NUM(formats, "u16lsb", AUDIO_U16LSB);
	SET_NUM(formats, "u16msb", AUDIO_U16MSB);
	SET_NUM(formats, "u16sys", AUDIO_U16SYS);
	SET_NUM(formats, "u16", AUDIO_U16);
	SET_NUM(formats, "s32lsb", AUDIO_S32LSB);
	SET_NUM(formats, "s32msb", AUDIO_S32MSB);
	SET_NUM(formats, "s32sys", AUDIO_S32SYS);
	SET_NUM(formats, "s32", AUDIO_S32);
	SET_NUM(formats, "f32lsb", AUDIO_F32LSB);
	SET_NUM(formats, "f32msb", AUDIO_F32MSB);
	SET_NUM(formats, "f32sys", AUDIO_F32SYS);
	SET_NUM(formats, "f32", AUDIO_F32);

	return nullptr;
}

ErrorMessage *
enum_getScancodes (Variant & scancodes)
{
	MAKE_MAP(scancodes);

	SET_NUM(scancodes, "UNKNOWN", SDL_SCANCODE_UNKNOWN);
	SET_NUM(scancodes, "A", SDL_SCANCODE_A);
	SET_NUM(scancodes, "B", SDL_SCANCODE_B);
	SET_NUM(scancodes, "C", SDL_SCANCODE_C);
	SET_NUM(scancodes, "D", SDL_SCANCODE_D);
	SET_NUM(scancodes, "E", SDL_SCANCODE_E);
	SET_NUM(scancodes, "F", SDL_SCANCODE_F);
	SET_NUM(scancodes, "G", SDL_SCANCODE_G);
	SET_NUM(scancodes, "H", SDL_SCANCODE_H);
	SET_NUM(scancodes, "I", SDL_SCANCODE_I);
	SET_NUM(scancodes, "J", SDL_SCANCODE_J);
	SET_NUM(scancodes, "K", SDL_SCANCODE_K);
	SET_NUM(scancodes, "L", SDL_SCANCODE_L);
	SET_NUM(scancodes, "M", SDL_SCANCODE_M);
	SET_NUM(scancodes, "N", SDL_SCANCODE_N);
	SET_NUM(scancodes, "O", SDL_SCANCODE_O);
	SET_NUM(scancodes, "P", SDL_SCANCODE_P);
	SET_NUM(scancodes, "Q", SDL_SCANCODE_Q);
	SET_NUM(scancodes, "R", SDL_SCANCODE_R);
	SET_NUM(scancodes, "S", SDL_SCANCODE_S);
	SET_NUM(scancodes, "T", SDL_SCANCODE_T);
	SET_NUM(scancodes, "U", SDL_SCANCODE_U);
	SET_NUM(scancodes, "V", SDL_SCANCODE_V);
	SET_NUM(scancodes, "W", SDL_SCANCODE_W);
	SET_NUM(scancodes, "X", SDL_SCANCODE_X);
	SET_NUM(scancodes, "Y", SDL_SCANCODE_Y);
	SET_NUM(scancodes, "Z", SDL_SCANCODE_Z);
	SET_NUM(scancodes, "1", SDL_SCANCODE_1);
	SET_NUM(scancodes, "2", SDL_SCANCODE_2);
	SET_NUM(scancodes, "3", SDL_SCANCODE_3);
	SET_NUM(scancodes, "4", SDL_SCANCODE_4);
	SET_NUM(scancodes, "5", SDL_SCANCODE_5);
	SET_NUM(scancodes, "6", SDL_SCANCODE_6);
	SET_NUM(scancodes, "7", SDL_SCANCODE_7);
	SET_NUM(scancodes, "8", SDL_SCANCODE_8);
	SET_NUM(scancodes, "9", SDL_SCANCODE_9);
	SET_NUM(scancodes, "0", SDL_SCANCODE_0);
	SET_NUM(scancodes, "RETURN", SDL_SCANCODE_RETURN);
	SET_NUM(scancodes, "ESCAPE", SDL_SCANCODE_ESCAPE);
	SET_NUM(scancodes, "BACKSPACE", SDL_SCANCODE_BACKSPACE);
	SET_NUM(scancodes, "TAB", SDL_SCANCODE_TAB);
	SET_NUM(scancodes, "SPACE", SDL_SCANCODE_SPACE);
	SET_NUM(scancodes, "MINUS", SDL_SCANCODE_MINUS);
	SET_NUM(scancodes, "EQUALS", SDL_SCANCODE_EQUALS);
	SET_NUM(scancodes, "LEFTBRACKET", SDL_SCANCODE_LEFTBRACKET);
	SET_NUM(scancodes, "RIGHTBRACKET", SDL_SCANCODE_RIGHTBRACKET);
	SET_NUM(scancodes, "BACKSLASH", SDL_SCANCODE_BACKSLASH);
	SET_NUM(scancodes, "NONUSHASH", SDL_SCANCODE_NONUSHASH);
	SET_NUM(scancodes, "SEMICOLON", SDL_SCANCODE_SEMICOLON);
	SET_NUM(scancodes, "APOSTROPHE", SDL_SCANCODE_APOSTROPHE);
	SET_NUM(scancodes, "GRAVE", SDL_SCANCODE_GRAVE);
	SET_NUM(scancodes, "COMMA", SDL_SCANCODE_COMMA);
	SET_NUM(scancodes, "PERIOD", SDL_SCANCODE_PERIOD);
	SET_NUM(scancodes, "SLASH", SDL_SCANCODE_SLASH);
	SET_NUM(scancodes, "CAPSLOCK", SDL_SCANCODE_CAPSLOCK);
	SET_NUM(scancodes, "F1", SDL_SCANCODE_F1);
	SET_NUM(scancodes, "F2", SDL_SCANCODE_F2);
	SET_NUM(scancodes, "F3", SDL_SCANCODE_F3);
	SET_NUM(scancodes, "F4", SDL_SCANCODE_F4);
	SET_NUM(scancodes, "F5", SDL_SCANCODE_F5);
	SET_NUM(scancodes, "F6", SDL_SCANCODE_F6);
	SET_NUM(scancodes, "F7", SDL_SCANCODE_F7);
	SET_NUM(scancodes, "F8", SDL_SCANCODE_F8);
	SET_NUM(scancodes, "F9", SDL_SCANCODE_F9);
	SET_NUM(scancodes, "F10", SDL_SCANCODE_F10);
	SET_NUM(scancodes, "F11", SDL_SCANCODE_F11);
	SET_NUM(scancodes, "F12", SDL_SCANCODE_F12);
	SET_NUM(scancodes, "PRINTSCREEN", SDL_SCANCODE_PRINTSCREEN);
	SET_NUM(scancodes, "SCROLLLOCK", SDL_SCANCODE_SCROLLLOCK);
	SET_NUM(scancodes, "PAUSE", SDL_SCANCODE_PAUSE);
	SET_NUM(scancodes, "INSERT", SDL_SCANCODE_INSERT);
	SET_NUM(scancodes, "HOME", SDL_SCANCODE_HOME);
	SET_NUM(scancodes, "PAGEUP", SDL_SCANCODE_PAGEUP);
	SET_NUM(scancodes, "DELETE", SDL_SCANCODE_DELETE);
	SET_NUM(scancodes, "END", SDL_SCANCODE_END);
	SET_NUM(scancodes, "PAGEDOWN", SDL_SCANCODE_PAGEDOWN);
	SET_NUM(scancodes, "RIGHT", SDL_SCANCODE_RIGHT);
	SET_NUM(scancodes, "LEFT", SDL_SCANCODE_LEFT);
	SET_NUM(scancodes, "DOWN", SDL_SCANCODE_DOWN);
	SET_NUM(scancodes, "UP", SDL_SCANCODE_UP);
	SET_NUM(scancodes, "NUMLOCKCLEAR", SDL_SCANCODE_NUMLOCKCLEAR);
	SET_NUM(scancodes, "KP_DIVIDE", SDL_SCANCODE_KP_DIVIDE);
	SET_NUM(scancodes, "KP_MULTIPLY", SDL_SCANCODE_KP_MULTIPLY);
	SET_NUM(scancodes, "KP_MINUS", SDL_SCANCODE_KP_MINUS);
	SET_NUM(scancodes, "KP_PLUS", SDL_SCANCODE_KP_PLUS);
	SET_NUM(scancodes, "KP_ENTER", SDL_SCANCODE_KP_ENTER);
	SET_NUM(scancodes, "KP_1", SDL_SCANCODE_KP_1);
	SET_NUM(scancodes, "KP_2", SDL_SCANCODE_KP_2);
	SET_NUM(scancodes, "KP_3", SDL_SCANCODE_KP_3);
	SET_NUM(scancodes, "KP_4", SDL_SCANCODE_KP_4);
	SET_NUM(scancodes, "KP_5", SDL_SCANCODE_KP_5);
	SET_NUM(scancodes, "KP_6", SDL_SCANCODE_KP_6);
	SET_NUM(scancodes, "KP_7", SDL_SCANCODE_KP_7);
	SET_NUM(scancodes, "KP_8", SDL_SCANCODE_KP_8);
	SET_NUM(scancodes, "KP_9", SDL_SCANCODE_KP_9);
	SET_NUM(scancodes, "KP_0", SDL_SCANCODE_KP_0);
	SET_NUM(scancodes, "KP_PERIOD", SDL_SCANCODE_KP_PERIOD);
	SET_NUM(scancodes, "NONUSBACKSLASH", SDL_SCANCODE_NONUSBACKSLASH);
	SET_NUM(scancodes, "APPLICATION", SDL_SCANCODE_APPLICATION);
	SET_NUM(scancodes, "POWER", SDL_SCANCODE_POWER);
	SET_NUM(scancodes, "KP_EQUALS", SDL_SCANCODE_KP_EQUALS);
	SET_NUM(scancodes, "F13", SDL_SCANCODE_F13);
	SET_NUM(scancodes, "F14", SDL_SCANCODE_F14);
	SET_NUM(scancodes, "F15", SDL_SCANCODE_F15);
	SET_NUM(scancodes, "F16", SDL_SCANCODE_F16);
	SET_NUM(scancodes, "F17", SDL_SCANCODE_F17);
	SET_NUM(scancodes, "F18", SDL_SCANCODE_F18);
	SET_NUM(scancodes, "F19", SDL_SCANCODE_F19);
	SET_NUM(scancodes, "F20", SDL_SCANCODE_F20);
	SET_NUM(scancodes, "F21", SDL_SCANCODE_F21);
	SET_NUM(scancodes, "F22", SDL_SCANCODE_F22);
	SET_NUM(scancodes, "F23", SDL_SCANCODE_F23);
	SET_NUM(scancodes, "F24", SDL_SCANCODE_F24);
	SET_NUM(scancodes, "EXECUTE", SDL_SCANCODE_EXECUTE);
	SET_NUM(scancodes, "HELP", SDL_SCANCODE_HELP);
	SET_NUM(scancodes, "MENU", SDL_SCANCODE_MENU);
	SET_NUM(scancodes, "SELECT", SDL_SCANCODE_SELECT);
	SET_NUM(scancodes, "STOP", SDL_SCANCODE_STOP);
	SET_NUM(scancodes, "AGAIN", SDL_SCANCODE_AGAIN);
	SET_NUM(scancodes, "UNDO", SDL_SCANCODE_UNDO);
	SET_NUM(scancodes, "CUT", SDL_SCANCODE_CUT);
	SET_NUM(scancodes, "COPY", SDL_SCANCODE_COPY);
	SET_NUM(scancodes, "PASTE", SDL_SCANCODE_PASTE);
	SET_NUM(scancodes, "FIND", SDL_SCANCODE_FIND);
	SET_NUM(scancodes, "MUTE", SDL_SCANCODE_MUTE);
	SET_NUM(scancodes, "VOLUMEUP", SDL_SCANCODE_VOLUMEUP);
	SET_NUM(scancodes, "VOLUMEDOWN", SDL_SCANCODE_VOLUMEDOWN);
	SET_NUM(scancodes, "KP_COMMA", SDL_SCANCODE_KP_COMMA);
	SET_NUM(scancodes, "KP_EQUALSAS400", SDL_SCANCODE_KP_EQUALSAS400);
	SET_NUM(scancodes, "INTERNATIONAL1", SDL_SCANCODE_INTERNATIONAL1);
	SET_NUM(scancodes, "INTERNATIONAL2", SDL_SCANCODE_INTERNATIONAL2);
	SET_NUM(scancodes, "INTERNATIONAL3", SDL_SCANCODE_INTERNATIONAL3);
	SET_NUM(scancodes, "INTERNATIONAL4", SDL_SCANCODE_INTERNATIONAL4);
	SET_NUM(scancodes, "INTERNATIONAL5", SDL_SCANCODE_INTERNATIONAL5);
	SET_NUM(scancodes, "INTERNATIONAL6", SDL_SCANCODE_INTERNATIONAL6);
	SET_NUM(scancodes, "INTERNATIONAL7", SDL_SCANCODE_INTERNATIONAL7);
	SET_NUM(scancodes, "INTERNATIONAL8", SDL_SCANCODE_INTERNATIONAL8);
	SET_NUM(scancodes, "INTERNATIONAL9", SDL_SCANCODE_INTERNATIONAL9);
	SET_NUM(scancodes, "LANG1", SDL_SCANCODE_LANG1);
	SET_NUM(scancodes, "LANG2", SDL_SCANCODE_LANG2);
	SET_NUM(scancodes, "LANG3", SDL_SCANCODE_LANG3);
	SET_NUM(scancodes, "LANG4", SDL_SCANCODE_LANG4);
	SET_NUM(scancodes, "LANG5", SDL_SCANCODE_LANG5);
	SET_NUM(scancodes, "LANG6", SDL_SCANCODE_LANG6);
	SET_NUM(scancodes, "LANG7", SDL_SCANCODE_LANG7);
	SET_NUM(scancodes, "LANG8", SDL_SCANCODE_LANG8);
	SET_NUM(scancodes, "LANG9", SDL_SCANCODE_LANG9);
	SET_NUM(scancodes, "ALTERASE", SDL_SCANCODE_ALTERASE);
	SET_NUM(scancodes, "SYSREQ", SDL_SCANCODE_SYSREQ);
	SET_NUM(scancodes, "CANCEL", SDL_SCANCODE_CANCEL);
	SET_NUM(scancodes, "CLEAR", SDL_SCANCODE_CLEAR);
	SET_NUM(scancodes, "PRIOR", SDL_SCANCODE_PRIOR);
	SET_NUM(scancodes, "RETURN2", SDL_SCANCODE_RETURN2);
	SET_NUM(scancodes, "SEPARATOR", SDL_SCANCODE_SEPARATOR);
	SET_NUM(scancodes, "OUT", SDL_SCANCODE_OUT);
	SET_NUM(scancodes, "OPER", SDL_SCANCODE_OPER);
	SET_NUM(scancodes, "CLEARAGAIN", SDL_SCANCODE_CLEARAGAIN);
	SET_NUM(scancodes, "CRSEL", SDL_SCANCODE_CRSEL);
	SET_NUM(scancodes, "EXSEL", SDL_SCANCODE_EXSEL);
	SET_NUM(scancodes, "KP_00", SDL_SCANCODE_KP_00);
	SET_NUM(scancodes, "KP_000", SDL_SCANCODE_KP_000);
	SET_NUM(scancodes, "THOUSANDSSEPARATOR", SDL_SCANCODE_THOUSANDSSEPARATOR);
	SET_NUM(scancodes, "DECIMALSEPARATOR", SDL_SCANCODE_DECIMALSEPARATOR);
	SET_NUM(scancodes, "CURRENCYUNIT", SDL_SCANCODE_CURRENCYUNIT);
	SET_NUM(scancodes, "CURRENCYSUBUNIT", SDL_SCANCODE_CURRENCYSUBUNIT);
	SET_NUM(scancodes, "KP_LEFTPAREN", SDL_SCANCODE_KP_LEFTPAREN);
	SET_NUM(scancodes, "KP_RIGHTPAREN", SDL_SCANCODE_KP_RIGHTPAREN);
	SET_NUM(scancodes, "KP_LEFTBRACE", SDL_SCANCODE_KP_LEFTBRACE);
	SET_NUM(scancodes, "KP_RIGHTBRACE", SDL_SCANCODE_KP_RIGHTBRACE);
	SET_NUM(scancodes, "KP_TAB", SDL_SCANCODE_KP_TAB);
	SET_NUM(scancodes, "KP_BACKSPACE", SDL_SCANCODE_KP_BACKSPACE);
	SET_NUM(scancodes, "KP_A", SDL_SCANCODE_KP_A);
	SET_NUM(scancodes, "KP_B", SDL_SCANCODE_KP_B);
	SET_NUM(scancodes, "KP_C", SDL_SCANCODE_KP_C);
	SET_NUM(scancodes, "KP_D", SDL_SCANCODE_KP_D);
	SET_NUM(scancodes, "KP_E", SDL_SCANCODE_KP_E);
	SET_NUM(scancodes, "KP_F", SDL_SCANCODE_KP_F);
	SET_NUM(scancodes, "KP_XOR", SDL_SCANCODE_KP_XOR);
	SET_NUM(scancodes, "KP_POWER", SDL_SCANCODE_KP_POWER);
	SET_NUM(scancodes, "KP_PERCENT", SDL_SCANCODE_KP_PERCENT);
	SET_NUM(scancodes, "KP_LESS", SDL_SCANCODE_KP_LESS);
	SET_NUM(scancodes, "KP_GREATER", SDL_SCANCODE_KP_GREATER);
	SET_NUM(scancodes, "KP_AMPERSAND", SDL_SCANCODE_KP_AMPERSAND);
	SET_NUM(scancodes, "KP_DBLAMPERSAND", SDL_SCANCODE_KP_DBLAMPERSAND);
	SET_NUM(scancodes, "KP_VERTICALBAR", SDL_SCANCODE_KP_VERTICALBAR);
	SET_NUM(scancodes, "KP_DBLVERTICALBAR", SDL_SCANCODE_KP_DBLVERTICALBAR);
	SET_NUM(scancodes, "KP_COLON", SDL_SCANCODE_KP_COLON);
	SET_NUM(scancodes, "KP_HASH", SDL_SCANCODE_KP_HASH);
	SET_NUM(scancodes, "KP_SPACE", SDL_SCANCODE_KP_SPACE);
	SET_NUM(scancodes, "KP_AT", SDL_SCANCODE_KP_AT);
	SET_NUM(scancodes, "KP_EXCLAM", SDL_SCANCODE_KP_EXCLAM);
	SET_NUM(scancodes, "KP_MEMSTORE", SDL_SCANCODE_KP_MEMSTORE);
	SET_NUM(scancodes, "KP_MEMRECALL", SDL_SCANCODE_KP_MEMRECALL);
	SET_NUM(scancodes, "KP_MEMCLEAR", SDL_SCANCODE_KP_MEMCLEAR);
	SET_NUM(scancodes, "KP_MEMADD", SDL_SCANCODE_KP_MEMADD);
	SET_NUM(scancodes, "KP_MEMSUBTRACT", SDL_SCANCODE_KP_MEMSUBTRACT);
	SET_NUM(scancodes, "KP_MEMMULTIPLY", SDL_SCANCODE_KP_MEMMULTIPLY);
	SET_NUM(scancodes, "KP_MEMDIVIDE", SDL_SCANCODE_KP_MEMDIVIDE);
	SET_NUM(scancodes, "KP_PLUSMINUS", SDL_SCANCODE_KP_PLUSMINUS);
	SET_NUM(scancodes, "KP_CLEAR", SDL_SCANCODE_KP_CLEAR);
	SET_NUM(scancodes, "KP_CLEARENTRY", SDL_SCANCODE_KP_CLEARENTRY);
	SET_NUM(scancodes, "KP_BINARY", SDL_SCANCODE_KP_BINARY);
	SET_NUM(scancodes, "KP_OCTAL", SDL_SCANCODE_KP_OCTAL);
	SET_NUM(scancodes, "KP_DECIMAL", SDL_SCANCODE_KP_DECIMAL);
	SET_NUM(scancodes, "KP_HEXADECIMAL", SDL_SCANCODE_KP_HEXADECIMAL);
	SET_NUM(scancodes, "LCTRL", SDL_SCANCODE_LCTRL);
	SET_NUM(scancodes, "LSHIFT", SDL_SCANCODE_LSHIFT);
	SET_NUM(scancodes, "LALT", SDL_SCANCODE_LALT);
	SET_NUM(scancodes, "LGUI", SDL_SCANCODE_LGUI);
	SET_NUM(scancodes, "RCTRL", SDL_SCANCODE_RCTRL);
	SET_NUM(scancodes, "RSHIFT", SDL_SCANCODE_RSHIFT);
	SET_NUM(scancodes, "RALT", SDL_SCANCODE_RALT);
	SET_NUM(scancodes, "RGUI", SDL_SCANCODE_RGUI);
	SET_NUM(scancodes, "MODE", SDL_SCANCODE_MODE);
	SET_NUM(scancodes, "AUDIONEXT", SDL_SCANCODE_AUDIONEXT);
	SET_NUM(scancodes, "AUDIOPREV", SDL_SCANCODE_AUDIOPREV);
	SET_NUM(scancodes, "AUDIOSTOP", SDL_SCANCODE_AUDIOSTOP);
	SET_NUM(scancodes, "AUDIOPLAY", SDL_SCANCODE_AUDIOPLAY);
	SET_NUM(scancodes, "AUDIOMUTE", SDL_SCANCODE_AUDIOMUTE);
	SET_NUM(scancodes, "MEDIASELECT", SDL_SCANCODE_MEDIASELECT);
	SET_NUM(scancodes, "WWW", SDL_SCANCODE_WWW);
	SET_NUM(scancodes, "MAIL", SDL_SCANCODE_MAIL);
	SET_NUM(scancodes, "CALCULATOR", SDL_SCANCODE_CALCULATOR);
	SET_NUM(scancodes, "COMPUTER", SDL_SCANCODE_COMPUTER);
	SET_NUM(scancodes, "AC_SEARCH", SDL_SCANCODE_AC_SEARCH);
	SET_NUM(scancodes, "AC_HOME", SDL_SCANCODE_AC_HOME);
	SET_NUM(scancodes, "AC_BACK", SDL_SCANCODE_AC_BACK);
	SET_NUM(scancodes, "AC_FORWARD", SDL_SCANCODE_AC_FORWARD);
	SET_NUM(scancodes, "AC_STOP", SDL_SCANCODE_AC_STOP);
	SET_NUM(scancodes, "AC_REFRESH", SDL_SCANCODE_AC_REFRESH);
	SET_NUM(scancodes, "AC_BOOKMARKS", SDL_SCANCODE_AC_BOOKMARKS);
	SET_NUM(scancodes, "BRIGHTNESSDOWN", SDL_SCANCODE_BRIGHTNESSDOWN);
	SET_NUM(scancodes, "BRIGHTNESSUP", SDL_SCANCODE_BRIGHTNESSUP);
	SET_NUM(scancodes, "DISPLAYSWITCH", SDL_SCANCODE_DISPLAYSWITCH);
	SET_NUM(scancodes, "KBDILLUMTOGGLE", SDL_SCANCODE_KBDILLUMTOGGLE);
	SET_NUM(scancodes, "KBDILLUMDOWN", SDL_SCANCODE_KBDILLUMDOWN);
	SET_NUM(scancodes, "KBDILLUMUP", SDL_SCANCODE_KBDILLUMUP);
	SET_NUM(scancodes, "EJECT", SDL_SCANCODE_EJECT);
	SET_NUM(scancodes, "SLEEP", SDL_SCANCODE_SLEEP);
	SET_NUM(scancodes, "APP1", SDL_SCANCODE_APP1);
	SET_NUM(scancodes, "APP2", SDL_SCANCODE_APP2);
	SET_NUM(scancodes, "AUDIOREWIND", SDL_SCANCODE_AUDIOREWIND);
	SET_NUM(scancodes, "AUDIOFASTFORWARD", SDL_SCANCODE_AUDIOFASTFORWARD);

	return nullptr;
}

ErrorMessage *
enum_getMouseButtons (Variant & buttons)
{
	MAKE_MAP(buttons);

	SET_NUM(buttons, "LEFT", SDL_BUTTON_LEFT);
	SET_NUM(buttons, "MIDDLE", SDL_BUTTON_MIDDLE);
	SET_NUM(buttons, "RIGHT", SDL_BUTTON_RIGHT);

	return nullptr;
}

ErrorMessage *
enum_getCursors (Variant & cursors)
{
	MAKE_MAP(cursors);

	SET_NUM(cursors, "arrow", SDL_SYSTEM_CURSOR_ARROW);
	SET_NUM(cursors, "ibeam", SDL_SYSTEM_CURSOR_IBEAM);
	SET_NUM(cursors, "wait", SDL_SYSTEM_CURSOR_WAIT);
	SET_NUM(cursors, "crosshair", SDL_SYSTEM_CURSOR_CROSSHAIR);
	SET_NUM(cursors, "waitarrow", SDL_SYSTEM_CURSOR_WAITARROW);
	SET_NUM(cursors, "sizenwse", SDL_SYSTEM_CURSOR_SIZENWSE);
	SET_NUM(cursors, "sizenesw", SDL_SYSTEM_CURSOR_SIZENESW);
	SET_NUM(cursors, "sizewe", SDL_SYSTEM_CURSOR_SIZEWE);
	SET_NUM(cursors, "sizens", SDL_SYSTEM_CURSOR_SIZENS);
	SET_NUM(cursors, "sizeall", SDL_SYSTEM_CURSOR_SIZEALL);
	SET_NUM(cursors, "no", SDL_SYSTEM_CURSOR_NO);
	SET_NUM(cursors, "hand", SDL_SYSTEM_CURSOR_HAND);

	return nullptr;
}

ErrorMessage *
enum_getHatPositions (Variant & positions)
{
	MAKE_MAP(positions);

	SET_NUM(positions, "centered", SDL_HAT_CENTERED);
	SET_NUM(positions, "up", SDL_HAT_UP);
	SET_NUM(positions, "right", SDL_HAT_RIGHT);
	SET_NUM(positions, "down", SDL_HAT_DOWN);
	SET_NUM(positions, "left", SDL_HAT_LEFT);
	SET_NUM(positions, "rightup", SDL_HAT_RIGHTUP);
	SET_NUM(positions, "rightdown", SDL_HAT_RIGHTDOWN);
	SET_NUM(positions, "leftup", SDL_HAT_LEFTUP);
	SET_NUM(positions, "leftdown", SDL_HAT_LEFTDOWN);

	return nullptr;
}

ErrorMessage *
enum_getPowerLevels (Variant & levels)
{
	MAKE_MAP(levels);

	SET_NUM(levels, "unknown", SDL_JOYSTICK_POWER_UNKNOWN);
	SET_NUM(levels, "empty", SDL_JOYSTICK_POWER_EMPTY);
	SET_NUM(levels, "low", SDL_JOYSTICK_POWER_LOW);
	SET_NUM(levels, "medium", SDL_JOYSTICK_POWER_MEDIUM);
	SET_NUM(levels, "full", SDL_JOYSTICK_POWER_FULL);
	SET_NUM(levels, "wired", SDL_JOYSTICK_POWER_WIRED);
	SET_NUM(levels, "max", SDL_JOYSTICK_POWER_MAX);

	return nullptr;
}

ErrorMessage *
enum_getJoystickTypes (Variant & types)
{
	MAKE_MAP(types);

	SET_NUM(types, "unknown", SDL_JOYSTICK_TYPE_UNKNOWN);
	SET_NUM(types, "gamecontroller", SDL_JOYSTICK_TYPE_GAMECONTROLLER);
	SET_NUM(types, "wheel", SDL_JOYSTICK_TYPE_WHEEL);
	SET_NUM(types, "arcadestick", SDL_JOYSTICK_TYPE_ARCADE_STICK);
	SET_NUM(types, "flightstick", SDL_JOYSTICK_TYPE_FLIGHT_STICK);
	SET_NUM(types, "dancepad", SDL_JOYSTICK_TYPE_DANCE_PAD);
	SET_NUM(types, "guitar", SDL_JOYSTICK_TYPE_GUITAR);
	SET_NUM(types, "drumkit", SDL_JOYSTICK_TYPE_DRUM_KIT);
	SET_NUM(types, "arcadepad", SDL_JOYSTICK_TYPE_ARCADE_PAD);
	SET_NUM(types, "throttle", SDL_JOYSTICK_TYPE_THROTTLE);

	return nullptr;
}

ErrorMessage *
enum_getControllerAxes (Variant & axes)
{
	MAKE_MAP(axes);

	SET_NUM(axes, "leftStickX", SDL_CONTROLLER_AXIS_LEFTX);
	SET_NUM(axes, "leftStickY", SDL_CONTROLLER_AXIS_LEFTY);
	SET_NUM(axes, "rightStickX", SDL_CONTROLLER_AXIS_RIGHTX);
	SET_NUM(axes, "rightStickY", SDL_CONTROLLER_AXIS_RIGHTY);
	SET_NUM(axes, "leftTrigger", SDL_CONTROLLER_AXIS_TRIGGERLEFT);
	SET_NUM(axes, "rightTrigger", SDL_CONTROLLER_AXIS_TRIGGERRIGHT);

	return nullptr;
}

ErrorMessage *
enum_getControllerButtons (Variant & buttons)
{
	MAKE_MAP(buttons);

	SET_NUM(buttons, "dpadLeft", SDL_CONTROLLER_BUTTON_DPAD_LEFT);
	SET_NUM(buttons, "dpadRight", SDL_CONTROLLER_BUTTON_DPAD_RIGHT);
	SET_NUM(buttons, "dpadUp", SDL_CONTROLLER_BUTTON_DPAD_UP);
	SET_NUM(buttons, "dpadDown", SDL_CONTROLLER_BUTTON_DPAD_DOWN);
	SET_NUM(buttons, "a", SDL_CONTROLLER_BUTTON_A);
	SET_NUM(buttons, "b", SDL_CONTROLLER_BUTTON_B);
	SET_NUM(buttons, "x", SDL_CONTROLLER_BUTTON_X);
	SET_NUM(buttons, "y", SDL_CONTROLLER_BUTTON_Y);
	SET_NUM(buttons, "guide", SDL_CONTROLLER_BUTTON_GUIDE);
	SET_NUM(buttons, "back", SDL_CONTROLLER_BUTTON_BACK);
	SET_NUM(buttons, "start", SDL_CONTROLLER_BUTTON_START);
	SET_NUM(buttons, "leftStick", SDL_CONTROLLER_BUTTON_LEFTSTICK);
	SET_NUM(buttons, "rightStick", SDL_CONTROLLER_BUTTON_RIGHTSTICK);
	SET_NUM(buttons, "leftShoulder", SDL_CONTROLLER_BUTTON_LEFTSHOULDER);
	SET_NUM(buttons, "rightShoulder", SDL_CONTROLLER_BUTTON_RIGHTSHOULDER);
	SET_NUM(buttons, "paddle1", SDL_CONTROLLER_BUTTON_PADDLE1);
	SET_NUM(buttons, "paddle2", SDL_CONTROLLER_BUTTON_PADDLE2);
	SET_NUM(buttons, "paddle3", SDL_CONTROLLER_BUTTON_PADDLE3);
	SET_NUM(buttons, "paddle4", SDL_CONTROLLER_BUTTON_PADDLE4);

	return nullptr;
}

ErrorMessage *
enum_getSensorTypes (Variant & types)
{
	MAKE_MAP(types);

	SET_NUM(types, "unknown", SDL_SENSOR_UNKNOWN);
	SET_NUM(types, "accelerometer", SDL_SENSOR_ACCEL);
	SET_NUM(types, "gyroscope", SDL_SENSOR_GYRO);
	SET_NUM(types, "accelerometerLeft", SDL_SENSOR_ACCEL_L);
	SET_NUM(types, "gyroscopeLeft", SDL_SENSOR_GYRO_L);
	SET_NUM(types, "accelerometerRight", SDL_SENSOR_ACCEL_R);
	SET_NUM(types, "gyroscopeRight", SDL_SENSOR_GYRO_R);

	return nullptr;
}

ErrorMessage *
enum_getPowerStates (Variant & states)
{
	MAKE_MAP(states);

	SET_NUM(states, "unknown", SDL_POWERSTATE_UNKNOWN);
	SET_NUM(states, "noBattery", SDL_POWERSTATE_NO_BATTERY);
	SET_NUM(states, "battery", SDL_POWERSTATE_ON_BATTERY);
	SET_NUM(states, "charging", SDL_POWERSTATE_CHARGING);
	SET_NUM(states, "charged", SDL_POWERSTATE_CHARGED);

	return nullptr;
}



ErrorMessage *
initialize (Variant & object)
{
	// Hints
	{
		SDL_SetHint(SDL_HINT_FRAMEBUFFER_ACCELERATION, "0");
	}

	MAKE_MAP(object);

	// Init
	{
		int subsystems = 0
			| SDL_INIT_EVENTS
			| SDL_INIT_JOYSTICK
			| SDL_INIT_GAMECONTROLLER
			| SDL_INIT_HAPTIC
			| SDL_INIT_SENSOR;
		if (SDL_Init(subsystems) != 0) {
			RETURN_ERROR("SDL_Init() error: %s\n", SDL_GetError());
		}
	}

	// Version
	{
		Variant version, compile, runtime;
		MAKE_MAP(version);
		MAKE_MAP(compile);
		MAKE_MAP(runtime);

		SDL_version compile_version;
		SDL_VERSION(&compile_version);
		SET_NUM(compile, "major", compile_version.major);
		SET_NUM(compile, "minor", compile_version.minor);
		SET_NUM(compile, "patch", compile_version.patch);
		SET_MAP(version, "compile", compile);

		SDL_version runtime_version;
		SDL_GetVersion(&runtime_version);
		SET_NUM(runtime, "major", runtime_version.major);
		SET_NUM(runtime, "minor", runtime_version.minor);
		SET_NUM(runtime, "patch", runtime_version.patch);
		SET_MAP(version, "runtime", runtime);

		SET_MAP(object, "version", version);
	}

	{
		const char * platform_name = SDL_GetPlatform();
		SET_STRING(object, "platform", platform_name);
	}

	Variant drivers, video, audio;
	MAKE_MAP(drivers);
	MAKE_MAP(video);
	MAKE_MAP(audio);

	// Available Video Drivers
	{
		Variant list;
		MAKE_LIST(list);

		int num_drivers = SDL_GetNumVideoDrivers();
		if (num_drivers < 0) {
			RETURN_ERROR("SDL_GetNumVideoDrivers() error: %s\n", SDL_GetError());
		}

		const char * driver_name;
		Variant name;

		for (int i = 0; i < num_drivers; i ++) {
			driver_name = SDL_GetVideoDriver(i);
			if(driver_name == nullptr) {
				RETURN_ERROR("SDL_GetVideoDriver(%d) error: %s\n", i, SDL_GetError());
			}
			MAKE_STRING(name, driver_name);
			APPEND(list, name);
		}

		SET_LIST(video, "all", list);
	}

	// Selected Video Driver
	{
		if (SDL_InitSubSystem(SDL_INIT_VIDEO) == 0) {
			const char * driver_name = SDL_GetCurrentVideoDriver();
			if(driver_name == nullptr) {
				RETURN_ERROR("SDL_GetCurrentVideoDriver() error: %s\n", SDL_GetError());
			}

			SET_STRING(video, "current", driver_name);
		} else {
			SET_NULL(video, "current");
		}
	}

	// Available Audio Drivers
	{
		int num_drivers = SDL_GetNumAudioDrivers();
		if (num_drivers < 0) {
			RETURN_ERROR("SDL_GetNumAudioDrivers() error: %s\n", SDL_GetError());
		}

		Variant list;
		MAKE_LIST(list);

		const char * driver_name;
		Variant name;

		for (int i = 0; i < num_drivers; i ++) {
			driver_name = SDL_GetAudioDriver(i);
			if(driver_name == nullptr) {
				RETURN_ERROR("SDL_GetAudioDriver(%d) error: %s\n", i, SDL_GetError());
			}

			MAKE_STRING(name, driver_name);
			APPEND(list, name);
		}

		SET_LIST(audio, "all", list);
	}

	// Selected Audio Driver
	if (SDL_InitSubSystem(SDL_INIT_AUDIO) == 0) {
		const char * driver_name = SDL_GetCurrentAudioDriver();
		if(driver_name == nullptr) {
			RETURN_ERROR("SDL_GetCurrentAudioDriver() error: %s\n", SDL_GetError());
		}

		SET_STRING(audio, "current", driver_name);
	} else {
		SET_NULL(audio, "current");
	}

	SET_MAP(drivers, "video", video);
	SET_MAP(drivers, "audio", audio);
	SET_MAP(object, "drivers", drivers);

	SDL_ClearError();
	no_error = SDL_GetError();

	keys = SDL_GetKeyboardState(&num_keys);
	SDL_StartTextInput();


#if defined(__MACOSX__)
	reenableInertialScrolling();
#endif

	return nullptr;
}


ErrorMessage *
_windowUpdateTexture(
	SDL_Window * window,
	SDL_Renderer * renderer,
	int pixel_width, int pixel_height,
	SDL_Texture ** texture_dst
) {
	int window_id = SDL_GetWindowID(window);

	int format = SDL_GetWindowPixelFormat(window);
	SDL_Texture * texture = SDL_CreateTexture(renderer, format, SDL_TEXTUREACCESS_STREAMING, pixel_width, pixel_height);
	if (texture == nullptr) {
		RETURN_ERROR("SDL_CreateTexture(%d) error: %s\n", window_id, SDL_GetError());
	}

	if (SDL_SetTextureBlendMode(texture, SDL_BLENDMODE_NONE)) {
		RETURN_ERROR("SDL_SetTextureBlendMode(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_Texture * old_texture = (SDL_Texture *) SDL_SetWindowData(window, "texture", texture);
	if (old_texture != nullptr) { SDL_DestroyTexture(old_texture); }

	if (texture_dst != nullptr) { *texture_dst = texture; }

	return nullptr;
}

ErrorMessage *
_windowUpdateRenderer(
	SDL_Window * window,
	bool * accelerated,
	bool * vsync
) {
	int window_id = SDL_GetWindowID(window);

	SDL_Renderer * old_renderer = SDL_GetRenderer(window);
	if (old_renderer != nullptr) {
		SDL_DestroyRenderer(old_renderer);
		SDL_SetWindowData(window, "texture", nullptr);
	}

	int renderer_flags = 0
		| (*accelerated ? SDL_RENDERER_ACCELERATED : SDL_RENDERER_SOFTWARE)
		| (*accelerated && *vsync ? SDL_RENDERER_PRESENTVSYNC : 0);

	SDL_Renderer * renderer = SDL_CreateRenderer(window, -1, renderer_flags);
	if (renderer == nullptr) {
		RETURN_ERROR("SDL_CreateRenderer(%d, %d) error: %s\n", window_id, renderer_flags, SDL_GetError());
	}

	SDL_RendererInfo info;
	SDL_GetRendererInfo(renderer, &info);

	*accelerated = info.flags & SDL_RENDERER_ACCELERATED;
	*vsync = info.flags & SDL_RENDERER_PRESENTVSYNC;

	int pixel_width, pixel_height;
	SDL_GetWindowSizeInPixels(window, &pixel_width, &pixel_height);

	ErrorMessage * error = _windowUpdateTexture(window, renderer, pixel_width, pixel_height, nullptr);
	if (error != nullptr) { return error; }

	return nullptr;
}


ErrorMessage *
_controllerGetState (SDL_GameController * controller, Variant & object)
{
	{
		Variant axes;
		MAKE_MAP(axes);

		SET_NUM(axes, "leftStickX", _joystickMapAxis(SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_LEFTX)));
		SET_NUM(axes, "leftStickY", _joystickMapAxis(SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_LEFTY)));
		SET_NUM(axes, "rightStickX", _joystickMapAxis(SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_RIGHTX)));
		SET_NUM(axes, "rightStickY", _joystickMapAxis(SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_RIGHTY)));
		SET_NUM(axes, "leftTrigger", _joystickMapAxis(SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_TRIGGERLEFT)));
		SET_NUM(axes, "rightTrigger", _joystickMapAxis(SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_TRIGGERRIGHT)));

		SET_MAP(object, "axes", axes);
	}

	{
		Variant buttons;
		MAKE_MAP(buttons);

		SET_BOOL(buttons, "dpadLeft", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_LEFT));
		SET_BOOL(buttons, "dpadRight", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_RIGHT));
		SET_BOOL(buttons, "dpadUp", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_UP));
		SET_BOOL(buttons, "dpadDown", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_DOWN));
		SET_BOOL(buttons, "a", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_A));
		SET_BOOL(buttons, "b", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_B));
		SET_BOOL(buttons, "x", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_X));
		SET_BOOL(buttons, "y", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_Y));
		SET_BOOL(buttons, "guide", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_GUIDE));
		SET_BOOL(buttons, "back", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_BACK));
		SET_BOOL(buttons, "start", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_START));
		SET_BOOL(buttons, "leftStick", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_LEFTSTICK));
		SET_BOOL(buttons, "rightStick", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_RIGHTSTICK));
		SET_BOOL(buttons, "leftShoulder", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_LEFTSHOULDER));
		SET_BOOL(buttons, "rightShoulder", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_RIGHTSHOULDER));
		SET_BOOL(buttons, "paddle1", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_PADDLE1));
		SET_BOOL(buttons, "paddle2", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_PADDLE2));
		SET_BOOL(buttons, "paddle3", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_PADDLE3));
		SET_BOOL(buttons, "paddle4", SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_PADDLE4));

		SET_MAP(object, "buttons", buttons);
	}

	return nullptr;
}


ErrorMessage *
packageEvent (const SDL_Event & event, Variant & object)
{
	if (allocated_drop_file != nullptr) {
		SDL_free(allocated_drop_file);
		allocated_drop_file = nullptr;
	}
	if (allocated_clipboard != nullptr) {
		SDL_free(allocated_clipboard);
		allocated_clipboard = nullptr;
	}
	while (allocated_guid_strings != nullptr) {
		AllocString * tmp = allocated_guid_strings;
		allocated_guid_strings = allocated_guid_strings->next;
		free(tmp->buffer);
		free(tmp);
	}

	MAKE_MAP(object);

	Variant value;
	switch (event.type) {
		case SDL_DISPLAYEVENT: {
			SET_NUM(object, "family", (int) EventFamily::DISPLAY);
			SET_NUM(object, "displayIndex", event.display.display);

			switch (event.display.event) {
				case SDL_DISPLAYEVENT_CONNECTED: { SET_NUM(object, "type", (int) EventType::DISPLAY_ADD); break; }
				case SDL_DISPLAYEVENT_DISCONNECTED: { SET_NUM(object, "type", (int) EventType::DISPLAY_REMOVE); break; }
				case SDL_DISPLAYEVENT_ORIENTATION: { SET_NUM(object, "type", (int) EventType::DISPLAY_ORIENT); break; }
			}
			break;
		}

		case SDL_WINDOWEVENT: {
			SET_NUM(object, "family", (int) EventFamily::WINDOW);
			SET_NUM(object, "windowId", event.window.windowID);

			switch (event.window.event) {
				case SDL_WINDOWEVENT_SHOWN: { SET_NUM(object, "type", (int) EventType::SHOW); break; }
				case SDL_WINDOWEVENT_HIDDEN: { SET_NUM(object, "type", (int) EventType::HIDE); break; }
				case SDL_WINDOWEVENT_EXPOSED: { SET_NUM(object, "type", (int) EventType::EXPOSE); break; }
				case SDL_WINDOWEVENT_MOVED: {
					SET_NUM(object, "type", (int) EventType::MOVE);
					SET_NUM(object, "x", event.window.data1);
					SET_NUM(object, "y", event.window.data2);
					break;
				}
				case SDL_WINDOWEVENT_SIZE_CHANGED: {
					SDL_Window * window = SDL_GetWindowFromID(event.window.windowID);
					if (window == nullptr) {
						RETURN_ERROR("SDL_CreateWindow() error: %s\n", SDL_GetError());
					}

					int pixel_width, pixel_height;
					SDL_GetWindowSizeInPixels(window, &pixel_width, &pixel_height);

					SET_NUM(object, "type", (int) EventType::RESIZE);
					SET_NUM(object, "width", event.window.data1);
					SET_NUM(object, "height", event.window.data2);
					SET_NUM(object, "pixelWidth", pixel_width);
					SET_NUM(object, "pixelHeight", pixel_height);
					break;
				}
				case SDL_WINDOWEVENT_MINIMIZED: { SET_NUM(object, "type", (int) EventType::MINIMIZE); break; }
				case SDL_WINDOWEVENT_MAXIMIZED: { SET_NUM(object, "type", (int) EventType::MAXIMIZE); break; }
				case SDL_WINDOWEVENT_RESTORED: { SET_NUM(object, "type", (int) EventType::RESTORE); break; }
				case SDL_WINDOWEVENT_FOCUS_GAINED: { SET_NUM(object, "type", (int) EventType::FOCUS); break; }
				case SDL_WINDOWEVENT_FOCUS_LOST: { SET_NUM(object, "type", (int) EventType::BLUR); break; }
				case SDL_WINDOWEVENT_ENTER: { SET_NUM(object, "type", (int) EventType::HOVER); break; }
				case SDL_WINDOWEVENT_LEAVE: { SET_NUM(object, "type", (int) EventType::LEAVE); break; }
				case SDL_WINDOWEVENT_CLOSE: { SET_NUM(object, "type", (int) EventType::CLOSE); break; }
			}
			break;
		}

		case SDL_DROPBEGIN:
		case SDL_DROPCOMPLETE: {
			SET_NUM(object, "family", (int) EventFamily::DROP);
			SET_NUM(object, "type", (int) (event.type == SDL_DROPBEGIN
				? EventType::DROP_BEGIN
				: EventType::DROP_COMPLETE));
			SET_NUM(object, "windowId", event.drop.windowID);
			break;
		}
		case SDL_DROPFILE:
		case SDL_DROPTEXT: {
			SET_NUM(object, "family", (int) EventFamily::DROP);
			bool is_file = event.type == SDL_DROPFILE;
			SET_NUM(object, "type", (int) (is_file
				? EventType::DROP_FILE
				: EventType::DROP_TEXT));
			SET_NUM(object, "windowId", event.drop.windowID);

			allocated_drop_file = event.drop.file;
			SET_STRING(object, is_file ? "file" : "text", allocated_drop_file);
			break;
		}

		case SDL_KEYDOWN:
		case SDL_KEYUP: {
			SET_NUM(object, "family", (int) EventFamily::KEYBOARD);
			SET_NUM(object, "type", (int) (event.type == SDL_KEYDOWN
				? EventType::KEY_DOWN
				: EventType::KEY_UP));
			SET_NUM(object, "windowId", event.key.windowID);

			SDL_Keysym symbol = event.key.keysym;
			SET_NUM(object, "scancode", symbol.scancode);

			const char * name = SDL_GetKeyName(symbol.sym);
			if (name[0] != '\0') {
				SET_STRING(object, "key", name);
			}
			else {
				SET_NULL(object, "key");
			}

			if (event.type == SDL_KEYDOWN) {
				SET_BOOL(object, "repeat", !!event.key.repeat);
			}

			SET_BOOL(object, "alt", !!(symbol.mod & KMOD_ALT));
			SET_BOOL(object, "ctrl", !!(symbol.mod & KMOD_CTRL));
			SET_BOOL(object, "shift", !!(symbol.mod & KMOD_SHIFT));
			SET_BOOL(object, "super", !!(symbol.mod & KMOD_GUI));
			SET_BOOL(object, "altgr", !!(symbol.mod & KMOD_MODE));
			SET_BOOL(object, "numlock", !!(symbol.mod & KMOD_NUM));
			SET_BOOL(object, "capslock", !!(symbol.mod & KMOD_CAPS));
			break;
		}

		case SDL_TEXTINPUT: {
			SET_NUM(object, "family", (int) EventFamily::TEXT);
			SET_NUM(object, "type", (int) EventType::TEXT_INPUT);
			SET_NUM(object, "windowId", event.text.windowID);
			strcpy(text_input, event.text.text);
			SET_STRING(object, "text", text_input);
			break ;
		}

		case SDL_MOUSEMOTION: {
			SET_NUM(object, "family", (int) EventFamily::MOUSE);
			SET_NUM(object, "type", (int) EventType::MOUSE_MOVE);
			SET_NUM(object, "windowId", event.motion.windowID);
			SET_BOOL(object, "touch", event.motion.which == SDL_TOUCH_MOUSEID);
			SET_NUM(object, "x", event.motion.x);
			SET_NUM(object, "y", event.motion.y);
			break;
		}
		case SDL_MOUSEBUTTONDOWN:
		case SDL_MOUSEBUTTONUP: {
			SET_NUM(object, "family", (int) EventFamily::MOUSE);
			SET_NUM(object, "type", (int) (event.type == SDL_MOUSEBUTTONDOWN
				? EventType::MOUSE_BUTTON_DOWN
				: EventType::MOUSE_BUTTON_UP));
			SET_NUM(object, "windowId", event.button.windowID);
			SET_BOOL(object, "touch", event.button.which == SDL_TOUCH_MOUSEID);
			SET_NUM(object, "button", event.button.button);
			SET_NUM(object, "x", event.button.x);
			SET_NUM(object, "y", event.button.y);
			break;
		}
		case SDL_MOUSEWHEEL: {
			SET_NUM(object, "family", (int) EventFamily::MOUSE);
			SET_NUM(object, "type", (int) EventType::MOUSE_WHEEL);
			SET_NUM(object, "windowId", event.wheel.windowID);
			SET_BOOL(object, "touch", event.wheel.which == SDL_TOUCH_MOUSEID);

			int x, y;
			SDL_GetMouseState(&x, &y);
			SET_NUM(object, "x", x);
			SET_NUM(object, "y", y);

			SET_NUM(object, "dx", event.wheel.x);
			SET_NUM(object, "dy", event.wheel.y);
			SET_BOOL(object, "flipped", event.wheel.direction);
			break;
		}

		case SDL_JOYDEVICEADDED: {
			SET_NUM(object, "family", (int) EventFamily::JOYSTICK_DEVICE);
			SET_NUM(object, "type", (int) EventType::DEVICE_ADD);

			Variant devices;
			ErrorMessage * error = joystick_getDevices(devices);
			if (error != nullptr) { return error; }
			SET_LIST(object, "devices", devices);
			break;
		}
		case SDL_JOYDEVICEREMOVED: {
			SET_NUM(object, "family", (int) EventFamily::JOYSTICK_DEVICE);
			SET_NUM(object, "type", (int) EventType::DEVICE_REMOVE);
			SET_NUM(object, "joystickId", event.jdevice.which);

			Variant devices;
			ErrorMessage * error = joystick_getDevices(devices);
			if (error != nullptr) { return error; }
			SET_LIST(object, "devices", devices);
			break;
		}

		case SDL_JOYAXISMOTION: {
			SET_NUM(object, "family", (int) EventFamily::JOYSTICK);
			SET_NUM(object, "type", (int) EventType::AXIS_MOTION);
			SET_NUM(object, "joystickId", event.jaxis.which);
			SET_NUM(object, "axis", event.jaxis.axis);
			SET_NUM(object, "value", _joystickMapAxis(event.jaxis.value));
			break ;
		}
		case SDL_JOYBALLMOTION: {
			SET_NUM(object, "family", (int) EventFamily::JOYSTICK);
			SET_NUM(object, "type", (int) EventType::BALL_MOTION);
			SET_NUM(object, "joystickId", event.jball.which);
			SET_NUM(object, "ball", event.jball.ball);
			SET_NUM(object, "x", event.jball.xrel);
			SET_NUM(object, "y", event.jball.yrel);
			break ;
		}
		case SDL_JOYBUTTONDOWN:
		case SDL_JOYBUTTONUP: {
			SET_NUM(object, "family", (int) EventFamily::JOYSTICK);
			SET_NUM(object, "type", (int) (event.type == SDL_JOYBUTTONDOWN
				? EventType::BUTTON_DOWN
				: EventType::BUTTON_UP));
			SET_NUM(object, "joystickId", event.jbutton.which);
			SET_NUM(object, "button", event.jbutton.button);
			break ;
		}
		case SDL_JOYHATMOTION: {
			SET_NUM(object, "family", (int) EventFamily::JOYSTICK);
			SET_NUM(object, "type", (int) EventType::HAT_MOTION);
			SET_NUM(object, "joystickId", event.jhat.which);
			SET_NUM(object, "hat", event.jhat.hat);
			SET_NUM(object, "value", event.jhat.value);
			break ;
		}

		case SDL_CONTROLLERDEVICEREMAPPED: {
			SET_NUM(object, "family", (int) EventFamily::CONTROLLER);
			SET_NUM(object, "type", (int) EventType::REMAP);
			SDL_JoystickID controllerId = event.cdevice.which;
			SET_NUM(object, "controllerId", controllerId);

			SDL_GameController * controller = SDL_GameControllerFromInstanceID(controllerId);
			if (controller != nullptr) {
				ErrorMessage * error = _controllerGetState(controller, object);
				if (error != nullptr) { return error ; }
			}
			break;
		}

		case SDL_CONTROLLERAXISMOTION: {
			SET_NUM(object, "family", (int) EventFamily::CONTROLLER);
			SET_NUM(object, "type", (int) EventType::AXIS_MOTION);
			SET_NUM(object, "controllerId", event.caxis.which);
			SET_NUM(object, "axis", event.caxis.axis);
			SET_NUM(object, "value", _joystickMapAxis(event.caxis.value));
			break;
		}
		case SDL_CONTROLLERBUTTONDOWN:
		case SDL_CONTROLLERBUTTONUP: {
			SET_NUM(object, "family", (int) EventFamily::CONTROLLER);
			SET_NUM(object, "type", (int) (event.type == SDL_CONTROLLERBUTTONDOWN
				? EventType::BUTTON_DOWN
				: EventType::BUTTON_UP));
			SET_NUM(object, "controllerId", event.cbutton.which);
			SET_NUM(object, "button", event.cbutton.button);
			break;
		}

		case SDL_SENSORUPDATE: {
			SET_NUM(object, "family", (int) EventFamily::SENSOR);
			SET_NUM(object, "type", (int) EventType::UPDATE);
			SET_NUM(object, "sensorId", event.sensor.which);
			break;
		}

		case SDL_AUDIODEVICEADDED: {
			SET_NUM(object, "family", (int) EventFamily::AUDIO_DEVICE);
			SET_NUM(object, "type", (int) EventType::DEVICE_ADD);
			bool is_capture = event.adevice.iscapture;
			SET_BOOL(object, "isRecorder", is_capture);

			Variant devices;
			ErrorMessage * error = audio_getDevices(is_capture, devices);
			if (error != nullptr) { return error; }
			SET_LIST(object, "devices", devices);
			break;
		}
		case SDL_AUDIODEVICEREMOVED: {
			SET_NUM(object, "family", (int) EventFamily::AUDIO_DEVICE);
			SET_NUM(object, "type", (int) EventType::DEVICE_REMOVE);
			SET_NUM(object, "audioId", event.adevice.which);
			bool is_capture = event.adevice.iscapture;
			SET_BOOL(object, "isRecorder", is_capture);

			Variant devices;
			ErrorMessage * error = audio_getDevices(is_capture, devices);
			if (error != nullptr) { return error; }
			SET_LIST(object, "devices", devices);
			break;
		}

		case SDL_CLIPBOARDUPDATE: {
			SET_NUM(object, "family", (int) EventFamily::CLIPBOARD);
			SET_NUM(object, "type", (int) EventType::UPDATE);
			break;
		}

		// case SDL_FINGERUP:
		// case SDL_FINGERDOWN: {
		// 	SET_STRING(object, "type", event.type == SDL_FINGERUP
		// 		? "fingerUp"
		// 		: "fingerDown");
		// 	SET_NUM(object, "touch_id", event.tfinger.touchId);
		// 	SET_NUM(object, "finger_id", event.tfinger.fingerId);
		// 	SET_NUM(object, "pressure", event.tfinger.pressure);
		// 	SET_NUM(object, "x", event.tfinger.x);
		// 	SET_NUM(object, "y", event.tfinger.y);
		// 	break;
		// }
		// case SDL_FINGERMOTION: {
		// 	SET_STRING(object, "type", "fingerMotion");
		// 	SET_NUM(object, "touch_id", event.tfinger.touchId);
		// 	SET_NUM(object, "finger_id", event.tfinger.fingerId);
		// 	SET_NUM(object, "pressure", event.tfinger.pressure);
		// 	SET_NUM(object, "x", event.tfinger.x);
		// 	SET_NUM(object, "y", event.tfinger.y);
		// 	SET_NUM(object, "dx", event.tfinger.dx);
		// 	SET_NUM(object, "dy", event.tfinger.dy);
		// 	break;
		// }
	}
	return nullptr;
}

ErrorMessage *
events_poll (Variant & object)
{
	SDL_Event event;
	bool got_event = SDL_PollEvent(&event);

	if (!got_event) { return nullptr; }

	ErrorMessage * error = packageEvent(event, object);
	if (error != nullptr) { return error; }

	return nullptr;
}

ErrorMessage *
events_wait (int timeout, Variant & object)
{
	SDL_Event event;

	bool got_event = SDL_WaitEventTimeout(&event, timeout);
	SDL_ClearError();

	if (!got_event) { return nullptr; }

	ErrorMessage * error = packageEvent(event, object);
	if (error != nullptr) { return error; }

	return nullptr;
}


ErrorMessage *
video_getDisplays(Variant & list)
{
	int num_displays = SDL_GetNumVideoDisplays();
	if (num_displays < 0) {
		RETURN_ERROR("SDL_GetNumVideoDisplays() error: %s\n", SDL_GetError());
	}

	const char * name;
	SDL_Rect rect;
	SDL_DisplayMode mode;
	float ddpi;
	float hdpi;
	float vdpi;

	MAKE_LIST(list);

	for (int i = 0; i < num_displays; i++) {
		Variant display;
		MAKE_MAP(display);

		name = SDL_GetDisplayName(i);
		if(name == nullptr) {
			RETURN_ERROR("SDL_GetDisplayName(%d) error: %s\n", i, SDL_GetError());
		}
		SET_STRING(display, "name", name);

		if (SDL_GetCurrentDisplayMode(i, &mode) != 0) {
			RETURN_ERROR("SDL_GetCurrentDisplayMode(%d) error: %s\n", i, SDL_GetError());
		}
		SET_NUM(display, "format", mode.format);
		SET_NUM(display, "frequency", mode.refresh_rate);

		{
			Variant geometry;
			MAKE_MAP(geometry);

			if(SDL_GetDisplayBounds(i, &rect) != 0) {
				RETURN_ERROR("SDL_GetDisplayBounds(%d) error: %s\n", i, SDL_GetError());
			}
			SET_NUM(geometry, "x", rect.x);
			SET_NUM(geometry, "y", rect.y);
			SET_NUM(geometry, "width", rect.w);
			SET_NUM(geometry, "height", rect.h);

			SET_MAP(display, "geometry", geometry);
		}

		{
			Variant usable;
			MAKE_MAP(usable);

			if(SDL_GetDisplayUsableBounds(i, &rect) != 0) {
				RETURN_ERROR("SDL_GetDisplayUsableBounds(%d) error: %s\n", i, SDL_GetError());
			}
			SET_NUM(usable, "x", rect.x);
			SET_NUM(usable, "y", rect.y);
			SET_NUM(usable, "width", rect.w);
			SET_NUM(usable, "height", rect.h);

			SET_MAP(display, "usable", usable);
		}

		{
			Variant dpi;
			MAKE_MAP(dpi);

			if (SDL_GetDisplayDPI(i, &ddpi, &hdpi, &vdpi) != 0) {
				RETURN_ERROR("SDL_GetDisplayDPI(%d) error: %s\n", i, SDL_GetError());
			}
			SET_NUM(dpi, "diagonal", ddpi);
			SET_NUM(dpi, "horizontal", hdpi);
			SET_NUM(dpi, "vertical", vdpi);

			SET_MAP(display, "dpi", dpi);
		}

		APPEND(list, display);
	}

	return nullptr;
}


ErrorMessage *
window_create (
	const char * title, int display,
	int ** x, int ** y, int ** width, int ** height,
	int * pixel_width, int * pixel_height,
	bool visible,
	bool * fullscreen,
	bool * resizable,
	bool * borderless,
	bool * always_on_top,
	bool * accelerated,
	bool * vsync,
	bool opengl,
	bool webgpu,
	bool * skip_taskbar,
	bool * popup_menu,
	bool * tooltip,
	bool * utility,
	int * window_id, void ** native_pointer, int * native_size
) {
	if (*x == nullptr) {
		*x = (int *) malloc(sizeof(int));
		**x = SDL_WINDOWPOS_CENTERED_DISPLAY(display);
	}
	if (*y == nullptr) {
		*y = (int *) malloc(sizeof(int));
		**y = SDL_WINDOWPOS_CENTERED_DISPLAY(display);
	}
	if (*width == nullptr) {
		*width = (int *) malloc(sizeof(int));
		**width = 640;
	}
	if (*height == nullptr) {
		*height = (int *) malloc(sizeof(int));
		**height = 480;
	}
	int desired_flags = 0
		| SDL_WINDOW_HIDDEN | SDL_WINDOW_ALLOW_HIGHDPI
		| (*fullscreen ? SDL_WINDOW_FULLSCREEN_DESKTOP : 0)
		| (*resizable ? SDL_WINDOW_RESIZABLE : 0)
		| (*borderless ? SDL_WINDOW_BORDERLESS : 0)
		| (*always_on_top ? SDL_WINDOW_ALWAYS_ON_TOP : 0)
		| (opengl ? SDL_WINDOW_OPENGL : 0)
		| (webgpu ? GPU_WINDOW_FLAG : 0)
		| (*skip_taskbar ? SDL_WINDOW_SKIP_TASKBAR : 0)
		| (*popup_menu ? SDL_WINDOW_POPUP_MENU : 0)
		| (*tooltip ? SDL_WINDOW_TOOLTIP : 0)
		| (*utility ? SDL_WINDOW_UTILITY : 0)
		;

	SDL_Window * window = SDL_CreateWindow(title, **x, **y, **width, **height, desired_flags);
	if (window == nullptr) {
		RETURN_ERROR("SDL_CreateWindow() error: %s\n", SDL_GetError());
	}

	*window_id = SDL_GetWindowID(window);
	if (*window_id == 0) {
		RETURN_ERROR("SDL_GetWindowID() error: %s\n", SDL_GetError());
	}

	int actual_flags = SDL_GetWindowFlags(window);
	*fullscreen = actual_flags & (SDL_WINDOW_FULLSCREEN | SDL_WINDOW_FULLSCREEN_DESKTOP);
	*resizable = actual_flags & SDL_WINDOW_RESIZABLE;
	*borderless = actual_flags & SDL_WINDOW_BORDERLESS;
	*always_on_top = actual_flags & SDL_WINDOW_ALWAYS_ON_TOP;
	*skip_taskbar = actual_flags & SDL_WINDOW_SKIP_TASKBAR;
	*popup_menu = actual_flags & SDL_WINDOW_POPUP_MENU;
	*tooltip = actual_flags & SDL_WINDOW_TOOLTIP;
	*utility = actual_flags & SDL_WINDOW_UTILITY;

	SDL_GetWindowPosition(window, *x, *y);
	SDL_GetWindowSizeInPixels(window, pixel_width, pixel_height);

	if (opengl || webgpu) {
		SDL_SysWMinfo info;
		SDL_VERSION(&(info.version));
		bool got_info = SDL_GetWindowWMInfo(window, &info);
		if (!got_info) {
			RETURN_ERROR("SDL_GetWindowWMInfo(%d) error: %s\n", *window_id, SDL_GetError());
		}

		if (opengl) {
			int size = sizeof(GL_NativeWindow);
			GL_NativeWindow *pointer = (GL_NativeWindow *) malloc(size);
			#if defined(__LINUX__)
				*pointer = info.info.x11.window;
			#elif defined(__WIN32__)
				*pointer = info.info.win.window;
			#elif defined(__MACOSX__)
				*pointer = getCocoaGlView(info.info.cocoa.window);
			#endif

			*native_pointer = pointer;
			*native_size = size;
		} else if (webgpu) {
			int size = sizeof(GPU_NativeData);
			GPU_NativeData *pointer = (GPU_NativeData *) malloc(size);

			#if defined(__LINUX__)
				pointer->display = info.info.x11.display;
				pointer->window = info.info.x11.window;
			#elif defined(__WIN32__)
				pointer->hwnd = info.info.win.window;
				pointer->hinstance = info.info.win.hinstance;
			#elif defined(__MACOSX__)
				pointer->layer = getCocoaGpuView(info.info.cocoa.window);
			#endif

			*native_pointer = pointer;
			*native_size = size;
		}
	}
	else {
		ErrorMessage * error = _windowUpdateRenderer(window, accelerated, vsync);
		if (error != nullptr) { return error; }
	}

	if (visible) { SDL_ShowWindow(window); }

	return nullptr;
}

ErrorMessage *
window_setTitle (int window_id, const char * title)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_SetWindowTitle(window, title);

	return nullptr;
}

ErrorMessage *
window_setPosition (int window_id, int x, int y)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_SetWindowPosition(window, x, y);

	return nullptr;
}

ErrorMessage *
window_setSize (int window_id, int width, int height, int * pixel_width, int * pixel_height)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_SetWindowSize(window, width, height);

	SDL_GetWindowSizeInPixels(window, pixel_width, pixel_height);

	return nullptr;
}

ErrorMessage *
window_setFullscreen (int window_id, bool * fullscreen)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	if (SDL_SetWindowFullscreen(window, *fullscreen ? SDL_WINDOW_FULLSCREEN_DESKTOP : 0) != 0) {
		RETURN_ERROR("SDL_SetWindowFullscreen(%d, %d) error: %s\n", window_id, *fullscreen, SDL_GetError());
	}

	int actual_flags = SDL_GetWindowFlags(window);
	*fullscreen = actual_flags & (SDL_WINDOW_FULLSCREEN | SDL_WINDOW_FULLSCREEN_DESKTOP);

	return nullptr;
}

ErrorMessage *
window_setResizable (int window_id, bool * resizable)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_SetWindowResizable(window, *resizable ? SDL_TRUE : SDL_FALSE);

	int actual_flags = SDL_GetWindowFlags(window);
	*resizable = actual_flags & SDL_WINDOW_RESIZABLE;

	return nullptr;
}

ErrorMessage *
window_setBorderless (int window_id, bool * borderless)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_SetWindowBordered(window, *borderless ? SDL_FALSE : SDL_TRUE);

	int actual_flags = SDL_GetWindowFlags(window);
	*borderless = actual_flags & SDL_WINDOW_BORDERLESS;

	return nullptr;
}

ErrorMessage *
window_setAcceleratedAndVsync (int window_id, bool * accelerated, bool * vsync)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	ErrorMessage * error = _windowUpdateRenderer(window, accelerated, vsync);
	if (error != nullptr) { return error; }

	return nullptr;
}

ErrorMessage *
window_focus (int window_id)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_RaiseWindow(window);

	return nullptr;
}

ErrorMessage *
window_show (int window_id)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_ShowWindow(window);

	return nullptr;
}

ErrorMessage *
window_hide (int window_id)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_HideWindow(window);

	return nullptr;
}

ErrorMessage *
window_maximize (int window_id)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_MaximizeWindow(window);

	return nullptr;
}

ErrorMessage *
window_minimize (int window_id)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_MinimizeWindow(window);

	return nullptr;
}

ErrorMessage *
window_restore (int window_id)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_RestoreWindow(window);

	return nullptr;
}

ErrorMessage *
window_render (
	int window_id,
	int w, int h, int stride,
	unsigned int format,
	void * pixels
) {
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_Renderer * renderer = SDL_GetRenderer(window);
	if (renderer == nullptr) {
		RETURN_ERROR("SDL_GetRenderer(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_Texture * texture = (SDL_Texture *) SDL_GetWindowData(window, "texture");
	if (texture == nullptr) {
		RETURN_ERROR("SDL_GetWindowData(%d) error: %s\n", window_id, SDL_GetError());
	}

	unsigned int texture_format;
	int texture_width, texture_height;
	if (SDL_QueryTexture(texture, &texture_format, nullptr, &texture_width, &texture_height)) {
		RETURN_ERROR("SDL_QueryTexture(%d) error: %s\n", window_id, SDL_GetError());
	}

	int pixel_width, pixel_height;
	SDL_GetWindowSizeInPixels(window, &pixel_width, &pixel_height);

	if (pixel_width != texture_width || pixel_height != texture_height) {
		ErrorMessage * error = _windowUpdateTexture(window, renderer, pixel_width, pixel_height, &texture);
		if (error != nullptr) { return error; }
		texture_width = pixel_width;
		texture_height = pixel_height;
	}

	SDL_Surface * src_surface = SDL_CreateRGBSurfaceWithFormatFrom(pixels, w, h, SDL_BITSPERPIXEL(format), stride, format);
	if (src_surface == nullptr) {
		RETURN_ERROR("SDL_CreateRGBSurfaceWithFormatFrom(%d, %d, %d, %d, %d) error: %s\n", window_id, w, h, stride, format, SDL_GetError());
	}

	if (SDL_SetSurfaceBlendMode(src_surface, SDL_BLENDMODE_NONE) != 0) {
		RETURN_ERROR("SDL_SetSurfaceBlendMode(%d) error: %s\n", window_id, SDL_GetError());
	}

	void *texture_pixels;
	int texture_stride;
	SDL_LockTexture(texture, nullptr, &texture_pixels, &texture_stride);

	SDL_Surface * dst_surface = SDL_CreateRGBSurfaceWithFormatFrom(texture_pixels, texture_width, texture_height, SDL_BITSPERPIXEL(texture_format), texture_stride, texture_format);
	if (dst_surface == nullptr) {
		RETURN_ERROR("SDL_CreateRGBSurfaceWithFormatFrom(%d, %d, %d, %d, %d) error: %s\n", window_id, texture_width, texture_height, texture_stride, texture_format, SDL_GetError());
	}

	if (SDL_BlitScaled(src_surface, NULL, dst_surface, NULL) != 0) {
		RETURN_ERROR("SDL_BlitSurface(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_UnlockTexture(texture);

	if (SDL_RenderCopy(renderer, texture, nullptr, nullptr) != 0) {
		RETURN_ERROR("SDL_RenderCopy(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_RenderPresent(renderer);

	SDL_FreeSurface(src_surface);
	SDL_FreeSurface(dst_surface);

	return nullptr;
}

ErrorMessage *
window_setIcon (
	int window_id,
	int w, int h, int stride,
	unsigned int format,
	void * pixels
) {
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_Surface* surface = SDL_CreateRGBSurfaceWithFormatFrom(pixels, w, h, SDL_BITSPERPIXEL(format), stride, format);
	if (surface == nullptr) {
		RETURN_ERROR("SDL_CreateRGBSurfaceWithFormatFrom(%d, %d, %d, %d) error: %s\n", window_id, w, h, format, SDL_GetError());
	}

	SDL_SetWindowIcon(window, surface);

	SDL_FreeSurface(surface);

	return nullptr;
}

ErrorMessage *
window_flash (int window_id, int type)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_FlashOperation op;
	switch (type) {
		case 2: op = SDL_FLASH_UNTIL_FOCUSED; break;
		case 1: op = SDL_FLASH_BRIEFLY; break;
		default: op = SDL_FLASH_CANCEL; break;
	}

	if (SDL_FlashWindow(window, op) != 0) {
		RETURN_ERROR("SDL_FlashWindow(%d, %d) error: %s\n", window_id, type, SDL_GetError());
	}

	return nullptr;
}

ErrorMessage *
window_destroy (int window_id)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_Renderer * renderer = SDL_GetRenderer(window);
	if (renderer != nullptr) { SDL_DestroyRenderer(renderer); }

	SDL_DestroyWindow(window);

	return nullptr;
}


ErrorMessage *
keyboard_getKey (int scancode, const char ** key)
{
	int keycode = SDL_GetKeyFromScancode((SDL_Scancode) scancode);
	*key = SDL_GetKeyName(keycode);
	return nullptr;
}

ErrorMessage *
keyboard_getScancode (const char * key, int * scancode)
{
	int keycode = SDL_GetKeyFromName(key);
	*scancode = keycode == SDLK_UNKNOWN ? 0 : SDL_GetScancodeFromKey((SDL_Keycode) keycode);
	return nullptr;
}

ErrorMessage *
keyboard_getState (Variant & list)
{
	MAKE_LIST(list);

	Variant key;
	for (int i = 0 ; i < num_keys; i++) {
		MAKE_BOOL(key, keys[i]);
		APPEND(list, key);
	}

	return nullptr;
}


ErrorMessage *
mouse_getButton (int button, int * state)
{
	int buttons = SDL_GetMouseState(nullptr, nullptr);
	*state = buttons & SDL_BUTTON(button);

	return nullptr;
}

ErrorMessage *
mouse_getPosition (Variant & position)
{
	MAKE_MAP(position);

	int x, y;
	SDL_GetGlobalMouseState(&x, &y);

	SET_NUM(position, "x", x);
	SET_NUM(position, "y", y);

	return nullptr;
}

ErrorMessage *
mouse_setPosition (int x, int y)
{
	if (SDL_WarpMouseGlobal(x, y) != 0) {
		RETURN_ERROR("SDL_WarpMouseGlobal(%d, %d) error: %s\n", x, y, SDL_GetError());
	}

	return nullptr;
}

ErrorMessage *
mouse_capture (bool capture)
{
	SDL_CaptureMouse(capture ? SDL_TRUE : SDL_FALSE);

	return nullptr;
}

ErrorMessage *
mouse_setCursor (int cursor_id)
{
	if (allocated_cursor != nullptr) {
		SDL_FreeCursor(allocated_cursor);
		allocated_cursor = nullptr;
	}

	allocated_cursor = SDL_CreateSystemCursor((SDL_SystemCursor) cursor_id);
	if (allocated_cursor == nullptr) {
		RETURN_ERROR("SDL_CreateSystemCursor(%d) error: %s\n", cursor_id, SDL_GetError());
	}

	SDL_SetCursor(allocated_cursor);

	return nullptr;
}

ErrorMessage *
mouse_setCursorImage (
	int w, int h, int stride,
	unsigned int format,
	void * pixels,
	int x, int y
) {
	SDL_Surface* surface = SDL_CreateRGBSurfaceWithFormatFrom(pixels, w, h, SDL_BITSPERPIXEL(format), stride, format);
	if (surface == nullptr) {
		RETURN_ERROR("SDL_CreateRGBSurfaceWithFormatFrom(%d, %d, %d) error: %s\n", w, h, format, SDL_GetError());
	}

	allocated_cursor = SDL_CreateColorCursor(surface, x, y);
		if (allocated_cursor == nullptr) {
		RETURN_ERROR("SDL_CreateColorCursor(%d, %d) error: %s\n", x, y, SDL_GetError());
	}

	SDL_FreeSurface(surface);

	SDL_SetCursor(allocated_cursor);

	return nullptr;
}

ErrorMessage *
mouse_showCursor (bool show)
{
	SDL_ShowCursor(show ? SDL_ENABLE : SDL_DISABLE);

	return nullptr;
}


ErrorMessage *
joystick_getDevices(Variant & list)
{
	int num_devices = SDL_NumJoysticks();
	if (num_devices < 0) {
		RETURN_ERROR("SDL_NumJoysticks() error: %s\n", SDL_GetError());
	}

	MAKE_LIST(list);

	for (int i = 0; i < num_devices; i++) {
		Variant device;
		MAKE_MAP(device);

		SET_NUM(device, "_index", i);

		int id = SDL_JoystickGetDeviceInstanceID(i);
		SET_NUM(device, "id", id);

		int type = SDL_JoystickGetDeviceType(i);
		SET_NUM(device, "type", type);

		const char * name = SDL_JoystickNameForIndex(i);
		if (name == nullptr) {
			RETURN_ERROR("SDL_JoystickNameForIndex(%d) error: %s\n", i, SDL_GetError());
		}
		SET_STRING(device, "name", name);

		const char * path = SDL_JoystickPathForIndex(i);
		if (path == nullptr) {
			RETURN_ERROR("SDL_JoystickPathForIndex(%d) error: %s\n", i, SDL_GetError());
		}
		SET_STRING(device, "path", path);

		SDL_JoystickGUID guid = SDL_JoystickGetDeviceGUID(i);
		char * guid_string = _allocateString(33);
		SDL_JoystickGetGUIDString(guid, guid_string, 33);
		SET_STRING(device, "guid", guid_string);

		int vendor = SDL_JoystickGetDeviceVendor(i);
		SET_NUM(device, "vendor", vendor);

		int product = SDL_JoystickGetDeviceProduct(i);
		SET_NUM(device, "product", product);

		int version = SDL_JoystickGetDeviceProductVersion(i);
		SET_NUM(device, "version", version);

		int player = SDL_JoystickGetDevicePlayerIndex(i);
		SET_NUM(device, "player", player);

		bool is_controller = SDL_IsGameController(i);
		SET_BOOL(device, "isController", is_controller);
		if (is_controller) {
			const char * mapping = SDL_GameControllerMappingForDeviceIndex(i);
			if (mapping != nullptr) {
				SET_STRING(device, "mapping", mapping);
			} else {
				SET_NULL(device, "mapping");
			}
		}

		APPEND(list, device);
	}

	return nullptr;
}

ErrorMessage *
joystick_open (int index, Variant & object)
{
	SDL_Joystick * joystick = SDL_JoystickOpen(index);
	if (joystick == nullptr) {
		RETURN_ERROR("SDL_JoystickOpen(%d) error: %s\n", index, SDL_GetError());
	}

	MAKE_MAP(object);

	{
		SDL_JoystickID joystick_id = SDL_JoystickInstanceID(joystick);
		if (joystick_id < 0) {
			RETURN_ERROR("SDL_JoystickInstanceID(%d) error: %s\n", index, SDL_GetError());
		}
		SET_NUM(object, "id", joystick_id);

		SET_NUM(object, "firmwareVersion", SDL_JoystickGetFirmwareVersion(joystick));

		const char * serial = SDL_JoystickGetSerial(joystick);
		if (serial != nullptr) {
			SET_STRING(object, "serialNumber", serial);
		} else {
			SET_NULL(object, "serialNumber");
		}

		SET_BOOL(object, "hasLed", SDL_JoystickHasLED(joystick));
		SET_BOOL(object, "hasRumble", SDL_JoystickHasRumble(joystick));
		SET_BOOL(object, "hasRumbleTriggers", SDL_JoystickHasRumbleTriggers(joystick));
	}

	{
		int num_axes = SDL_JoystickNumAxes(joystick);
		if (num_axes < 0) {
			RETURN_ERROR("SDL_JoystickNumAxes(%d) error: %s\n", index, SDL_GetError());
		}

		Variant axes;
		MAKE_LIST(axes);

		for (int i = 0; i < num_axes; i++) {
			Sint16 value = SDL_JoystickGetAxis(joystick, i);

			Variant axis;
			MAKE_NUM(axis, _joystickMapAxis(value));
			APPEND(axes, axis);
		}

		SET_LIST(object, "axes", axes);
	}

	{
		int num_balls = SDL_JoystickNumBalls(joystick);
		if (num_balls < 0) {
			RETURN_ERROR("SDL_JoystickNumBalls(%d) error: %s\n", index, SDL_GetError());
		}

		Variant balls;
		MAKE_LIST(balls);

		for (int i = 0; i < num_balls; i++) {
			int dx, dy;
			if (SDL_JoystickGetBall(joystick, i, &dx, &dy) != 0) {
				RETURN_ERROR("SDL_JoystickGetBall(%d, %d) error: %s\n", index, i, SDL_GetError());
			}

			Variant ball;
			MAKE_MAP(ball);
			SET_NUM(ball, "x", dx);
			SET_NUM(ball, "y", dy);
			APPEND(balls, ball);
		}

		SET_LIST(object, "balls", balls);
	}

	{
		int num_buttons = SDL_JoystickNumButtons(joystick);
		if (num_buttons < 0) {
			RETURN_ERROR("SDL_JoystickNumButtons(%d) error: %s\n", index, SDL_GetError());
		}

		Variant buttons;
		MAKE_LIST(buttons);

		for (int i = 0; i < num_buttons; i++) {
			int pressed = SDL_JoystickGetButton(joystick, i);

			Variant button;
			MAKE_BOOL(button, pressed);
			APPEND(buttons, button);
		}

		SET_LIST(object, "buttons", buttons);
	}

	{
		int num_hats = SDL_JoystickNumHats(joystick);
		if (num_hats < 0) {
			RETURN_ERROR("SDL_JoystickNumHats(%d) error: %s\n", index, SDL_GetError());
		}

		Variant hats;
		MAKE_LIST(hats);

		for (int i = 0; i < num_hats; i++) {
			int position = SDL_JoystickGetHat(joystick, i);

			Variant hat;
			MAKE_NUM(hat, position);
			APPEND(hats, hat);
		}

		SET_LIST(object, "hats", hats);
	}

	return nullptr;
}

ErrorMessage *
joystick_close (int joystick_id)
{
	SDL_Joystick * joystick = SDL_JoystickFromInstanceID(joystick_id);
	if (joystick == nullptr) {
		RETURN_ERROR("SDL_JoystickFromInstanceID(%d) error: %s\n", joystick_id, SDL_GetError());
	}

	SDL_JoystickClose(joystick);

	return nullptr;
}

ErrorMessage *
joystick_getPower (int joystick_id, int * power)
{
	SDL_Joystick * joystick = SDL_JoystickFromInstanceID(joystick_id);
	if (joystick == nullptr) {
		RETURN_ERROR("SDL_JoystickFromInstanceID(%d) error: %s\n", joystick_id, SDL_GetError());
	}

	*power = SDL_JoystickCurrentPowerLevel(joystick);

	return nullptr;
}

ErrorMessage *
joystick_rumble (
	int joystick_id,
	double low_freq_rumble,
	double high_freq_rumble,
	int duration
) {
	SDL_Joystick * joystick = SDL_JoystickFromInstanceID(joystick_id);
	if (joystick == nullptr) {
		RETURN_ERROR("SDL_JoystickFromInstanceID(%d) error: %s\n", joystick_id, SDL_GetError());
	}

	if (SDL_JoystickRumble(joystick, low_freq_rumble * 0xFFFF, high_freq_rumble * 0xFFFF, duration) == -1) {
		RETURN_ERROR("SDL_JoystickRumble(%d) error: %s\n", joystick_id, SDL_GetError());
	}

	return nullptr;
}

ErrorMessage *
joystick_setLed (int joystick_id, double red, double green, double blue)
{
	SDL_Joystick * joystick = SDL_JoystickFromInstanceID(joystick_id);
	if (joystick == nullptr) {
		RETURN_ERROR("SDL_JoystickFromInstanceID(%d) error: %s\n", joystick_id, SDL_GetError());
	}

	if (SDL_JoystickSetLED(joystick, red * 0xFF, green * 0xFF, blue * 0xFF) == -1) {
		RETURN_ERROR("SDL_JoystickSetLED(%d) error: %s\n", joystick_id, SDL_GetError());
	}

	return nullptr;
}

ErrorMessage *
joystick_setPlayer (int joystick_id, int player)
{
	SDL_Joystick * joystick = SDL_JoystickFromInstanceID(joystick_id);
	if (joystick == nullptr) {
		RETURN_ERROR("SDL_JoystickFromInstanceID(%d) error: %s\n", joystick_id, SDL_GetError());
	}

	SDL_JoystickSetPlayerIndex(joystick, player);

	return nullptr;
}

ErrorMessage *
joystick_rumbleTriggers (
	int joystick_id,
	double left_rumble,
	double right_rumble,
	int duration
) {
	SDL_Joystick * joystick = SDL_JoystickFromInstanceID(joystick_id);
	if (joystick == nullptr) {
		RETURN_ERROR("SDL_JoystickFromInstanceID(%d) error: %s\n", joystick_id, SDL_GetError());
	}

	if (SDL_JoystickRumbleTriggers(joystick, left_rumble * 0xFFFF, right_rumble * 0xFFFF, duration) == -1) {
		RETURN_ERROR("SDL_JoystickRumbleTriggers(%d) error: %s\n", joystick_id, SDL_GetError());
	}

	return nullptr;
}

ErrorMessage *
controller_open (int index, Variant & object)
{
	SDL_GameController * controller = SDL_GameControllerOpen(index);
	if (controller == nullptr) {
		RETURN_ERROR("SDL_GameControllerOpen(%d) error: %s\n", index, SDL_GetError());
	}

	MAKE_MAP(object);

	{
		SDL_Joystick * joystick = SDL_GameControllerGetJoystick(controller);
		if (joystick == nullptr) {
			RETURN_ERROR("SDL_GameControllerGetJoystick(%d) error: %s\n", index, SDL_GetError());
		}

		SDL_JoystickID joystick_id = SDL_JoystickInstanceID(joystick);
		if (joystick_id < 0) {
			RETURN_ERROR("SDL_JoystickInstanceID(%d) error: %s\n", index, SDL_GetError());
		}
		SET_NUM(object, "id", joystick_id);

		SET_NUM(object, "firmwareVersion", SDL_JoystickGetFirmwareVersion(joystick));

		const char * serial = SDL_JoystickGetSerial(joystick);
		if (serial != nullptr) {
			SET_STRING(object, "serialNumber", serial);
		} else {
			SET_NULL(object, "serialNumber");
		}

		SET_BOOL(object, "hasLed", SDL_JoystickHasLED(joystick));
		SET_BOOL(object, "hasRumble", SDL_JoystickHasRumble(joystick));
		SET_BOOL(object, "hasRumbleTriggers", SDL_JoystickHasRumbleTriggers(joystick));
	}

	ErrorMessage * error = _controllerGetState(controller, object);
	if (error != nullptr) { return error; }

	return nullptr;
}

ErrorMessage *
controller_close (int controller_id)
{
	SDL_GameController * controller = SDL_GameControllerFromInstanceID(controller_id);
	if (controller == nullptr) {
		RETURN_ERROR("SDL_GameControllerFromInstanceID(%d) error: %s\n", controller_id, SDL_GetError());
	}

	SDL_GameControllerClose(controller);

	return nullptr;
}

ErrorMessage *
controller_addMappings (char ** mappings, int length)
{
	for (int i = 0; i < length; i++) {
		if (SDL_GameControllerAddMapping(mappings[i]) == -1) {
			RETURN_ERROR("SDL_GameControllerAddMapping(%s) error: %s\n", mappings[i], SDL_GetError());
		}
	}
	return nullptr;
}


ErrorMessage *
sensor_getDevices (Variant & list)
{
	int num_devices = SDL_NumSensors();
	if (num_devices < 0) {
		RETURN_ERROR("SDL_NumSensors() error: %s\n", SDL_GetError());
	}

	MAKE_LIST(list);

	for (int i = 0; i < num_devices; i++) {
		Variant device;
		MAKE_MAP(device);

		SET_NUM(device, "_index", i);

		int id = SDL_SensorGetDeviceInstanceID(i);
		SET_NUM(device, "id", id);

		int type = SDL_SensorGetDeviceType(i);
		SET_NUM(device, "type", type);

		const char * name = SDL_SensorGetDeviceName(i);
		if (name == nullptr) {
			RETURN_ERROR("SDL_SensorGetDeviceName(%d) error: %s\n", i, SDL_GetError());
		}
		SET_STRING(device, "name", name);

		APPEND(list, device);
	}

	return nullptr;
}

ErrorMessage *
sensor_open (int index)
{
	SDL_Sensor * sensor = SDL_SensorOpen(index);
	if (sensor == nullptr) {
		RETURN_ERROR("SDL_SensorOpen(%d) error: %s\n", index, SDL_GetError());
	}

	return nullptr;
}

ErrorMessage *
sensor_close (int sensor_id)
{
	SDL_Sensor * sensor = SDL_SensorFromInstanceID(sensor_id);
	if (sensor == nullptr) {
		RETURN_ERROR("SDL_SensorFromInstanceID(%d) error: %s\n", sensor_id, SDL_GetError());
	}

	SDL_SensorClose(sensor);

	return nullptr;
}

ErrorMessage *
sensor_getData (int sensor_id, Variant & object)
{
	SDL_Sensor * sensor = SDL_SensorFromInstanceID(sensor_id);
	if (sensor == nullptr) {
		RETURN_ERROR("SDL_SensorFromInstanceID(%d) error: %s\n", sensor_id, SDL_GetError());
	}

	Uint64 timestamp;
	float data[3];
	if (SDL_SensorGetDataWithTimestamp(sensor, &timestamp, data, 3) == -1) {
		RETURN_ERROR("SDL_SensorGetDataWithTimestamp(%d) error: %s\n", sensor_id, SDL_GetError());
	}

	MAKE_MAP(object);
	SET_NUM(object, "timestamp", timestamp);
	SET_NUM(object, "x", data[0]);
	SET_NUM(object, "y", data[1]);
	SET_NUM(object, "z", data[2]);

	return nullptr;
}



ErrorMessage *
audio_getDevices(bool capture, Variant & list)
{
	MAKE_LIST(list);

	int num_devices = SDL_GetNumAudioDevices(capture ? 1 : 0);
	if (num_devices == -1) {
		const char * error = SDL_GetError();
		if (error != no_error) {
			RETURN_ERROR("SDL_GetNumAudioDevices(%d) error: %s\n", capture, error);
		}
		return nullptr;
	}

	for (int i = 0; i < num_devices; i++) {
		Variant device;
		MAKE_MAP(device);

		SET_BOOL(device, "isRecorder", capture);

		const char * name = SDL_GetAudioDeviceName(i, capture);
		if (name == nullptr) {
			RETURN_ERROR("SDL_GetAudioDeviceName(%d, %d) error: %s\n", i, capture, SDL_GetError());
		}
		SET_STRING(device, "name", name);

		APPEND(list, device);
	}

	return nullptr;
}

ErrorMessage *
audio_openDevice (
	const char * name, bool capture,
	int freq, int format, int channels, int samples,
	int * audio_id
) {
	SDL_AudioSpec desired;
	SDL_memset(&desired, 0, sizeof(desired));
	desired.freq = freq;
	desired.format = format;
	desired.channels = channels;
	desired.samples = samples;

	SDL_AudioDeviceID audio_device = SDL_OpenAudioDevice(name, capture ? 1 : 0, &desired, nullptr, 0);
	if (audio_device == 0) {
		RETURN_ERROR("SDL_OpenAudioDevice() error: %s\n", SDL_GetError());
	}

	*audio_id = audio_device;

	return nullptr;
}

ErrorMessage *
audio_close (int audio_id)
{
	SDL_PauseAudioDevice(audio_id, 1);
	SDL_CloseAudioDevice(audio_id);

	return nullptr;
}

ErrorMessage *
audio_play (int audio_id, bool play)
{
	SDL_PauseAudioDevice(audio_id, play ? 0 : 1);

	return nullptr;
}

ErrorMessage *
audio_getQueueSize (int audio_id, unsigned int * size)
{
	*size = SDL_GetQueuedAudioSize(audio_id);

	return nullptr;
}

ErrorMessage *
audio_clearQueue (int audio_id)
{
	SDL_ClearQueuedAudio(audio_id);

	return nullptr;
}

ErrorMessage *
audio_enqueue (int audio_id, void * src, int size)
{
	if (SDL_QueueAudio(audio_id, src, size) != 0) {
		RETURN_ERROR("SDL_QueueAudio() error: %s\n", SDL_GetError());
	}

	return nullptr;
}

ErrorMessage *
audio_dequeue (int audio_id, void * dst, int size, int * num)
{
	*num = SDL_DequeueAudio(audio_id, dst, size);

	return nullptr;
}


ErrorMessage *
clipboard_getText (const char ** text)
{
	if (!SDL_HasClipboardText()) {
		return nullptr;
	}

	if (allocated_clipboard) {
		SDL_free(allocated_clipboard);
		allocated_clipboard = nullptr;
	}

	allocated_clipboard = SDL_GetClipboardText();
	if (!allocated_clipboard) {
		RETURN_ERROR("SDL_GetClipboardText(NULL) error: %s\n", SDL_GetError());
	}

	*text = allocated_clipboard;

	return nullptr;
}

ErrorMessage *
clipboard_setText (const char * text)
{
	if (SDL_SetClipboardText(text) != 0) {
		RETURN_ERROR("SDL_SetClipboardText() error: %s\n", SDL_GetError());
	}

	return nullptr;
}


ErrorMessage *
power_getInfo (Variant & info)
{
	int seconds, percent;
	SDL_PowerState state = SDL_GetPowerInfo(&seconds, &percent);

	MAKE_MAP(info);

	SET_NUM(info, "state", (int) state);
	SET_NUM(info, "seconds", seconds);
	SET_NUM(info, "percent", percent);

	return nullptr;
}


ErrorMessage *
cleanup ()
{
	SDL_Quit();

	return nullptr;
}


} // namespace
