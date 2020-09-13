#include <nodejs/src/node_api.h>
#include <cstdlib>
#include <cstdio>
#include <cstdarg>
#include <cstring>
#include "sdl-helpers.h"


#define CALL_SDL_HELPER(env, fn, ...) do { \
  logger_env = env; \
	SdlHelpers::ErrorMessage * error = SdlHelpers::fn(logger, ## __VA_ARGS__); \
	if (error) { \
    napi_throw_error(env, nullptr, error->message); \
		delete error; \
	} \
  logger_env = nullptr; \
} while (0)


#define CALL_NAPI(ret, fn, env, ...) do { \
  napi_status status = fn(env, __VA_ARGS__); \
  if (status != napi_ok) { \
    const napi_extended_error_info * error_info; \
    napi_get_last_error_info(env, &error_info); \
    char * text; \
    int length = asprintf(&text, #fn " failed: %s", error_info->error_message); \
    napi_throw_error(env, nullptr, length >= 0 ? text : "asprintf failed"); \
    return ret; \
  } \
} while (0)


napi_status
fromVariant(napi_env env, const SdlHelpers::Variant & variant, napi_value * result)
{
  if (std::holds_alternative<std::monostate>(variant)) {
    *result = nullptr;
    return napi_ok;
  }

  if (std::holds_alternative<SdlHelpers::VariantMap>(variant)) {
    CALL_NAPI(status, napi_create_object, env, result);

    auto variant_map = std::get<SdlHelpers::VariantMap>(variant);
    for (auto it = variant_map.begin(); it != variant_map.end(); ++it) {
      napi_value key;
      int length = strlen(it->first);
      CALL_NAPI(status, napi_create_string_latin1, env, it->first, length, &key);

      napi_value value;
      CALL_NAPI(status, fromVariant, env, it->second, &value);

      CALL_NAPI(status, napi_set_property, env, *result, key, value);
    }
    return napi_ok;
  }

  if (std::holds_alternative<SdlHelpers::VariantList>(variant)) {
    CALL_NAPI(status, napi_create_array, env, result);

    //

    return napi_ok;
  }

  if (std::holds_alternative<double>(variant)) {
    auto number = std::get<double>(variant);
    CALL_NAPI(status, napi_create_double, env, number, result);
    return napi_ok;
  }

  if (std::holds_alternative<const char *>(variant)) {
    auto string = std::get<const char *>(variant);
    int length = strlen(string);
    CALL_NAPI(status, napi_create_string_latin1, env, string, length, result);
    return napi_ok;
  }

  return napi_generic_failure;
}

napi_ref logger_func_ref;
napi_env logger_env = nullptr;

int logger (const char * format, ...)
{
  napi_value logger_func;
  CALL_NAPI(-1, napi_get_reference_value, logger_env, logger_func_ref, &logger_func);

  char * text;
  va_list args;
  va_start (args, format);
  int length = vasprintf(&text, format, args);
  va_end (args);

  napi_value string;
  CALL_NAPI(-1, napi_create_string_latin1, logger_env, text, length, &string);

  napi_value undefined;
  CALL_NAPI(-1, napi_get_undefined, logger_env, &undefined);
  CALL_NAPI(-1, napi_call_function, logger_env, undefined, logger_func, 1, &string, nullptr);

  free(text);
  return length;
}


napi_value
initialize(napi_env env, napi_callback_info info)
{
  size_t argc = 1;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  CALL_NAPI(nullptr, napi_create_reference, env, argv[0], 1, &logger_func_ref);

  napi_value object, key, value;
  CALL_NAPI(nullptr, napi_create_object, env, &object);

  {
    SdlHelpers::Variant pixel_formats;
    CALL_SDL_HELPER(env, getPixelFormats, pixel_formats);

    CALL_NAPI(nullptr, fromVariant, env, pixel_formats, &value);
    CALL_NAPI(nullptr, napi_create_string_latin1, env, "pixel-formats", 13, &key);
    CALL_NAPI(nullptr, napi_set_property, env, object, key, value);
  }

  {
    SdlHelpers::Variant audio_formats;
    CALL_SDL_HELPER(env, getAudioFormats, audio_formats);

    CALL_NAPI(nullptr, fromVariant, env, audio_formats, &value);
    CALL_NAPI(nullptr, napi_create_string_latin1, env, "audio-formats", 13, &key);
    CALL_NAPI(nullptr, napi_set_property, env, object, key, value);
  }

  return object;
}

