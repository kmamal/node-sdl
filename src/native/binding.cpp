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
		*result = nullptr;
		return napi_ok;
	}

	if (std::holds_alternative<SdlHelpers::VariantMap>(variant)) {
		CALL_NAPI(napi_create_object, result);

		auto variant_map = std::get<SdlHelpers::VariantMap>(variant);
		for (auto it = variant_map.begin(); it != variant_map.end(); ++it) {
			napi_value key;
			int length = strlen(it->first);
			CALL_NAPI(napi_create_string_latin1, it->first, length, &key);

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
	if (!pointer) { return; }
	free(pointer);
}


napi_value
getEnums(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;
	napi_value key, value;
	CALL_NAPI(napi_create_object, &result);

	{
		SdlHelpers::Variant pixel_formats;
		CALL_SDL_HELPER(enum_getPixelFormats, pixel_formats);

		CALL_NAPI(fromVariant, pixel_formats, &value);
		CALL_NAPI(napi_create_string_latin1, "pixel_format", 12, &key);
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
		SdlHelpers::Variant audio_formats;
		CALL_SDL_HELPER(enum_getAudioFormats, audio_formats);

		CALL_NAPI(fromVariant, audio_formats, &value);
		CALL_NAPI(napi_create_string_latin1, "audio_format", 12, &key);
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
		SdlHelpers::Variant keycodes;
		CALL_SDL_HELPER(enum_getKeycodes, keycodes);

		CALL_NAPI(fromVariant, keycodes, &value);
		CALL_NAPI(napi_create_string_latin1, "keycode", 7, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant hat_positions;
		CALL_SDL_HELPER(enum_getHatPositions, hat_positions);

		CALL_NAPI(fromVariant, hat_positions, &value);
		CALL_NAPI(napi_create_string_latin1, "hat_position", 12, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	{
		SdlHelpers::Variant power_levels;
		CALL_SDL_HELPER(enum_getPowerLevels, power_levels);

		CALL_NAPI(fromVariant, power_levels, &value);
		CALL_NAPI(napi_create_string_latin1, "power_level", 11, &key);
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
cleanup(napi_env env, napi_callback_info info)
{
	CALL_SDL_HELPER(cleanup);

	cleanup:
	return nullptr;
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
	void * native_pointer = nullptr;

	napi_value argv[11];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	size_t title_length;
	CALL_NAPI(napi_get_value_string_latin1, argv[0], nullptr, 0, &title_length);
	title = (char *) malloc(title_length + 1);
	CALL_NAPI(napi_get_value_string_latin1, argv[0], title, title_length + 1, nullptr);

	int display, width, height;
	CALL_NAPI(napi_get_value_int32, argv[1], &display);
	CALL_NAPI(napi_get_value_int32, argv[2], &width);
	CALL_NAPI(napi_get_value_int32, argv[3], &height);

	napi_valuetype type;

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

	bool visible, fullscreen, resizable, borderless, opengl;
	CALL_NAPI(napi_get_value_bool, argv[6], &visible);
	CALL_NAPI(napi_get_value_bool, argv[7], &fullscreen);
	CALL_NAPI(napi_get_value_bool, argv[8], &resizable);
	CALL_NAPI(napi_get_value_bool, argv[9], &borderless);
	CALL_NAPI(napi_get_value_bool, argv[10], &opengl);

	int window_id;
	int native_pointer_size;
	CALL_SDL_HELPER(window_create,
		title, display,
		&x, &y, &width, &height,
		visible, fullscreen, resizable, borderless, opengl,
		&window_id, &native_pointer, &native_pointer_size
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

	CALL_NAPI(napi_create_int32, width, &value);
	CALL_NAPI(napi_create_string_latin1, "width", 5, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	CALL_NAPI(napi_create_int32, height, &value);
	CALL_NAPI(napi_create_string_latin1, "height", 6, &key);
	CALL_NAPI(napi_set_property, result, key, value);

	if (native_pointer) {
		CALL_NAPI(napi_create_external_buffer,
			native_pointer_size, native_pointer, freePointer, native_pointer,
		&value);
		CALL_NAPI(napi_create_string_latin1, "native", 6, &key);
		CALL_NAPI(napi_set_property, result, key, value);
	}

	cleanup:
	free(title);
	free(x);
	free(y);
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
	CALL_NAPI(napi_get_value_string_latin1, argv[1], nullptr, 0, &title_length);
	title = (char *) malloc(title_length + 1);
	CALL_NAPI(napi_get_value_string_latin1, argv[1], title, title_length + 1, nullptr);

	CALL_SDL_HELPER(window_setTitle, window_id, title);

	cleanup:
	free(title);
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
	napi_value argv[3];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	int width, height;
	CALL_NAPI(napi_get_value_int32, argv[1], &width);
	CALL_NAPI(napi_get_value_int32, argv[2], &height);

	CALL_SDL_HELPER(window_setSize, window_id, width, height);

	cleanup:
	return nullptr;
}

napi_value
window_setFullscreen(napi_env env, napi_callback_info info)
{
	napi_value argv[2];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	bool fullscreen;
	CALL_NAPI(napi_get_value_bool, argv[1], &fullscreen);

	CALL_SDL_HELPER(window_setFullscreen, window_id, fullscreen);

	cleanup:
	return nullptr;
}

napi_value
window_setResizable(napi_env env, napi_callback_info info)
{
	napi_value argv[2];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	bool resizable;
	CALL_NAPI(napi_get_value_bool, argv[1], &resizable);

	CALL_SDL_HELPER(window_setResizable, window_id, resizable);

	cleanup:
	return nullptr;
}

napi_value
window_setBorderless(napi_env env, napi_callback_info info)
{
	napi_value argv[2];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int window_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &window_id);

	bool resizable;
	CALL_NAPI(napi_get_value_bool, argv[1], &resizable);

	CALL_SDL_HELPER(window_setBorderless, window_id, resizable);

	cleanup:
	return nullptr;
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
	CALL_NAPI(napi_get_value_string_latin1, argv[0], nullptr, 0, &name_length);
	name = (char *) malloc(name_length + 1);
	CALL_NAPI(napi_get_value_string_latin1, argv[0], name, name_length + 1, nullptr);

	bool capture;
	CALL_NAPI(napi_get_value_bool, argv[1], &capture);

	int freq, format, channels, samples;
	CALL_NAPI(napi_get_value_int32, argv[2], &freq);
	CALL_NAPI(napi_get_value_int32, argv[3], &format);
	CALL_NAPI(napi_get_value_int32, argv[4], &channels);
	CALL_NAPI(napi_get_value_int32, argv[5], &samples);

	int device_id;
	CALL_SDL_HELPER(audio_openDevice, name, capture, freq, format, channels, samples, &device_id);

	CALL_NAPI(napi_create_uint32, device_id, &result);

	cleanup:
	free(name);
	return result;
}

napi_value
audio_close(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int device_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &device_id);

	CALL_SDL_HELPER(audio_close, device_id);

	cleanup:
	return nullptr;
}

napi_value
audio_play(napi_env env, napi_callback_info info)
{
	napi_value argv[2];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int device_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &device_id);

	bool play;
	CALL_NAPI(napi_get_value_bool, argv[1], &play);

	CALL_SDL_HELPER(audio_play, device_id, play);

	cleanup:
	return nullptr;
}

napi_value
audio_getQueuedSize(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int device_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &device_id);

	unsigned int size;
	CALL_SDL_HELPER(audio_getQueuedSize, device_id, &size);

	CALL_NAPI(napi_create_uint32, size, &result);

	cleanup:
	return result;
}

napi_value
audio_clearQueued(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int device_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &device_id);

	CALL_SDL_HELPER(audio_clearQueued, device_id);

	cleanup:
	return nullptr;
}

napi_value
audio_queue(napi_env env, napi_callback_info info)
{
	napi_value argv[3];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int device_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &device_id);

	void * src;
	CALL_NAPI(napi_get_buffer_info, argv[1], &src, nullptr);

	int size;
	CALL_NAPI(napi_get_value_int32, argv[2], &size);

	CALL_SDL_HELPER(audio_queue, device_id, src, size);

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

	int device_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &device_id);

	void * dst;
	CALL_NAPI(napi_get_buffer_info, argv[1], &dst, nullptr);

	int size;
	CALL_NAPI(napi_get_value_int32, argv[2], &size);

	int num;
	CALL_SDL_HELPER(audio_dequeue, device_id, dst, size, &num);

	CALL_NAPI(napi_create_uint32, num, &result);

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
keyboard_getKeycode(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int scancode;
	CALL_NAPI(napi_get_value_int32, argv[0], &scancode);

	int keycode;
	CALL_SDL_HELPER(keyboard_getKeycode, scancode, &keycode);

	CALL_NAPI(napi_create_uint32, keycode, &result);

	cleanup:
	return result;
}

napi_value
keyboard_getScancode(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int keycode;
	CALL_NAPI(napi_get_value_int32, argv[0], &keycode);

	int scancode;
	CALL_SDL_HELPER(keyboard_getScancode, keycode, &scancode);

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

	SdlHelpers::Variant device;

	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int index;
	CALL_NAPI(napi_get_value_int32, argv[0], &index);

	CALL_SDL_HELPER(joystick_open, index, device);

	CALL_NAPI(fromVariant, device, &result);

	cleanup:
	//
	return result;
}

napi_value
joystick_close(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int device_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &device_id);

	CALL_SDL_HELPER(joystick_close, device_id);

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

	int device_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &device_id);

	int power;
	CALL_SDL_HELPER(joystick_getPower, device_id, &power);

	CALL_NAPI(napi_create_int32, power, &result);

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
	//
	return result;
}

