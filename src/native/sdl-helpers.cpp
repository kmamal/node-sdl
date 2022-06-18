#include "sdl-helpers.h"
#include <SDL.h>
#include <SDL_syswm.h>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <map>

#if defined(_WIN32)
	#include "asprintf.h"
#endif


#if defined(__LINUX__)
	#define __WINDOW_TYPE__ Window
	#define GET_WINDOW(x) x.info.x11.window
#elif defined(__WIN32__)
	#define __WINDOW_TYPE__ HWND
	#define GET_WINDOW(x) x.info.win.window
#elif defined(__MACOSX__)
	#include "cocoa-window.h"
	#define __WINDOW_TYPE__ CALayer *
	#define GET_WINDOW(x) getView(x.info.cocoa.window)
#endif

typedef __WINDOW_TYPE__ NativeWindow;


#define RETURN_ERROR(...) do { \
	char * error; \
	int result = asprintf(&error, __VA_ARGS__); \
	return result == -1 ? new ErrorMessage("asprintf failed", false) : new ErrorMessage(error); \
} while (0)


static const char * no_error = nullptr;

static char * allocated_drop_file = nullptr ;
static char * allocated_clipboard = nullptr ;
static SDL_Cursor * allocated_cursor = nullptr;

static const Uint8 * keys;
static int num_keys;

static char text_input[32];


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
initialize (Variant & object)
{
	MAKE_MAP(object);

	// Init
	{
		int subsystems = 0
			| SDL_INIT_VIDEO
			| SDL_INIT_AUDIO
			| SDL_INIT_GAMECONTROLLER;
		if (SDL_Init(subsystems) != 0) {
			RETURN_ERROR("SDL_Init(0) error: %s\n", SDL_GetError());
		}
	}

	// Hints
	{
		SDL_SetHint(SDL_HINT_FRAMEBUFFER_ACCELERATION, "0");
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
		const char * driver_name = SDL_GetCurrentVideoDriver();
		if(driver_name == nullptr) {
			RETURN_ERROR("SDL_GetCurrentVideoDriver() error: %s\n", SDL_GetError());
		}

		SET_STRING(video, "current", driver_name);
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
	{
		const char * driver_name = SDL_GetCurrentAudioDriver();
		if(driver_name == nullptr) {
			RETURN_ERROR("SDL_GetCurrentAudioDriver() error: %s\n", SDL_GetError());
		}

		SET_STRING(audio, "current", driver_name);
	}

	SET_MAP(drivers, "video", video);
	SET_MAP(drivers, "audio", audio);
	SET_MAP(object, "drivers", drivers);

	SDL_ClearError();
	no_error = SDL_GetError();

	keys = SDL_GetKeyboardState(&num_keys);
	SDL_StartTextInput();

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
	bool visible,
	bool fullscreen,
	bool resizable,
	bool borderless,
	bool opengl,
	int * window_id, void ** native_pointer, int * native_pointer_size
) {
	SDL_Window * window;

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
	int flags = 0
		| (visible ? 0 : SDL_WINDOW_HIDDEN)
		| (fullscreen ? SDL_WINDOW_FULLSCREEN_DESKTOP : 0)
		| (resizable ? SDL_WINDOW_RESIZABLE : 0)
		| (borderless ? SDL_WINDOW_BORDERLESS : 0)
		| (opengl ? SDL_WINDOW_OPENGL : 0);

	window = SDL_CreateWindow(title, **x, **y, **width, **height, flags);
	if (window == nullptr) {
		RETURN_ERROR("SDL_CreateWindow() error: %s\n", SDL_GetError());
	}

	SDL_GetWindowPosition(window, *x, *y);

	*window_id = SDL_GetWindowID(window);
	if (*window_id == 0) {
		RETURN_ERROR("SDL_GetWindowID() error: %s\n", SDL_GetError());
	}

	SDL_SysWMinfo info;
	SDL_VERSION(&(info.version));
	bool got_info = SDL_GetWindowWMInfo(window, &info);
	if (!got_info) {
		RETURN_ERROR("SDL_GetWindowWMInfo() error: %s\n", SDL_GetError());
	}

	int size = sizeof(NativeWindow);
	NativeWindow * pointer = (NativeWindow *) malloc(size);
	*pointer = GET_WINDOW(info);
	*native_pointer = pointer;
	*native_pointer_size = size;

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
window_setSize (int window_id, int width, int height)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_SetWindowSize(window, width, height);

	return nullptr;
}

ErrorMessage *
window_setFullscreen (int window_id, bool fullscreen)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	if (SDL_SetWindowFullscreen(window, fullscreen ? SDL_WINDOW_FULLSCREEN_DESKTOP : 0) != 0) {
		RETURN_ERROR("SDL_SetWindowFullscreen(%d, %d) error: %s\n", window_id, fullscreen, SDL_GetError());
	}

	return nullptr;
}

