#include <node_api.h>
#include <cstdlib>
#include <cstdio>
#include <cstdarg>
#include <cstring>
#include "sdl-helpers.h"

#if defined(_WIN32)
	#include "asprintf.h"
#endif

#define CALL_SDL_HELPER(fn, ...) do { \
	SdlHelpers::ErrorMessage * error = SdlHelpers::fn(__VA_ARGS__); \
	if (error) { \
		napi_throw_error(env, nullptr, error->message); \
		delete error; \
		goto cleanup; \
	} \
} while (0)


static napi_status status;

#define CALL_NAPI(fn, ...) do { \
	status = fn(env, __VA_ARGS__); \
	if (status != napi_ok) { \
		const napi_extended_error_info * error_info; \
		napi_get_last_error_info(env, &error_info); \
		char * text; \
		int length = asprintf(&text, #fn " failed: %s", error_info->error_message); \
		napi_throw_error(env, nullptr, length >= 0 ? text : "asprintf failed"); \
		goto cleanup; \
	} \
} while (0)


napi_status
fromVariant(napi_env env, const SdlHelpers::Variant & variant, napi_value * result)
{
	status = napi_generic_failure;

	if (std::holds_alternative<std::monostate>(variant)) {
		CALL_NAPI(napi_get_null, result);
		return napi_ok;
	}

	if (std::holds_alternative<SdlHelpers::VariantMap>(variant)) {
		CALL_NAPI(napi_create_object, result);

		auto variant_map = std::get<SdlHelpers::VariantMap>(variant);
		for (auto it = variant_map.begin(); it != variant_map.end(); ++it) {
			napi_value key;
			int length = strlen(it->first);
			CALL_NAPI(napi_create_string_utf8, it->first, length, &key);

			napi_value value;
			CALL_NAPI(fromVariant, it->second, &value);

			CALL_NAPI(napi_set_property, *result, key, value);
		}
		return napi_ok;
	}

	if (std::holds_alternative<SdlHelpers::VariantList>(variant)) {
		CALL_NAPI(napi_create_array, result);

		auto variant_list = std::get<SdlHelpers::VariantList>(variant);
		for (unsigned i = 0; i < variant_list.size(); ++i) {
			napi_value value;
			CALL_NAPI(fromVariant, variant_list[i], &value);

			CALL_NAPI(napi_set_element, *result, i, value);
		}

		return napi_ok;
	}

	if (std::holds_alternative<double>(variant)) {
		auto number = std::get<double>(variant);
		CALL_NAPI(napi_create_double, number, result);
		return napi_ok;
	}

	if (std::holds_alternative<const char *>(variant)) {
		auto string = std::get<const char *>(variant);
		int length = strlen(string);
		CALL_NAPI(napi_create_string_utf8, string, length, result);
		return napi_ok;
	}

	if (std::holds_alternative<bool>(variant)) {
		bool flag = std::get<bool>(variant);
		CALL_NAPI(napi_create_int32, flag, result);
		CALL_NAPI(napi_coerce_to_bool, *result, result);
		return napi_ok;
	}

	cleanup:
	return status;
}


void
freePointer(napi_env env, void * data, void * pointer) {
	if (pointer) { free(pointer); }
}