napi_value
controller_close(napi_env env, napi_callback_info info)
{
	napi_value argv[1];
	size_t argc = sizeof(argv) / sizeof(napi_value);
	CALL_NAPI(napi_get_cb_info, info, &argc, argv, nullptr, nullptr);

	int device_id;
	CALL_NAPI(napi_get_value_int32, argv[0], &device_id);

	CALL_SDL_HELPER(controller_close, device_id);

	cleanup:
	return nullptr;
}


napi_value
clipboard_getText(napi_env env, napi_callback_info info)
{
	napi_value result = nullptr;

	const char * text = nullptr;
	CALL_SDL_HELPER(clipboard_getText, &text);

	if (!text) { return nullptr; }

	CALL_NAPI(napi_create_string_latin1, text, strlen(text), &result);

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
	CALL_NAPI(napi_get_value_string_latin1, argv[0], nullptr, 0, &text_length);
	text = (char *) malloc(text_length + 1);
	CALL_NAPI(napi_get_value_string_latin1, argv[0], text, text_length + 1, nullptr);

	CALL_SDL_HELPER(clipboard_setText, text);

	cleanup:
	free(text);
	return nullptr;
}


napi_value
init (napi_env env, napi_value exports)
{
	napi_property_descriptor desc[] = {
		{ "getEnums", NULL, getEnums, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "initialize", NULL, initialize, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "video_getDisplays", NULL, video_getDisplays, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_create", NULL, window_create, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setTitle", NULL, window_setTitle, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setPosition", NULL, window_setPosition, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setSize", NULL, window_setSize, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setFullscreen", NULL, window_setFullscreen, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setResizable", NULL, window_setResizable, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setBorderless", NULL, window_setBorderless, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_focus", NULL, window_focus, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_show", NULL, window_show, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_hide", NULL, window_hide, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_maximize", NULL, window_maximize, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_minimize", NULL, window_minimize, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_restore", NULL, window_restore, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_setIcon", NULL, window_setIcon, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_render", NULL, window_render, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "window_destroy", NULL, window_destroy, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_getDevices", NULL, audio_getDevices, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_openDevice", NULL, audio_openDevice, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_close", NULL, audio_close, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_play", NULL, audio_play, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_getQueuedSize", NULL, audio_getQueuedSize, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_queue", NULL, audio_queue, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "audio_dequeue", NULL, audio_dequeue, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "events_poll", NULL, events_poll, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "events_wait", NULL, events_wait, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "keyboard_getKeycode", NULL, keyboard_getKeycode, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "keyboard_getScancode", NULL, keyboard_getScancode, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "keyboard_getState", NULL, keyboard_getState, NULL, NULL, NULL, napi_enumerable, NULL },
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
		{ "controller_open", NULL, controller_open, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "controller_close", NULL, controller_close, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "clipboard_getText", NULL, clipboard_getText, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "clipboard_setText", NULL, clipboard_setText, NULL, NULL, NULL, napi_enumerable, NULL },
		{ "cleanup", NULL, cleanup, NULL, NULL, NULL, napi_enumerable, NULL }
	};

	CALL_NAPI(napi_define_properties, exports, 46, desc);

	cleanup:
	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