napi_value
window_create(napi_env env, napi_callback_info info)
{
  size_t argc = 8;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  size_t title_length;
  CALL_NAPI(nullptr, napi_get_value_string_latin1, env, argv[0], nullptr, 0, &title_length);
  char title[title_length + 1];
  CALL_NAPI(nullptr, napi_get_value_string_latin1, env, argv[0], title, title_length + 1, nullptr);

  int x, y, width, height;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[1], &x);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[2], &y);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[3], &width);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[4], &height);

  bool fullscreen, resizable, borderless;
  CALL_NAPI(nullptr, napi_get_value_bool, env, argv[5], &fullscreen);
  CALL_NAPI(nullptr, napi_get_value_bool, env, argv[6], &resizable);
  CALL_NAPI(nullptr, napi_get_value_bool, env, argv[7], &borderless);

  int window_id;
  CALL_SDL_HELPER(
    env, window_create,
    title,
    &x, &y, &width, &height,
    fullscreen, resizable, borderless,
    &window_id
  );

  napi_value object, key, value;
  CALL_NAPI(nullptr, napi_create_object, env, &object);

  CALL_NAPI(nullptr, napi_create_int32, env, window_id, &value);
  CALL_NAPI(nullptr, napi_create_string_latin1, env, "id", 2, &key);
  CALL_NAPI(nullptr, napi_set_property, env, object, key, value);

  CALL_NAPI(nullptr, napi_create_int32, env, x, &value);
  CALL_NAPI(nullptr, napi_create_string_latin1, env, "x", 1, &key);
  CALL_NAPI(nullptr, napi_set_property, env, object, key, value);

  CALL_NAPI(nullptr, napi_create_int32, env, y, &value);
  CALL_NAPI(nullptr, napi_create_string_latin1, env, "y", 1, &key);
  CALL_NAPI(nullptr, napi_set_property, env, object, key, value);

  CALL_NAPI(nullptr, napi_create_int32, env, width, &value);
  CALL_NAPI(nullptr, napi_create_string_latin1, env, "width", 5, &key);
  CALL_NAPI(nullptr, napi_set_property, env, object, key, value);

  CALL_NAPI(nullptr, napi_create_int32, env, height, &value);
  CALL_NAPI(nullptr, napi_create_string_latin1, env, "height", 6, &key);
  CALL_NAPI(nullptr, napi_set_property, env, object, key, value);

  return object;
}

napi_value
window_setTitle(napi_env env, napi_callback_info info)
{
  size_t argc = 2;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  size_t title_length;
  CALL_NAPI(nullptr, napi_get_value_string_latin1, env, argv[1], nullptr, 0, &title_length);
  char title[title_length + 1];
  CALL_NAPI(nullptr, napi_get_value_string_latin1, env, argv[1], title, title_length + 1, nullptr);

  CALL_SDL_HELPER(env, window_setTitle, window_id, title);

  return nullptr;
}

napi_value
window_setPosition(napi_env env, napi_callback_info info)
{
  size_t argc = 2;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  int x, y;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[1], &x);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[2], &y);

  CALL_SDL_HELPER(env, window_setPosition, window_id, x, y);

  return nullptr;
}

napi_value
window_setSize(napi_env env, napi_callback_info info)
{
  size_t argc = 2;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  int width, height;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[1], &width);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[2], &height);

  CALL_SDL_HELPER(env, window_setSize, window_id, width, height);

  return nullptr;
}

napi_value
window_setFullscreen(napi_env env, napi_callback_info info)
{
  size_t argc = 2;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  bool fullscreen;
  CALL_NAPI(nullptr, napi_get_value_bool, env, argv[1], &fullscreen);

  CALL_SDL_HELPER(env, window_setFullscreen, window_id, fullscreen);

  return nullptr;
}

napi_value
window_setResizable(napi_env env, napi_callback_info info)
{
  size_t argc = 2;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  bool resizable;
  CALL_NAPI(nullptr, napi_get_value_bool, env, argv[1], &resizable);

  CALL_SDL_HELPER(env, window_setResizable, window_id, resizable);

  return nullptr;
}

napi_value
window_focus(napi_env env, napi_callback_info info)
{
  size_t argc = 1;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  CALL_SDL_HELPER(env, window_focus, window_id);

  return nullptr;
}

napi_value
window_show(napi_env env, napi_callback_info info)
{
  size_t argc = 1;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  CALL_SDL_HELPER(env, window_show, window_id);

  return nullptr;
}

napi_value
window_hide(napi_env env, napi_callback_info info)
{
  size_t argc = 1;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  CALL_SDL_HELPER(env, window_hide, window_id);

  return nullptr;
}

napi_value
window_maximize(napi_env env, napi_callback_info info)
{
  size_t argc = 1;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  CALL_SDL_HELPER(env, window_maximize, window_id);

  return nullptr;
}

napi_value
window_minimize(napi_env env, napi_callback_info info)
{
  size_t argc = 1;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  CALL_SDL_HELPER(env, window_minimize, window_id);

  return nullptr;
}

napi_value
window_restore(napi_env env, napi_callback_info info)
{
  size_t argc = 1;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  CALL_SDL_HELPER(env, window_restore, window_id);

  return nullptr;
}