napi_value
getEnums(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;
	napi_value key, value;
	CALL_NAPI(napi_create_object, &result);

	{
		SdlHelpers::Variant event_families;
		CALL_SDL_HELPER(enum_getEventFamilies, event_families);

		CALL_NAPI(fromVariant, event_families, &value);
		CALL_NAPI(napi_create_string_latin1, "eventFamily", 11, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant event_types;
		CALL_SDL_HELPER(enum_getEventTypes, event_types);

		CALL_NAPI(fromVariant, event_types, &value);
		CALL_NAPI(napi_create_string_latin1, "eventType", 9, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant pixel_formats;
		CALL_SDL_HELPER(enum_getPixelFormats, pixel_formats);

		CALL_NAPI(fromVariant, pixel_formats, &value);
		CALL_NAPI(napi_create_string_latin1, "pixelFormat", 11, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant audio_formats;
		CALL_SDL_HELPER(enum_getAudioFormats, audio_formats);

		CALL_NAPI(fromVariant, audio_formats, &value);
		CALL_NAPI(napi_create_string_latin1, "audioFormat", 11, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant scancodes;
		CALL_SDL_HELPER(enum_getScancodes, scancodes);

		CALL_NAPI(fromVariant, scancodes, &value);
		CALL_NAPI(napi_create_string_latin1, "scancode", 8, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant buttons;
		CALL_SDL_HELPER(enum_getMouseButtons, buttons);

		CALL_NAPI(fromVariant, buttons, &value);
		CALL_NAPI(napi_create_string_latin1, "button", 6, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant cursors;
		CALL_SDL_HELPER(enum_getCursors, cursors);

		CALL_NAPI(fromVariant, cursors, &value);
		CALL_NAPI(napi_create_string_latin1, "cursor", 6, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant hat_positions;
		CALL_SDL_HELPER(enum_getHatPositions, hat_positions);

		CALL_NAPI(fromVariant, hat_positions, &value);
		CALL_NAPI(napi_create_string_latin1, "hatPosition", 11, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant power_levels;
		CALL_SDL_HELPER(enum_getPowerLevels, power_levels);

		CALL_NAPI(fromVariant, power_levels, &value);
		CALL_NAPI(napi_create_string_latin1, "powerLevel", 10, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant joystick_types;
		CALL_SDL_HELPER(enum_getJoystickTypes, joystick_types);

		CALL_NAPI(fromVariant, joystick_types, &value);
		CALL_NAPI(napi_create_string_latin1, "joystickType", 12, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant controller_axes;
		CALL_SDL_HELPER(enum_getControllerAxes, controller_axes);

		CALL_NAPI(fromVariant, controller_axes, &value);
		CALL_NAPI(napi_create_string_latin1, "controllerAxis", 14, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant controller_buttons;
		CALL_SDL_HELPER(enum_getControllerButtons, controller_buttons);

		CALL_NAPI(fromVariant, controller_buttons, &value);
		CALL_NAPI(napi_create_string_latin1, "controllerButton", 16, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant sensor_types;
		CALL_SDL_HELPER(enum_getSensorTypes, sensor_types);

		CALL_NAPI(fromVariant, sensor_types, &value);
		CALL_NAPI(napi_create_string_latin1, "sensorType", 10, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant power_states;
		CALL_SDL_HELPER(enum_getPowerStates, power_states);

		CALL_NAPI(fromVariant, power_states, &value);
		CALL_NAPI(napi_create_string_latin1, "powerState", 10, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	cleanup:
	return result;
}

napi_value
initialize(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	SdlHelpers::Variant object;
	CALL_SDL_HELPER(initialize, object);

	CALL_NAPI(fromVariant, object, &result);

	cleanup:
	return result;
}


napi_value
events_poll(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	SdlHelpers::Variant event;
	CALL_SDL_HELPER(events_poll, event);

	CALL_NAPI(fromVariant, event, &result);

	cleanup:
	return result;
}

napi_value
events_wait(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	SdlHelpers::Variant event;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int timeout;
	CALL_NAPI(napi_get_value_int32, argv[0], &timeout);

	CALL_SDL_HELPER(events_wait, timeout, event);

	CALL_NAPI(fromVariant, event, &result);

	cleanup:
	return result;
}


napi_value
video_getDisplays(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	SdlHelpers::Variant displays;
	CALL_SDL_HELPER(video_getDisplays, displays);

	CALL_NAPI(fromVariant, displays, &result);

	cleanup:
	return result;
}

napi_value
window_create(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	char * title = nullptr;
	int * x = nullptr;
	int * y = nullptr;
	int * width = nullptr;
	int * height = nullptr;
	void * native_pointer = nullptr;

	napi_value argv[19];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	size_t title_length;
	CALL_NAPI(napi_get_value_string_utf8, argv[0], nullptr, 0, &title_length);
	title = (char *) malloc(title_length + 1);
	CALL_NAPI(napi_get_value_string_utf8, argv[0], title, title_length + 1, nullptr);

	int display;
	CALL_NAPI(napi_get_value_int32, argv[1], &display);

	napi_valuetype type;

	CALL_NAPI(napi_typeof, argv[2], &type);
	if (type != napi_null) {
		width = (int *) malloc(sizeof(int));
		CALL_NAPI(napi_get_value_int32, argv[2], width);
	}

	CALL_NAPI(napi_typeof, argv[3], &type);
	if (type != napi_null) {
		height = (int *) malloc(sizeof(int));
		CALL_NAPI(napi_get_value_int32, argv[3], height);
	}

	CALL_NAPI(napi_typeof, argv[4], &type);
	if (type != napi_null) {
		x = (int *) malloc(sizeof(int));
		CALL_NAPI(napi_get_value_int32, argv[4], x);
	}

	CALL_NAPI(napi_typeof, argv[5], &type);
	if (type != napi_null) {
		y = (int *) malloc(sizeof(int));
		CALL_NAPI(napi_get_value_int32, argv[5], y);
	}

	bool visible, fullscreen, resizable, borderless, always_on_top,
		accelerated, vsync, opengl, webgpu,
		skip_taskbar, popup_menu, tooltip, utility;
	CALL_NAPI(napi_get_value_bool, argv[6], &visible);
	CALL_NAPI(napi_get_value_bool, argv[7], &fullscreen);
	CALL_NAPI(napi_get_value_bool, argv[8], &resizable);
	CALL_NAPI(napi_get_value_bool, argv[9], &borderless);
	CALL_NAPI(napi_get_value_bool, argv[10], &always_on_top);
	CALL_NAPI(napi_get_value_bool, argv[11], &accelerated);
	CALL_NAPI(napi_get_value_bool, argv[12], &vsync);
	CALL_NAPI(napi_get_value_bool, argv[13], &opengl);
	CALL_NAPI(napi_get_value_bool, argv[14], &webgpu);
	CALL_NAPI(napi_get_value_bool, argv[15], &skip_taskbar);
	CALL_NAPI(napi_get_value_bool, argv[16], &popup_menu);
	CALL_NAPI(napi_get_value_bool, argv[17], &tooltip);
	CALL_NAPI(napi_get_value_bool, argv[18], &utility);

	int pixel_width, pixel_height, window_id, native_size;

	CALL_SDL_HELPER(window_create,
		title, display,
		&x, &y, &width, &height,
		&pixel_width, &pixel_height,
		visible, &fullscreen, &resizable, &borderless, &always_on_top,
		&accelerated, &vsync, opengl, webgpu,
		&skip_taskbar, &popup_menu, &tooltip, &utility,
		&window_id, &native_pointer, &native_size
	);

	napi_value key, value;
	CALL_NAPI(napi_create_object, &result);

	CALL_NAPI(napi_create_int32, window_id, &value);
	CALL_NAPI(napi_create_string_latin1, "id", 2, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, *x, &value);
	CALL_NAPI(napi_create_string_latin1, "x", 1, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, *y, &value);
	CALL_NAPI(napi_create_string_latin1, "y", 1, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, *width, &value);
	CALL_NAPI(napi_create_string_latin1, "width", 5, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, *height, &value);
	CALL_NAPI(napi_create_string_latin1, "height", 6, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, pixel_width, &value);
	CALL_NAPI(napi_create_string_latin1, "pixelWidth", 10, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, pixel_height, &value);
	CALL_NAPI(napi_create_string_latin1, "pixelHeight", 11, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, fullscreen, &value);
	CALL_NAPI(napi_coerce_to_bool, value, &value);
	CALL_NAPI(napi_create_string_latin1, "fullscreen", 10, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, resizable, &value);
	CALL_NAPI(napi_coerce_to_bool, value, &value);
	CALL_NAPI(napi_create_string_latin1, "resizable", 9, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, borderless, &value);
	CALL_NAPI(napi_coerce_to_bool, value, &value);
	CALL_NAPI(napi_create_string_latin1, "borderless", 10, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, always_on_top, &value);
	CALL_NAPI(napi_coerce_to_bool, value, &value);
	CALL_NAPI(napi_create_string_latin1, "alwaysOnTop", 11, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, accelerated, &value);
	CALL_NAPI(napi_coerce_to_bool, value, &value);
	CALL_NAPI(napi_create_string_latin1, "accelerated", 11, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, vsync, &value);
	CALL_NAPI(napi_coerce_to_bool, value, &value);
	CALL_NAPI(napi_create_string_latin1, "vsync", 5, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, skip_taskbar, &value);
	CALL_NAPI(napi_coerce_to_bool, value, &value);
	CALL_NAPI(napi_create_string_latin1, "skipTaskbar", 11, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, popup_menu, &value);
	CALL_NAPI(napi_coerce_to_bool, value, &value);
	CALL_NAPI(napi_create_string_latin1, "popupMenu", 9, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, tooltip, &value);
	CALL_NAPI(napi_coerce_to_bool, value, &value);
	CALL_NAPI(napi_create_string_latin1, "tooltip", 7, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, utility, &value);
	CALL_NAPI(napi_coerce_to_bool, value, &value);
	CALL_NAPI(napi_create_string_latin1, "utility", 7, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	if (native_pointer) {
		CALL_NAPI(napi_create_external_buffer,
			native_size, native_pointer, freePointer, native_pointer,
		&value);
		CALL_NAPI(napi_create_string_latin1, "native", 6, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	cleanup:
	if (title) { free(title); }
	if (x) { free(x); }
	if (y) { free(y); }
	if (width) { free(width); }
	if (height) { free(height); }
	return result;
}

napi_value
window_setTitle(napi_env env, napi_callback_info info)
{
	char * title = nullptr;

	napi_value argv[2];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	size_t title_length;
	CALL_NAPI(napi_get_value_string_utf8, argv[1], nullptr, 0, &title_length);
	title = (char *) malloc(title_length + 1);
	CALL_NAPI(napi_get_value_string_utf8, argv[1], title, title_length + 1, nullptr);

	CALL_SDL_HELPER(window_setTitle, window_id, title);

	cleanup:
	if (title) { free(title); }
	return nullptr;
}

napi_value
window_setPosition(napi_env env, napi_callback_info info)
{
	napi_value argv[3];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	int x, y;
	CALL_NAPI(napi_get_value_int32, argv[1], &x);
	CALL_NAPI(napi_get_value_int32, argv[2], &y);

	CALL_SDL_HELPER(window_setPosition, window_id, x, y);

	cleanup:
	return nullptr;
}

napi_value
window_setSize(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[3];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	int width, height;
	CALL_NAPI(napi_get_value_int32, argv[1], &width);
	CALL_NAPI(napi_get_value_int32, argv[2], &height);

	int pixel_width, pixel_height;
	CALL_SDL_HELPER(window_setSize,
		window_id, width, height,
		&pixel_width, &pixel_height
	);

	napi_value key, value;
	CALL_NAPI(napi_create_object, &result);

	CALL_NAPI(napi_create_int32, pixel_width, &value);
	CALL_NAPI(napi_create_string_latin1, "pixelWidth", 10, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, pixel_height, &value);
	CALL_NAPI(napi_create_string_latin1, "pixelHeight", 11, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	cleanup:
	return result;
}

napi_value
window_setFullscreen(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[2];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	bool fullscreen;
	CALL_NAPI(napi_get_value_bool, argv[1], &fullscreen);

	CALL_SDL_HELPER(window_setFullscreen, window_id, &fullscreen);

	CALL_NAPI(napi_create_int32, fullscreen, &result);
	CALL_NAPI(napi_coerce_to_bool, result, &result);

	cleanup:
	return result;
}

napi_value
window_setResizable(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[2];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	bool resizable;
	CALL_NAPI(napi_get_value_bool, argv[1], &resizable);

	CALL_SDL_HELPER(window_setResizable, window_id, &resizable);

	CALL_NAPI(napi_create_int32, resizable, &result);
	CALL_NAPI(napi_coerce_to_bool, result, &result);

	cleanup:
	return result;
}

napi_value
window_setBorderless(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[2];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	bool borderless;
	CALL_NAPI(napi_get_value_bool, argv[1], &borderless);

	CALL_SDL_HELPER(window_setBorderless, window_id, &borderless);

	CALL_NAPI(napi_create_int32, borderless, &result);
	CALL_NAPI(napi_coerce_to_bool, result, &result);

	cleanup:
	return result;
}

napi_value
window_setAcceleratedAndVsync(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[3];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	bool accelerated, vsync;
	CALL_NAPI(napi_get_value_bool, argv[1], &accelerated);
	CALL_NAPI(napi_get_value_bool, argv[2], &vsync);

	CALL_SDL_HELPER(window_setAcceleratedAndVsync, window_id, &accelerated, &vsync);

	CALL_NAPI(napi_create_array, &result);
	napi_value value;

	CALL_NAPI(napi_create_int32, accelerated, &value);
	CALL_NAPI(napi_coerce_to_bool, value, &value);
	CALL_NAPI(napi_set_element, result, 0, value);

	CALL_NAPI(napi_create_int32, vsync, &value);
	CALL_NAPI(napi_coerce_to_bool, value, &value);
	CALL_NAPI(napi_set_element, result, 1, value);

	cleanup:
	return result;
}

napi_value
window_focus(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	CALL_SDL_HELPER(window_focus, window_id);

	cleanup:
	return nullptr;
}

napi_value
window_show(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	CALL_SDL_HELPER(window_show, window_id);

	cleanup:
	return nullptr;
}

napi_value
window_hide(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	CALL_SDL_HELPER(window_hide, window_id);

	cleanup:
	return nullptr;
}

napi_value
window_maximize(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	CALL_SDL_HELPER(window_maximize, window_id);

	cleanup:
	return nullptr;
}

napi_value
window_minimize(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	CALL_SDL_HELPER(window_minimize, window_id);

	cleanup:
	return nullptr;
}

napi_value
window_restore(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	CALL_SDL_HELPER(window_restore, window_id);

	cleanup:
	return nullptr;
}

napi_value
window_render(napi_env env, napi_callback_info info)
{
	napi_value argv[6];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	int w, h, stride;
	CALL_NAPI(napi_get_value_int32, argv[1], &w);
	CALL_NAPI(napi_get_value_int32, argv[2], &h);
	CALL_NAPI(napi_get_value_int32, argv[3], &stride);

	unsigned int format;
	CALL_NAPI(napi_get_value_uint32, argv[4], &format);

	void * pixels;
	CALL_NAPI(napi_get_buffer_info, argv[5], &pixels, nullptr);

	CALL_SDL_HELPER(window_render, window_id, w, h, stride, format, pixels);

	cleanup:
	return nullptr;
}

napi_value
window_setIcon(napi_env env, napi_callback_info info)
{
	napi_value argv[6];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	int w, h, stride;
	CALL_NAPI(napi_get_value_int32, argv[1], &w);
	CALL_NAPI(napi_get_value_int32, argv[2], &h);
	CALL_NAPI(napi_get_value_int32, argv[3], &stride);

	unsigned int format;
	CALL_NAPI(napi_get_value_uint32, argv[4], &format);

	void * pixels;
	CALL_NAPI(napi_get_buffer_info, argv[5], &pixels, nullptr);

	CALL_SDL_HELPER(window_setIcon, window_id, w, h, stride, format, pixels);

	cleanup:
	return nullptr;
}

napi_value
window_flash(napi_env env, napi_callback_info info)
{
	napi_value argv[2];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	int type;
	CALL_NAPI(napi_get_value_int32, argv[1], &type);

	CALL_SDL_HELPER(window_flash, window_id, type);

	cleanup:
	return nullptr;
}

napi_value
window_destroy(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	CALL_SDL_HELPER(window_destroy, window_id);

	cleanup:
	return nullptr;
}


napi_value
keyboard_getKey(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;
	const char * key = nullptr;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int scancode;
	CALL_NAPI(napi_get_value_int32, argv[0], &scancode);

	CALL_SDL_HELPER(keyboard_getKey, scancode, &key);

	if (key) {
		CALL_NAPI(napi_create_string_utf8, key, strlen(key), &result);
	} else {
		CALL_NAPI(napi_get_null, &result);
	}

	cleanup:
	return result;
}

napi_value
keyboard_getScancode(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;
	char * key = nullptr;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	size_t key_length;
	CALL_NAPI(napi_get_value_string_utf8, argv[0], nullptr, 0, &key_length);
	key = (char *) malloc(key_length + 1);
	CALL_NAPI(napi_get_value_string_utf8, argv[0], key, key_length + 1, nullptr);

	int scancode;
	CALL_SDL_HELPER(keyboard_getScancode, key, &scancode);

	CALL_NAPI(napi_create_uint32, scancode, &result);

	cleanup:
	return result;
}

napi_value
keyboard_getState(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	SdlHelpers::Variant state;
	CALL_SDL_HELPER(keyboard_getState, state);

	CALL_NAPI(fromVariant, state, &result);

	cleanup:
	return result;
}


napi_value
mouse_getButton(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int button;
	CALL_NAPI(napi_get_value_int32, argv[0], &button);

	int state;
	CALL_SDL_HELPER(mouse_getButton, button, &state);

	CALL_NAPI(napi_create_int32, state, &result);
	CALL_NAPI(napi_coerce_to_bool, result, &result);

	cleanup:
	return result;
}

napi_value
mouse_getPosition(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	SdlHelpers::Variant position;
	CALL_SDL_HELPER(mouse_getPosition, position);

	CALL_NAPI(fromVariant, position, &result);

	cleanup:
	return result;
}

napi_value
mouse_setPosition(napi_env env, napi_callback_info info)
{
	napi_value argv[2];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int x, y;
	CALL_NAPI(napi_get_value_int32, argv[0], &x);
	CALL_NAPI(napi_get_value_int32, argv[1], &y);

	CALL_SDL_HELPER(mouse_setPosition, x, y);

	cleanup:
	return nullptr;
}

napi_value
mouse_capture(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	bool capture;
	CALL_NAPI(napi_get_value_bool, argv[0], &capture);

	CALL_SDL_HELPER(mouse_capture, capture);

	cleanup:
	return nullptr;
}

napi_value
mouse_setCursor(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int cursor_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &cursor_id);

	CALL_SDL_HELPER(mouse_setCursor, cursor_id);

	cleanup:
	return nullptr;
}

napi_value
mouse_setCursorImage(napi_env env, napi_callback_info info)
{
	napi_value argv[7];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int w, h, stride;
	CALL_NAPI(napi_get_value_int32, argv[0], &w);
	CALL_NAPI(napi_get_value_int32, argv[1], &h);
	CALL_NAPI(napi_get_value_int32, argv[2], &stride);

	unsigned int format;
	CALL_NAPI(napi_get_value_uint32, argv[3], &format);

	void * pixels;
	CALL_NAPI(napi_get_buffer_info, argv[4], &pixels, nullptr);

	int x, y;
	CALL_NAPI(napi_get_value_int32, argv[5], &x);
	CALL_NAPI(napi_get_value_int32, argv[6], &y);

	CALL_SDL_HELPER(mouse_setCursorImage, w, h, stride, format, pixels, x, y);

	cleanup:
	return nullptr;
}

napi_value
mouse_showCursor(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	bool show;
	CALL_NAPI(napi_get_value_bool, argv[0], &show);

	CALL_SDL_HELPER(mouse_showCursor, show);

	cleanup:
	return nullptr;
}


napi_value
joystick_getDevices(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	SdlHelpers::Variant devices;
	CALL_SDL_HELPER(joystick_getDevices, devices);

	CALL_NAPI(fromVariant, devices, &result);

	cleanup:
	return result;
}

napi_value
joystick_open(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	SdlHelpers::Variant object;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int index;
	CALL_NAPI(napi_get_value_int32, argv[0], &index);

	CALL_SDL_HELPER(joystick_open, index, object);

	CALL_NAPI(fromVariant, object, &result);

	cleanup:
	return result;
}

napi_value
joystick_close(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int joystick_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &joystick_id);

	CALL_SDL_HELPER(joystick_close, joystick_id);

	cleanup:
	return nullptr;
}

napi_value
joystick_getPower(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int joystick_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &joystick_id);

	int power;
	CALL_SDL_HELPER(joystick_getPower, joystick_id, &power);

	CALL_NAPI(napi_create_int32, power, &result);

	cleanup:
	return result;
}

napi_value
joystick_setLed(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[4];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int joystick_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &joystick_id);

	double red, green, blue;
	CALL_NAPI(napi_get_value_double, argv[1], &red);
	CALL_NAPI(napi_get_value_double, argv[2], &green);
	CALL_NAPI(napi_get_value_double, argv[3], &blue);

	CALL_SDL_HELPER(joystick_setLed, joystick_id, red, green, blue);

	cleanup:
	return result;
}

napi_value
joystick_setPlayer(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[2];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int joystick_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &joystick_id);

	int player;
	CALL_NAPI(napi_get_value_int32, argv[1], &player);

	CALL_SDL_HELPER(joystick_setPlayer, joystick_id, player);

	cleanup:
	return result;
}

napi_value
joystick_rumble(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[4];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int joystick_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &joystick_id);

	double low_freq_rumble, high_freq_rumble, duration;
	CALL_NAPI(napi_get_value_double, argv[1], &low_freq_rumble);
	CALL_NAPI(napi_get_value_double, argv[2], &high_freq_rumble);
	CALL_NAPI(napi_get_value_double, argv[3], &duration);

	CALL_SDL_HELPER(joystick_rumble, joystick_id, low_freq_rumble, high_freq_rumble, duration);

	cleanup:
	return result;
}

napi_value
joystick_rumbleTriggers(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[4];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int joystick_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &joystick_id);

	double left_rumble, right_rumble, duration;
	CALL_NAPI(napi_get_value_double, argv[1], &left_rumble);
	CALL_NAPI(napi_get_value_double, argv[2], &right_rumble);
	CALL_NAPI(napi_get_value_double, argv[3], &duration);

	CALL_SDL_HELPER(joystick_rumbleTriggers, joystick_id, left_rumble, right_rumble, duration);

	cleanup:
	return result;
}


napi_value
controller_open(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	SdlHelpers::Variant device;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int index;
	CALL_NAPI(napi_get_value_int32, argv[0], &index);

	CALL_SDL_HELPER(controller_open, index, device);

	CALL_NAPI(fromVariant, device, &result);

	cleanup:
	return result;
}

napi_value
controller_close(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int controller_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &controller_id);

	CALL_SDL_HELPER(controller_close, controller_id);

	cleanup:
	return nullptr;
}

napi_value
controller_addMappings(napi_env env, napi_callback_info info)
{
	char ** mappings = nullptr;
	int num_allocated = 0;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	unsigned int array_length;
	CALL_NAPI(napi_get_array_length, argv[0], &array_length);

	mappings = (char **) malloc(array_length * sizeof(char *));
	napi_value value;
	size_t string_length;
	for (unsigned int i = 0; i < array_length; i++) {
		CALL_NAPI(napi_get_element, argv[0], i, &value);
		CALL_NAPI(napi_get_value_string_utf8, value, nullptr, 0, &string_length);
		mappings[i] = (char *) malloc(string_length + 1);
		num_allocated++;
		CALL_NAPI(napi_get_value_string_utf8, value, mappings[i], string_length + 1, nullptr);
	}

	CALL_SDL_HELPER(controller_addMappings, mappings, array_length);

	cleanup:
	if (mappings) {
		for (int i = 0; i < num_allocated; i++) { free(mappings[i]); }
		free(mappings);
	}
	return nullptr;
}


napi_value
sensor_getDevices(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	SdlHelpers::Variant devices;
	CALL_SDL_HELPER(sensor_getDevices, devices);

	CALL_NAPI(fromVariant, devices, &result);

	cleanup:
	return result;
}

napi_value
sensor_open(napi_env env, napi_callback_info info)
{
	SdlHelpers::Variant object;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int index;
	CALL_NAPI(napi_get_value_int32, argv[0], &index);

	CALL_SDL_HELPER(sensor_open, index);

	cleanup:
	return nullptr;
}

napi_value
sensor_getData(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	SdlHelpers::Variant object;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int sensor_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &sensor_id);

	CALL_SDL_HELPER(sensor_getData, sensor_id, object);

	CALL_NAPI(fromVariant, object, &result);

	cleanup:
	return result;
}

napi_value
sensor_close(napi_env env, napi_callback_info info)
{
	SdlHelpers::Variant object;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int sensor_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &sensor_id);

	CALL_SDL_HELPER(sensor_close, sensor_id);

	cleanup:
	return nullptr;
}


napi_value
audio_getDevices(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;
	SdlHelpers::Variant devices;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	bool capture;
	CALL_NAPI(napi_get_value_bool, argv[0], &capture);

	CALL_SDL_HELPER(audio_getDevices, capture, devices);

	CALL_NAPI(fromVariant, devices, &result);

	cleanup:
	return result;
}

napi_value
audio_openDevice(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	char * name = nullptr;

	napi_value argv[6];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	size_t name_length;
	CALL_NAPI(napi_get_value_string_utf8, argv[0], nullptr, 0, &name_length);
	if (name_length > 0) {
		name = (char *) malloc(name_length + 1);
		CALL_NAPI(napi_get_value_string_utf8, argv[0], name, name_length + 1, nullptr);
	}

	bool capture;
	CALL_NAPI(napi_get_value_bool, argv[1], &capture);

	int freq, format, channels, samples;
	CALL_NAPI(napi_get_value_int32, argv[2], &freq);
	CALL_NAPI(napi_get_value_int32, argv[3], &format);
	CALL_NAPI(napi_get_value_int32, argv[4], &channels);
	CALL_NAPI(napi_get_value_int32, argv[5], &samples);

	int audio_id;
	CALL_SDL_HELPER(audio_openDevice, name, capture, freq, format, channels, samples, &audio_id);

	CALL_NAPI(napi_create_uint32, audio_id, &result);

	cleanup:
	if (name) { free(name); }
	return result;
}

napi_value
audio_close(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int audio_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &audio_id);

	CALL_SDL_HELPER(audio_close, audio_id);

	cleanup:
	return nullptr;
}

napi_value
audio_play(napi_env env, napi_callback_info info)
{
	napi_value argv[2];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int audio_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &audio_id);

	bool play;
	CALL_NAPI(napi_get_value_bool, argv[1], &play);

	CALL_SDL_HELPER(audio_play, audio_id, play);

	cleanup:
	return nullptr;
}

napi_value
audio_getQueueSize(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int audio_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &audio_id);

	unsigned int size;
	CALL_SDL_HELPER(audio_getQueueSize, audio_id, &size);

	CALL_NAPI(napi_create_uint32, size, &result);

	cleanup:
	return result;
}

napi_value
audio_clearQueue(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int audio_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &audio_id);

	CALL_SDL_HELPER(audio_clearQueue, audio_id);

	cleanup:
	return nullptr;
}

napi_value
audio_enqueue(napi_env env, napi_callback_info info)
{
	napi_value argv[3];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int audio_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &audio_id);

	void * src;
	CALL_NAPI(napi_get_buffer_info, argv[1], &src, nullptr);

	int size;
	CALL_NAPI(napi_get_value_int32, argv[2], &size);

	CALL_SDL_HELPER(audio_enqueue, audio_id, src, size);

	cleanup:
	return nullptr;
}

napi_value
audio_dequeue(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[3];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int audio_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &audio_id);

	void * dst;
	CALL_NAPI(napi_get_buffer_info, argv[1], &dst, nullptr);

	int size;
	CALL_NAPI(napi_get_value_int32, argv[2], &size);

	int num;
	CALL_SDL_HELPER(audio_dequeue, audio_id, dst, size, &num);

	CALL_NAPI(napi_create_uint32, num, &result);

	cleanup:
	return result;
}


napi_value
clipboard_getText(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	const char * text = nullptr;
	CALL_SDL_HELPER(clipboard_getText, &text);

	if (!text) { return nullptr; }

	CALL_NAPI(napi_create_string_utf8, text, strlen(text), &result);

	cleanup:
	return result;
}

napi_value
clipboard_setText(napi_env env, napi_callback_info info)
{
	char * text = nullptr;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	size_t text_length;
	CALL_NAPI(napi_get_value_string_utf8, argv[0], nullptr, 0, &text_length);
	text = (char *) malloc(text_length + 1);
	CALL_NAPI(napi_get_value_string_utf8, argv[0], text, text_length + 1, nullptr);

	CALL_SDL_HELPER(clipboard_setText, text);

	cleanup:
	if (text) { free(text); }
	return nullptr;
}


napi_value
power_getInfo(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	SdlHelpers::Variant power;
	CALL_SDL_HELPER(power_getInfo, power);

	CALL_NAPI(fromVariant, power, &result);

	cleanup:
	return result;
}


napi_value
cleanup(napi_env env, napi_callback_info info)
{
	CALL_SDL_HELPER(cleanup);

	cleanup:
	return nullptr;
}


napi_value
init (napi_env env, napi_value exports)
{
	napi_property_descriptor desc[] = {
		{ "getEnums", NULL, getEnums, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "initialize", NULL, initialize, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "events_poll", NULL, events_poll, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "events_wait", NULL, events_wait, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "video_getDisplays", NULL, video_getDisplays, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_create", NULL, window_create, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setTitle", NULL, window_setTitle, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setPosition", NULL, window_setPosition, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setSize", NULL, window_setSize, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setFullscreen", NULL, window_setFullscreen, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setResizable", NULL, window_setResizable, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setBorderless", NULL, window_setBorderless, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setAcceleratedAndVsync", NULL, window_setAcceleratedAndVsync, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_focus", NULL, window_focus, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_show", NULL, window_show, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_hide", NULL, window_hide, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_maximize", NULL, window_maximize, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_minimize", NULL, window_minimize, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_restore", NULL, window_restore, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_render", NULL, window_render, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setIcon", NULL, window_setIcon, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_flash", NULL, window_flash, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_destroy", NULL, window_destroy, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "keyboard_getKey", NULL, keyboard_getKey, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "keyboard_getScancode", NULL, keyboard_getScancode, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "keyboard_getState", NULL, keyboard_getState, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "mouse_getButton", NULL, mouse_getButton, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "mouse_getPosition", NULL, mouse_getPosition, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "mouse_setPosition", NULL, mouse_setPosition, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "mouse_capture", NULL, mouse_capture, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "mouse_setCursor", NULL, mouse_setCursor, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "mouse_setCursorImage", NULL, mouse_setCursorImage, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "mouse_showCursor", NULL, mouse_showCursor, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "joystick_getDevices", NULL, joystick_getDevices, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "joystick_open", NULL, joystick_open, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "joystick_close", NULL, joystick_close, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "joystick_getPower", NULL, joystick_getPower, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "joystick_setLed", NULL, joystick_setLed, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "joystick_setPlayer", NULL, joystick_setPlayer, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "joystick_rumble", NULL, joystick_rumble, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "joystick_rumbleTriggers", NULL, joystick_rumbleTriggers, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "controller_open", NULL, controller_open, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "controller_close", NULL, controller_close, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "controller_addMappings", NULL, controller_addMappings, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "sensor_getDevices", NULL, sensor_getDevices, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "sensor_open", NULL, sensor_open, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "sensor_getData", NULL, sensor_getData, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "sensor_close", NULL, sensor_close, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_getDevices", NULL, audio_getDevices, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_openDevice", NULL, audio_openDevice, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_close", NULL, audio_close, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_play", NULL, audio_play, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_getQueueSize", NULL, audio_getQueueSize, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_enqueue", NULL, audio_enqueue, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_dequeue", NULL, audio_dequeue, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_clearQueue", NULL, audio_clearQueue, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "clipboard_getText", NULL, clipboard_getText, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "clipboard_setText", NULL, clipboard_setText, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "power_getInfo", NULL, power_getInfo, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "cleanup", NULL, cleanup, NULL, NULL, NULL, napi_enumerable, NULL }
	};

	CALL_NAPI(napi_define_properties, exports, 60, desc);

	cleanup:
	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
