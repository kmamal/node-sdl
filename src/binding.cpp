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
napi_ref events_func_ref;
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
setCallbacks(napi_env env, napi_callback_info info)
{
  size_t argc = 2;

  napi_value argv[2];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  CALL_NAPI(nullptr, napi_create_reference, env, argv[0], 1, &logger_func_ref);

  CALL_NAPI(nullptr, napi_create_reference, env, argv[1], 1, &events_func_ref);

  return nullptr;
}

napi_value
createWindow(napi_env env, napi_callback_info info)
{
  size_t argc = 5;

  napi_value argv[5];
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, argv, nullptr, nullptr);

  size_t title_length;
  CALL_NAPI(nullptr, napi_get_value_string_latin1, env, argv[0], nullptr, 0, &title_length);
  char title[title_length + 1];
  CALL_NAPI(nullptr, napi_get_value_string_latin1, env, argv[0], title, title_length + 1, nullptr);

  int x, y, w, h;
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[1], &x);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[2], &y);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[3], &w);
  CALL_NAPI(nullptr, napi_get_value_int32, env, argv[4], &h);

  int window_id;
  SdlHelpers::Framebuffer fb;
  CALL_SDL_HELPER(env, createWindow, title, x, y, w, h, &window_id, &fb);

  napi_value object, key, value;
  CALL_NAPI(nullptr, napi_create_object, env, &object);

  CALL_NAPI(nullptr, napi_create_int32, env, window_id, &value);
  CALL_NAPI(nullptr, napi_create_string_latin1, env, "handle", 6, &key);
  CALL_NAPI(nullptr, napi_set_property, env, object, key, value);

  CALL_NAPI(nullptr, napi_create_int32, env, fb.w, &value);
  CALL_NAPI(nullptr, napi_create_string_latin1, env, "w", 1, &key);
  CALL_NAPI(nullptr, napi_set_property, env, object, key, value);

  CALL_NAPI(nullptr, napi_create_int32, env, fb.h, &value);
  CALL_NAPI(nullptr, napi_create_string_latin1, env, "h", 1, &key);
  CALL_NAPI(nullptr, napi_set_property, env, object, key, value);

  CALL_NAPI(nullptr, napi_create_external_buffer, env, fb.h * fb.stride, fb.pixels, nullptr, nullptr, &value);
  CALL_NAPI(nullptr, napi_create_string_latin1, env, "buffer", 6, &key);
  CALL_NAPI(nullptr, napi_set_property, env, object, key, value);

  CALL_NAPI(nullptr, napi_create_int32, env, fb.stride, &value);
  CALL_NAPI(nullptr, napi_create_string_latin1, env, "stride", 6, &key);
  CALL_NAPI(nullptr, napi_set_property, env, object, key, value);

  return object;
}

napi_value
updateWindow(napi_env env, napi_callback_info info)
{
  size_t argc = 1;

  napi_value handle;
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, &handle, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, handle, &window_id);

  CALL_SDL_HELPER(env, updateWindow, window_id);

  return nullptr;
}

napi_value
destroyWindow(napi_env env, napi_callback_info info)
{
  size_t argc = 1;

  napi_value handle;
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, &handle, nullptr, nullptr);

  int window_id;
  CALL_NAPI(nullptr, napi_get_value_int32, env, handle, &window_id);

  CALL_SDL_HELPER(env, destroyWindow, window_id);

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

  napi_value value;
  CALL_NAPI(nullptr, napi_get_cb_info, env, info, &argc, &value, nullptr, nullptr);

  int timeout;
  CALL_NAPI(nullptr, napi_get_value_int32, env, value, &timeout);

  SdlHelpers::Variant event;
  CALL_SDL_HELPER(env, waitEvent, event, timeout);

  napi_value object;
  CALL_NAPI(nullptr, fromVariant, env, event, &object);

  return object;
}

napi_value
startAudio(napi_env env, napi_callback_info info)
{
  CALL_SDL_HELPER(env, startAudio);

  return nullptr;
}

napi_value
stopAudio(napi_env env, napi_callback_info info)
{
  CALL_SDL_HELPER(env, stopAudio);

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
    { "setCallbacks", NULL, setCallbacks, NULL, NULL, NULL, napi_enumerable, NULL },
    { "createWindow", NULL, createWindow, NULL, NULL, NULL, napi_enumerable, NULL },
    { "updateWindow", NULL, updateWindow, NULL, NULL, NULL, napi_enumerable, NULL },
    { "destroyWindow", NULL, destroyWindow, NULL, NULL, NULL, napi_enumerable, NULL },
    { "pollEvent", NULL, pollEvent, NULL, NULL, NULL, napi_enumerable, NULL },
    { "waitEvent", NULL, waitEvent, NULL, NULL, NULL, napi_enumerable, NULL },
    { "startAudio", NULL, startAudio, NULL, NULL, NULL, napi_enumerable, NULL },
    { "stopAudio", NULL, stopAudio, NULL, NULL, NULL, napi_enumerable, NULL },
    { "cleanup", NULL, cleanup, NULL, NULL, NULL, napi_enumerable, NULL }
	};

  CALL_NAPI(nullptr, napi_define_properties, env, exports, 9, desc);

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