ErrorMessage *
window_setResizable (int window_id, bool resizable)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_SetWindowResizable(window, resizable ? SDL_TRUE : SDL_FALSE);

	return nullptr;
}

ErrorMessage *
window_setBorderless (int window_id, bool borderless)
{
	SDL_Window * window = SDL_GetWindowFromID(window_id);
	if (window == nullptr) {
		RETURN_ERROR("SDL_GetWindowFromID(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_SetWindowBordered(window, borderless ? SDL_FALSE : SDL_TRUE);

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
		RETURN_ERROR("SDL_CreateRGBSurfaceWithFormatFrom(%d, %d, %d) error: %s\n", w, h, format, SDL_GetError());
	}

	SDL_SetWindowIcon(window, surface);

	SDL_FreeSurface(surface);

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

	SDL_Surface* src_surface = SDL_CreateRGBSurfaceWithFormatFrom(pixels, w, h, SDL_BITSPERPIXEL(format), stride, format);
	SDL_SetSurfaceBlendMode(src_surface, SDL_BLENDMODE_NONE);
	if (src_surface == nullptr) {
		RETURN_ERROR("SDL_CreateRGBSurfaceWithFormatFrom(%d, %d, %d) error: %s\n", w, h, format, SDL_GetError());
	}

	SDL_Surface * window_surface = SDL_GetWindowSurface(window);
	if (window_surface == nullptr) {
		RETURN_ERROR("SDL_GetWindowSurface(%d) error: %s\n", window_id, SDL_GetError());
	}

	if (SDL_BlitSurface(src_surface, NULL, window_surface, NULL) != 0) {
		RETURN_ERROR("SDL_LowerBlit(%d) error: %s\n", window_id, SDL_GetError());
	}

	SDL_FreeSurface(src_surface);

	if (SDL_UpdateWindowSurface(window) != 0) {
		RETURN_ERROR("SDL_UpdateWindowSurface(%d) error: %s\n", window_id, SDL_GetError());
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

	SDL_DestroyWindow(window);

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
		else {
			Variant device;
			MAKE_MAP(device);

			SET_NULL(device, "name");
			SET_BOOL(device, "recording", capture);

			APPEND(list, device);
		}
	}
	else {
		for (int i = 0; i < num_devices; i++) {
			const char * name = SDL_GetAudioDeviceName(i, capture);
			if (name == nullptr) {
				RETURN_ERROR("SDL_GetAudioDeviceName(%d, %d) error: %s\n", i, capture, SDL_GetError());
			}

			Variant device;
			MAKE_MAP(device);

			SET_STRING(device, "name", name);
			SET_BOOL(device, "recording", capture);

			APPEND(list, device);
		}
	}

	return nullptr;
}

ErrorMessage *
audio_openDevice (
	const char * name, bool capture,
	int freq, int format, int channels, int samples,
	int * device_id
) {
	SDL_AudioSpec desired;
	SDL_memset(&desired, 0, sizeof(desired));
	desired.freq = freq;
	desired.format = format;
	desired.channels = channels;
	desired.samples = samples;

	SDL_AudioDeviceID audio_device = SDL_OpenAudioDevice(nullptr, capture ? 1 : 0, &desired, nullptr, 0);
	if (audio_device == 0) {
		RETURN_ERROR("SDL_OpenAudioDevice() error: %s\n", SDL_GetError());
	}

	*device_id = audio_device;

	return nullptr;
}

ErrorMessage *
audio_close (int device_id)
{
	SDL_PauseAudioDevice(device_id, 1);
	SDL_CloseAudioDevice(device_id);

	return nullptr;
}

ErrorMessage *
audio_play (int device_id, bool play)
{
	SDL_PauseAudioDevice(device_id, play ? 0 : 1);

	return nullptr;
}

ErrorMessage *
audio_getQueueSize (int device_id, unsigned int * size)
{
	*size = SDL_GetQueuedAudioSize(device_id);

	return nullptr;
}

ErrorMessage *
audio_clearQueue (int device_id)
{
	SDL_ClearQueuedAudio(device_id);

	return nullptr;
}

ErrorMessage *
audio_enqueue (int device_id, void * src, int size)
{
	if (SDL_QueueAudio(device_id, src, size) != 0) {
		RETURN_ERROR("SDL_QueueAudio() error: %s\n", SDL_GetError());
	}

	return nullptr;
}

ErrorMessage *
audio_dequeue (int device_id, void * dst, int size, int * num)
{
	*num = SDL_DequeueAudio(device_id, dst, size);

	return nullptr;
}


ErrorMessage *
packageEvent (const SDL_Event & event, Variant & object)
{
	if (allocated_drop_file) {
		SDL_free(allocated_drop_file);
		allocated_drop_file = nullptr;
	}
	if (allocated_clipboard) {
		SDL_free(allocated_clipboard);
		allocated_clipboard = nullptr;
	}

	MAKE_MAP(object);

	Variant value;
	switch (event.type) {
		case SDL_QUIT: {
			SET_STRING(object, "family", "app");
			SET_STRING(object, "type", "quit");
			break;
		}

		case SDL_WINDOWEVENT: {
			SET_STRING(object, "family", "window");
			SET_NUM(object, "window", event.window.windowID);

			switch (event.window.event) {
				case SDL_WINDOWEVENT_SHOWN: { SET_STRING(object, "type", "show"); break; }
				case SDL_WINDOWEVENT_HIDDEN: { SET_STRING(object, "type", "hide"); break; }
				case SDL_WINDOWEVENT_EXPOSED: { SET_STRING(object, "type", "expose"); break; }
				case SDL_WINDOWEVENT_MOVED: {
					SET_STRING(object, "type", "move");
					SET_NUM(object, "x", event.window.data1);
					SET_NUM(object, "y", event.window.data2);
					break;
				}
				// case SDL_WINDOWEVENT_RESIZED: {
				// 	SET_STRING(object, "type", "resized");
				// 	SET_NUM(object, "width", event.window.data1);
				// 	SET_NUM(object, "height", event.window.data2);
				// 	break;
				// }
				case SDL_WINDOWEVENT_SIZE_CHANGED: {
					SET_STRING(object, "type", "resize");
					SET_NUM(object, "width", event.window.data1);
					SET_NUM(object, "height", event.window.data2);
					break;
				}
				case SDL_WINDOWEVENT_MINIMIZED: { SET_STRING(object, "type", "minimize"); break; }
				case SDL_WINDOWEVENT_MAXIMIZED: { SET_STRING(object, "type", "maximize"); break; }
				case SDL_WINDOWEVENT_RESTORED: { SET_STRING(object, "type", "restore"); break; }
				case SDL_WINDOWEVENT_FOCUS_GAINED: { SET_STRING(object, "type", "focus"); break; }
				case SDL_WINDOWEVENT_FOCUS_LOST: { SET_STRING(object, "type", "blur"); break; }
				case SDL_WINDOWEVENT_ENTER: { SET_STRING(object, "type", "hover"); break; }
				case SDL_WINDOWEVENT_LEAVE: { SET_STRING(object, "type", "leave"); break; }
				case SDL_WINDOWEVENT_CLOSE: { SET_STRING(object, "type", "close"); break; }
			}
			break;
		}

		case SDL_KEYDOWN:
		case SDL_KEYUP: {
			SET_STRING(object, "family", "keyboard");
			SET_STRING(object, "type", event.type == SDL_KEYDOWN
				? "keyDown"
				: "keyUp");
			SET_NUM(object, "window", event.key.windowID);

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
			SET_STRING(object, "family", "text");
			SET_STRING(object, "type", "textInput");
			SET_NUM(object, "window", event.text.windowID);
			strcpy(text_input, event.text.text);
			SET_STRING(object, "text", text_input);
			break ;
		}

		case SDL_MOUSEMOTION: {
			SET_STRING(object, "family", "mouse");
			SET_STRING(object, "type", "mouseMove");
			SET_NUM(object, "window", event.motion.windowID);
			SET_BOOL(object, "touch", event.motion.which == SDL_TOUCH_MOUSEID);
			SET_NUM(object, "x", event.motion.x);
			SET_NUM(object, "y", event.motion.y);
			break;
		}
		case SDL_MOUSEBUTTONDOWN:
		case SDL_MOUSEBUTTONUP: {
			SET_STRING(object, "family", "mouse");
			SET_STRING(object, "type", event.type == SDL_MOUSEBUTTONDOWN
				? "mouseButtonDown"
				: "mouseButtonUp");
			SET_NUM(object, "window", event.button.windowID);
			SET_BOOL(object, "touch", event.button.which == SDL_TOUCH_MOUSEID);
			SET_NUM(object, "button", event.button.button);
			SET_NUM(object, "x", event.button.x);
			SET_NUM(object, "y", event.button.y);
			break;
		}
		case SDL_MOUSEWHEEL: {
			SET_STRING(object, "family", "mouse");
			SET_STRING(object, "type", "mouseWheel");
			SET_NUM(object, "window", event.wheel.windowID);
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

		case SDL_JOYAXISMOTION: {
			SET_STRING(object, "type", "joystickAxisMotion");
			SET_NUM(object, "joystick", event.jaxis.which);
			SET_NUM(object, "axis", event.jaxis.axis);
			SET_NUM(object, "value", event.jaxis.value);
			break ;
		}
		case SDL_JOYBALLMOTION: {
			SET_STRING(object, "type", "joystickBallMotion");
			SET_NUM(object, "joystick", event.jball.which);
			SET_NUM(object, "x", event.jball.xrel);
			SET_NUM(object, "y", event.jball.yrel);
			break ;
		}
		case SDL_JOYHATMOTION: {
			SET_STRING(object, "type", "joystickHatMotion");
			SET_NUM(object, "joystick", event.jhat.which);
			SET_NUM(object, "hat", event.jhat.hat);
			SET_NUM(object, "value", event.jhat.value);
			break ;
		}
		case SDL_JOYBUTTONUP:
		case SDL_JOYBUTTONDOWN: {
			SET_STRING(object, "type", event.type == SDL_JOYBUTTONUP
				? "joystickButtonUp"
				: "joystickButtonDown");
			SET_NUM(object, "joystick", event.jbutton.which);
			SET_NUM(object, "button", event.jbutton.button);
			break ;
		}
		case SDL_JOYDEVICEADDED: {
			SET_STRING(object, "type", "joystickDeviceAdd");
			SET_NUM(object, "index", event.jdevice.which);
			break;
		}
		case SDL_JOYDEVICEREMOVED: {
			SET_STRING(object, "type", "joystickDeviceRemove");
			SET_NUM(object, "joystick", event.jdevice.which);
			break ;
		}

		case SDL_CONTROLLERAXISMOTION: {
			SET_STRING(object, "type", "controllerAxisMotion");
			break;
		}
		case SDL_CONTROLLERBUTTONDOWN: {
			SET_STRING(object, "type", "controllerButtonDown");
			break;
		}
		case SDL_CONTROLLERBUTTONUP: {
			SET_STRING(object, "type", "controllerButtonDown");
			break;
		}
		case SDL_CONTROLLERDEVICEADDED: {
			SET_STRING(object, "type", "controllerDeviceAdded");
			break;
		}
		case SDL_CONTROLLERDEVICEREMOVED: {
			SET_STRING(object, "type", "controllerDeviceRemoved");
			break;
		}
		case SDL_CONTROLLERDEVICEREMAPPED: {
			SET_STRING(object, "type", "controllerDeviceRemapped");
			break;
		}

		case SDL_FINGERUP:
		case SDL_FINGERDOWN: {
			SET_STRING(object, "type", event.type == SDL_FINGERUP
				? "fingerUp"
				: "fingerDown");
			SET_NUM(object, "touch_id", event.tfinger.touchId);
			SET_NUM(object, "finger_id", event.tfinger.fingerId);
			SET_NUM(object, "pressure", event.tfinger.pressure);
			SET_NUM(object, "x", event.tfinger.x);
			SET_NUM(object, "y", event.tfinger.y);
			break;
		}
		case SDL_FINGERMOTION: {
			SET_STRING(object, "type", "fingerMotion");
			SET_NUM(object, "touch_id", event.tfinger.touchId);
			SET_NUM(object, "finger_id", event.tfinger.fingerId);
			SET_NUM(object, "pressure", event.tfinger.pressure);
			SET_NUM(object, "x", event.tfinger.x);
			SET_NUM(object, "y", event.tfinger.y);
			SET_NUM(object, "dx", event.tfinger.dx);
			SET_NUM(object, "dy", event.tfinger.dy);
			break;
		}

		case SDL_CLIPBOARDUPDATE: {
			SET_STRING(object, "family", "clipboard");
			SET_STRING(object, "type", "update");
			break;
		}

		case SDL_DROPBEGIN:
		case SDL_DROPCOMPLETE: {
			SET_STRING(object, "family", "drop");
			SET_STRING(object, "type", event.type == SDL_DROPBEGIN
				? "dropBegin"
				: "dropComplete");
			SET_NUM(object, "window", event.drop.windowID);
			break;
		}
		case SDL_DROPFILE:
		case SDL_DROPTEXT: {
			SET_STRING(object, "family", "drop");
			bool is_file = event.type == SDL_DROPFILE;
			SET_STRING(object, "type", is_file ? "dropFile" : "dropText");
			SET_NUM(object, "window", event.drop.windowID);

			allocated_drop_file = event.drop.file;
			SET_STRING(object, is_file ? "file" : "text", allocated_drop_file);
			break;
		}

		case SDL_AUDIODEVICEADDED:
		case SDL_AUDIODEVICEREMOVED: {
			SET_STRING(object, "family", "audioDevice");
			SET_STRING(object, "type", event.type == SDL_AUDIODEVICEADDED
				? "deviceAdd"
				: "deviceRemove");
			SET_NUM(object, "index", event.adevice.which);
			SET_BOOL(object, "recording", event.adevice.iscapture);
			break;
		}
	}
	return nullptr;
}

ErrorMessage *
events_poll (Variant & object)
{
	SDL_Event event;
	bool got_event = SDL_PollEvent(&event);

	if (!got_event) { return nullptr; }

	packageEvent(event, object);

	return nullptr;
}

ErrorMessage *
events_wait (int timeout, Variant & object)
{
	SDL_Event event;

	bool got_event = SDL_WaitEventTimeout(&event, timeout);
	SDL_ClearError();

	if (!got_event) { return nullptr; }

	packageEvent(event, object);

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
	if (allocated_cursor) {
		SDL_FreeCursor(allocated_cursor);
		allocated_cursor = nullptr;
	}

	allocated_cursor = SDL_CreateSystemCursor((SDL_SystemCursor) cursor_id);
	if (!allocated_cursor) {
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
		if (!allocated_cursor) {
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
	int num_joysticks = SDL_NumJoysticks();
	if (num_joysticks < 0) {
		RETURN_ERROR("SDL_NumJoysticks() error: %s\n", SDL_GetError());
	}

	MAKE_LIST(list);

	for (int i = 0; i < num_joysticks; i++) {
		const char * name = SDL_JoystickNameForIndex(i);
		if (name == nullptr) {
			RETURN_ERROR("SDL_JoystickNameForIndex(%d) error: %s\n", i, SDL_GetError());
		}

		Variant joystick;
		MAKE_MAP(joystick);

		SET_STRING(joystick, "name", name);
		SET_NUM(joystick, "index", i);
		SET_NUM(joystick, "controller", SDL_IsGameController(i));

		APPEND(list, joystick);
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
		SDL_JoystickID device_id = SDL_JoystickInstanceID(joystick);
		if (device_id < 0) {
			RETURN_ERROR("SDL_JoystickInstanceID(%d) error: %s\n", index, SDL_GetError());
		}
		SET_NUM(object, "id", device_id);
	}

	{
		SDL_JoystickGUID guid = SDL_JoystickGetGUID(joystick);
		char guid_string[33];
		SDL_JoystickGetGUIDString(guid, guid_string, sizeof(guid_string));
		SET_STRING(object, "guid", guid_string);
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
			MAKE_NUM(axis, value);
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
			MAKE_NUM(button, pressed);
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
joystick_close (int device_id)
{
	SDL_Joystick * joystick = SDL_JoystickFromInstanceID(device_id);
	if (joystick == nullptr) {
		RETURN_ERROR("SDL_JoystickFromInstanceID(%d) error: %s\n", device_id, SDL_GetError());
	}

	SDL_JoystickClose(joystick);

	return nullptr;
}

ErrorMessage *
joystick_getPower (int device_id, int * power)
{
	SDL_Joystick * joystick = SDL_JoystickFromInstanceID(device_id);
	if (joystick == nullptr) {
		RETURN_ERROR("SDL_JoystickFromInstanceID(%d) error: %s\n", device_id, SDL_GetError());
	}

	*power = SDL_JoystickCurrentPowerLevel(joystick);

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

		SDL_JoystickID device_id = SDL_JoystickInstanceID(joystick);
		if (device_id < 0) {
			RETURN_ERROR("SDL_JoystickInstanceID(%d) error: %s\n", index, SDL_GetError());
		}
		SET_NUM(object, "id", device_id);

		SDL_JoystickGUID guid = SDL_JoystickGetGUID(joystick);
		char guid_string[33];
		SDL_JoystickGetGUIDString(guid, guid_string, sizeof(guid_string));
		SET_STRING(object, "guid", guid_string);
	}

	{
		Variant sticks;
		MAKE_MAP(sticks);

		{
			Variant left;
			MAKE_MAP(left);

			Sint16 x = SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_LEFTX);
			SET_NUM(left, "x", x);

			Sint16 y = SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_LEFTY);
			SET_NUM(left, "y", y);

			Sint16 button = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_LEFTSTICK);
			SET_NUM(left, "button", button);

			SET_MAP(sticks, "left", left);
		}

		{
			Variant right;
			MAKE_MAP(right);

			Sint16 x = SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_RIGHTX);
			SET_NUM(right, "x", x);

			Sint16 y = SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_RIGHTY);
			SET_NUM(right, "y", y);

			Sint16 button = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_RIGHTSTICK);
			SET_NUM(right, "button", button);

			SET_MAP(sticks, "right", right);
		}

		SET_MAP(object, "sticks", sticks);
	}

	{
		Variant triggers;
		MAKE_MAP(triggers);

		Sint16 left = SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_TRIGGERLEFT);
		SET_NUM(triggers, "left", left);

		Sint16 right = SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_TRIGGERRIGHT);
		SET_NUM(triggers, "right", right);

		SET_MAP(object, "triggers", triggers);
	}

	{
		Variant shoulders;
		MAKE_MAP(shoulders);

		Sint16 left = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_LEFTSHOULDER);
		SET_NUM(shoulders, "left", left);

		Sint16 right = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_RIGHTSHOULDER);
		SET_NUM(shoulders, "right", right);

		SET_MAP(object, "shoulders", shoulders);
	}

	{
		Variant dpad;
		MAKE_MAP(dpad);

		Sint16 left = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_LEFT);
		SET_NUM(dpad, "left", left);

		Sint16 right = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_RIGHT);
		SET_NUM(dpad, "right", right);

		Sint16 up = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_UP);
		SET_NUM(dpad, "up", up);

		Sint16 down = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_DOWN);
		SET_NUM(dpad, "down", down);

		SET_MAP(object, "dpad", dpad);
	}

	{
		Variant buttons;
		MAKE_MAP(buttons);

		Sint16 a = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_A);
		SET_NUM(buttons, "a", a);

		Sint16 b = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_B);
		SET_NUM(buttons, "b", b);

		Sint16 x = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_X);
		SET_NUM(buttons, "x", x);

		Sint16 y = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_Y);
		SET_NUM(buttons, "y", y);

		Sint16 guide = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_GUIDE);
		SET_NUM(buttons, "guide", guide);

		Sint16 back = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_BACK);
		SET_NUM(buttons, "back", back);

		Sint16 start = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_START);
		SET_NUM(buttons, "start", start);

		SET_MAP(object, "buttons", buttons);
	}

	return nullptr;
}

ErrorMessage *
controller_close (int device_id)
{
	SDL_GameController * controller = SDL_GameControllerFromInstanceID(device_id);
	if (controller == nullptr) {
		RETURN_ERROR("SDL_GameControllerFromInstanceID(%d) error: %s\n", device_id, SDL_GetError());
	}

	SDL_GameControllerClose(controller);

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
cleanup ()
{
	SDL_Quit();

	return nullptr;
}


} // namespace