napi_value
window_setIcon(napi_env env, napi_callback_info info)
{
  size_t argc = 6;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  int w, h, stride;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[1], &w);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[2], &h);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[3], &stride);

  unsigned int format;
  CALL_NAPI(nullptr, napi_get_value_uint32, env, argv[4], &format);

  void * pixels;
  CALL_NAPI(nullptr, napi_get_buffer_info, env, argv[5], &pixels, nullptr);

  CALL_SDL_HELPER(env, window_setIcon, window_id, w, h, stride, format, pixels);

  return nullptr;
}

napi_value
window_render(napi_env env, napi_callback_info info)
{
  size_t argc = 6;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  int w, h, stride;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[1], &w);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[2], &h);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[3], &stride);

  unsigned int format;
  CALL_NAPI(nullptr, napi_get_value_uint32, env, argv[4], &format);

  void * pixels;
  CALL_NAPI(nullptr, napi_get_buffer_info, env, argv[5], &pixels, nullptr);

  CALL_SDL_HELPER(env, window_render, window_id, w, h, stride, format, pixels);

  return nullptr;
}

napi_value
window_destroy(napi_env env, napi_callback_info info)
{
  size_t argc = 1;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &window_id);

  CALL_SDL_HELPER(env, window_destroy, window_id);

  return nullptr;
}

napi_value
pollEvent(napi_env env, napi_callback_info info)
{
  SdlHelpers::Variant event;
  CALL_SDL_HELPER(env, pollEvent, event);

  napi_value object;
  CALL_NAPI(nullptr, fromVariant, env, event, &object);

  return object;
}

napi_value
waitEvent(napi_env env, napi_callback_info info)
{
  size_t argc = 1;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int timeout;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &timeout);

  SdlHelpers::Variant event;
  CALL_SDL_HELPER(env, waitEvent, timeout, event);

  napi_value object;
  CALL_NAPI(nullptr, fromVariant, env, event, &object);

  return object;
}

napi_value
audio_start(napi_env env, napi_callback_info info)
{
  size_t argc = 4;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  int freq, format, channels, samples;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[0], &freq);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[1], &format);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[2], &channels);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[3], &samples);

  CALL_SDL_HELPER(env, audio_start, freq, format, channels, samples);

  return nullptr;
}

napi_value
audio_getQueuedSize(napi_env env, napi_callback_info info)
{
  unsigned int size;
  CALL_SDL_HELPER(env, audio_getQueuedSize, &size);

  napi_value value;
  CALL_NAPI(nullptr, napi_create_uint32, env, size, &value);

  return value;
}

napi_value
audio_queue(napi_env env, napi_callback_info info)
{
  size_t argc = 2;
  napi_value argv[argc];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  void * samples;
  CALL_NAPI(nullptr, napi_get_buffer_info, env, argv[0], &samples, nullptr);

  int number;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[1], &number);

  CALL_SDL_HELPER(env, audio_queue, samples, number);

  return nullptr;
}

napi_value
audio_stop(napi_env env, napi_callback_info info)
{
  CALL_SDL_HELPER(env, audio_stop);

  return nullptr;
}

napi_value
cleanup(napi_env env, napi_callback_info info)
{
  CALL_SDL_HELPER(env, cleanup);

  return nullptr;
}

napi_value
init (napi_env env, napi_value exports)
{
	// napi_add_env_cleanup_hook

	napi_property_descriptor desc[] = {
    { "initialize", NULL, initialize, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_create", NULL, window_create, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_setTitle", NULL, window_setTitle, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_setPosition", NULL, window_setPosition, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_setSize", NULL, window_setSize, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_setFullscreen", NULL, window_setFullscreen, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_setResizable", NULL, window_setResizable, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_focus", NULL, window_focus, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_show", NULL, window_show, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_hide", NULL, window_hide, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_maximize", NULL, window_maximize, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_minimize", NULL, window_minimize, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_restore", NULL, window_restore, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_setIcon", NULL, window_setIcon, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_render", NULL, window_render, NULL, NULL, NULL, napi_enumerable, NULL },
    { "window_destroy", NULL, window_destroy, NULL, NULL, NULL, napi_enumerable, NULL },
    { "pollEvent", NULL, pollEvent, NULL, NULL, NULL, napi_enumerable, NULL },
    { "waitEvent", NULL, waitEvent, NULL, NULL, NULL, napi_enumerable, NULL },
    { "audio_start", NULL, audio_start, NULL, NULL, NULL, napi_enumerable, NULL },
    { "audio_getQueuedSize", NULL, audio_getQueuedSize, NULL, NULL, NULL, napi_enumerable, NULL },
    { "audio_queue", NULL, audio_queue, NULL, NULL, NULL, napi_enumerable, NULL },
    { "audio_stop", NULL, audio_stop, NULL, NULL, NULL, napi_enumerable, NULL },
    { "cleanup", NULL, cleanup, NULL, NULL, NULL, napi_enumerable, NULL }
	};

  CALL_NAPI(nullptr, napi_define_properties, env, exports, 23, desc);

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
