#include "audio.h"
#include "global.h"
#include <SDL3/SDL.h>
#include <string>
#include <sstream>
#include <mutex>
#include <atomic>
#include <cstdint>

std::map<bool, std::string> audio::device_types;
std::map<SDL_AudioFormat, std::string> audio::formats;

struct StreamState;

static void _notifyJs (Napi::Env env, Napi::Function callback, StreamState *state, std::nullptr_t *);

using NotifyFunction = Napi::TypedThreadSafeFunction<StreamState, std::nullptr_t, _notifyJs>;

struct StreamState {
	std::atomic<bool> notify { false };
	std::atomic<bool> pending { false };
	std::atomic<uint32_t> underruns { 0 };
	std::atomic<uint32_t> missing { 0 };
	NotifyFunction tsfn;
};

struct OpenStream {
	SDL_AudioStream *stream;
	napi_env env;
	bool is_recording;
	StreamState *state;
};

static std::map<SDL_AudioDeviceID, OpenStream> open_streams;

static void
_notifyJs (Napi::Env env, Napi::Function callback, StreamState *state, std::nullptr_t *)
{
	state->pending.store(false, std::memory_order_release);
	uint32_t underruns = state->underruns.exchange(0, std::memory_order_relaxed);
	uint32_t missing = state->missing.exchange(0, std::memory_order_relaxed);
	if (env == nullptr || callback.IsEmpty()) { return; }
	callback.Call({ Napi::Number::New(env, underruns), Napi::Number::New(env, missing) });
}

static void
_wake (StreamState *state)
{
	if (!state->notify.load(std::memory_order_acquire)) { return; }
	if (state->pending.exchange(true, std::memory_order_acq_rel)) { return; }
	if (state->tsfn.NonBlockingCall() != napi_ok) {
		state->pending.store(false, std::memory_order_release);
	}
}

static void SDLCALL
_onGet (void *userdata, SDL_AudioStream *, int additional_amount, int)
{
	StreamState *state = (StreamState *) userdata;

	if (!state->notify.load(std::memory_order_acquire)) { return; }

	if (additional_amount > 0) {
		state->underruns.fetch_add(1, std::memory_order_relaxed);
		state->missing.fetch_add((uint32_t) additional_amount, std::memory_order_relaxed);
	}

	_wake(state);
}

static void SDLCALL
_onPut (void *userdata, SDL_AudioStream *, int, int)
{
	StreamState *state = (StreamState *) userdata;
	_wake(state);
}

static void
_unbind (OpenStream &entry)
{
	if (entry.is_recording) { SDL_SetAudioStreamPutCallback(entry.stream, nullptr, nullptr); }
	else { SDL_SetAudioStreamGetCallback(entry.stream, nullptr, nullptr); }
}

static void
_envCleanup (void *arg)
{
	SDL_AudioDeviceID audio_id = (SDL_AudioDeviceID) (uintptr_t) arg;

	std::lock_guard<std::mutex> guard(global::lock());

	auto it = open_streams.find(audio_id);
	if (it == open_streams.end()) { return; }

	_unbind(it->second);
	SDL_DestroyAudioStream(it->second.stream);
	open_streams.erase(it);
}

static void
_destroy (SDL_AudioDeviceID audio_id, OpenStream &entry, bool same_env)
{
	_unbind(entry);
	SDL_DestroyAudioStream(entry.stream);
	if (same_env) { napi_remove_env_cleanup_hook(entry.env, _envCleanup, (void *) (uintptr_t) audio_id); }
	entry.state->tsfn.Release();
}

static OpenStream &
_getEntry (Napi::Env &env, SDL_AudioDeviceID audio_id)
{
	auto entry = open_streams.find(audio_id);
	if (entry == open_streams.end()) {
		std::ostringstream message;
		message << "getAudioStream(" << audio_id << ") error: invalid audio stream id";
		throw Napi::Error::New(env, message.str());
	}
	return entry->second;
}

static SDL_AudioStream *
_getStream (Napi::Env &env, SDL_AudioDeviceID audio_id)
{
	return _getEntry(env, audio_id).stream;
}

void
audio::closeAllStreams ()
{
	for (auto &entry : open_streams) {
		_destroy(entry.first, entry.second, false);
	}
	open_streams.clear();
}


static void
_setFormat (packed::Value &target, SDL_AudioDeviceID id)
{
	SDL_AudioSpec spec;
	int sample_frames;
	if (!SDL_GetAudioDeviceFormat(id, &spec, &sample_frames)) {
		SDL_ClearError();
		return;
	}

	auto format_entry = audio::formats.find(spec.format);
	packed::Value format;
	if (format_entry != audio::formats.end()) { format = packed::Value::ref(format_entry->second); }

	target.set("format", std::move(format));
	target.set("channels", spec.channels);
	target.set("frequency", spec.freq);
	target.set("buffered", sample_frames);
}

static void
_setFormat (Napi::Object &target, SDL_AudioDeviceID id)
{
	packed::Value format = packed::Value::object();
	_setFormat(format, id);

	Napi::Env env = target.Env();
	for (const packed::Member &member : format.members()) {
		target.Set(member.key, member.value.toNapi(env));
	}
}

static SDL_AudioDeviceID
_defaultId (bool is_recording)
{
	return is_recording ? SDL_AUDIO_DEVICE_DEFAULT_RECORDING : SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK;
}

static packed::Value
_packDevice (SDL_AudioDeviceID id)
{
	const char *name = SDL_GetAudioDeviceName(id);
	if (name == nullptr) {
		SDL_ClearError();
		return packed::Value();
	}

	packed::Value device = packed::Value::object();
	device.set("id", id);
	device.set("name", name);
	_setFormat(device, id);

	return device;
}

packed::Value
audio::_getDevice(SDL_AudioDeviceID id)
{
	return _packDevice(id);
}

packed::Value
audio::_getFormat(SDL_AudioDeviceID id)
{
	packed::Value result = packed::Value::object();
	_setFormat(result, id);
	return result;
}

packed::Value
audio::_getDefaultDevice(bool is_recording)
{
	packed::Value device = packed::Value::object();
	device.set("id", packed::Value());
	device.set("name", packed::Value());
	_setFormat(device, _defaultId(is_recording));
	return device;
}

Napi::Array
audio::_getDevices(Napi::Env &env, bool is_recording)
{
	int num_devices;
	SDL_AudioDeviceID *device_ids = is_recording
		? SDL_GetAudioRecordingDevices(&num_devices)
		: SDL_GetAudioPlaybackDevices(&num_devices);
	if (device_ids == nullptr) {
		std::ostringstream message;
		message << "SDL_GetAudio" << (is_recording ? "Recording" : "Playback") << "Devices() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	Napi::Array devices = Napi::Array::New(env);

	try {
		devices.Set((uint32_t) 0, audio::_getDefaultDevice(is_recording).toNapi(env));
		int num_returned = 1;
		for (int i = 0; i < num_devices; i++) {
			packed::Value device = _packDevice(device_ids[i]);
			if (device.isNull()) { continue; }
			devices.Set(num_returned++, device.toNapi(env));
		}
	}
	catch (...) {
		SDL_free(device_ids);
		throw;
	}
	SDL_free(device_ids);

	return devices;
}

Napi::Value
audio::getDrivers(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	Napi::Array all = Napi::Array::New(env);
	int num_drivers = SDL_GetNumAudioDrivers();
	for (int i = 0; i < num_drivers; i ++) {
		all.Set(i, SDL_GetAudioDriver(i));
	}

	Napi::Object result = Napi::Object::New(env);
	result.Set("all", all);
	result.Set("current", Napi::String::New(env, SDL_GetCurrentAudioDriver()));

	return result;
}

Napi::Value
audio::getDevices(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	bool is_recording = info[0].As<Napi::Boolean>().Value();

	return audio::_getDevices(env, is_recording);
}

Napi::Value
audio::open (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	bool has_id = !info[0].IsNull();
	bool is_recording = info[1].As<Napi::Boolean>().Value();
	int freq = info[2].As<Napi::Number>().Int32Value();
	int format = info[3].As<Napi::Number>().Int32Value();
	int channels = info[4].As<Napi::Number>().Int32Value();
	int samples = info[5].As<Napi::Number>().Int32Value();
	Napi::Function callback = info[6].As<Napi::Function>();
	Napi::Object device = info[7].As<Napi::Object>();

	SDL_AudioDeviceID device_id = has_id
		? info[0].As<Napi::Number>().Uint32Value()
		: _defaultId(is_recording);

	SDL_AudioSpec desired;
	SDL_memset(&desired, 0, sizeof(desired));
	desired.freq = freq;
	desired.format = (SDL_AudioFormat) format;
	desired.channels = channels;

	std::string samples_string = std::to_string(samples);
	SDL_SetHint(SDL_HINT_AUDIO_DEVICE_SAMPLE_FRAMES, samples_string.c_str());

	SDL_AudioStream *stream = SDL_OpenAudioDeviceStream(device_id, &desired, nullptr, nullptr);
	SDL_ResetHint(SDL_HINT_AUDIO_DEVICE_SAMPLE_FRAMES);
	if (stream == nullptr) {
		std::ostringstream message;
		message << "SDL_OpenAudioDeviceStream() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	SDL_AudioDeviceID audio_id = SDL_GetAudioStreamDevice(stream);
	if (audio_id == 0) {
		std::ostringstream message;
		message << "SDL_GetAudioStreamDevice() error: " << SDL_GetError();
		SDL_ClearError();
		SDL_DestroyAudioStream(stream);
		throw Napi::Error::New(env, message.str());
	}

	StreamState *state = new StreamState();
	try {
		state->tsfn = NotifyFunction::New(env, callback, "audioStreamNotify", 0, 1, state,
			[](Napi::Env, void *, StreamState *state) { delete state; });
	}
	catch (...) {
		delete state;
		SDL_DestroyAudioStream(stream);
		throw;
	}
	state->tsfn.Unref(env);

	napi_add_env_cleanup_hook(env, _envCleanup, (void *) (uintptr_t) audio_id);
	OpenStream &entry = open_streams[audio_id] = { stream, env, is_recording, state };

	bool bound = is_recording
		? SDL_SetAudioStreamPutCallback(stream, _onPut, state)
		: SDL_SetAudioStreamGetCallback(stream, _onGet, state);
	if (!bound) {
		std::ostringstream message;
		message << "SDL_SetAudioStream" << (is_recording ? "Put" : "Get") << "Callback(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		_destroy(audio_id, entry, true);
		open_streams.erase(audio_id);
		throw Napi::Error::New(env, message.str());
	}

	try {
		_setFormat(device, audio_id);
	}
	catch (...) {
		_destroy(audio_id, entry, true);
		open_streams.erase(audio_id);
		throw;
	}

	return Napi::Number::New(env, audio_id);
}

Napi::Value
audio::play (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	bool should_play = info[1].As<Napi::Boolean>().Value();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	bool success = should_play
		? SDL_ResumeAudioStreamDevice(stream)
		: SDL_PauseAudioStreamDevice(stream);
	if (!success) {
		std::ostringstream message;
		message << (should_play ? "SDL_ResumeAudioStreamDevice(" : "SDL_PauseAudioStreamDevice(") << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
audio::getQueued (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int audio_id = info[0].As<Napi::Number>().Int32Value();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	int size = SDL_GetAudioStreamQueued(stream);
	if (size == -1) {
		std::ostringstream message;
		message << "SDL_GetAudioStreamQueued(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return Napi::Number::New(env, size);
}

Napi::Value
audio::getAvailable (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int audio_id = info[0].As<Napi::Number>().Int32Value();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	int size = SDL_GetAudioStreamAvailable(stream);
	if (size == -1) {
		std::ostringstream message;
		message << "SDL_GetAudioStreamAvailable(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return Napi::Number::New(env, size);
}

Napi::Value
audio::clear (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int audio_id = info[0].As<Napi::Number>().Int32Value();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	if (!SDL_ClearAudioStream(stream)) {
		std::ostringstream message;
		message << "SDL_ClearAudioStream(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
audio::putData (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	void *src = info[1].As<Napi::Buffer<char>>().Data();
	int size = info[2].As<Napi::Number>().Int32Value();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	if (!SDL_PutAudioStreamData(stream, src, size)) {
		std::ostringstream message;
		message << "SDL_PutAudioStreamData(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
audio::getData (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	void *dst = info[1].As<Napi::Buffer<char>>().Data();
	int size = info[2].As<Napi::Number>().Int32Value();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	int num = SDL_GetAudioStreamData(stream, dst, size);
	if (num == -1) {
		std::ostringstream message;
		message << "SDL_GetAudioStreamData(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return Napi::Number::New(env, num);
}

Napi::Value
audio::close (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	Napi::Object device = info[1].As<Napi::Object>();
	bool has_id = !info[2].IsNull();
	bool is_recording = info[3].As<Napi::Boolean>().Value();

	OpenStream &entry = _getEntry(env, audio_id);
	_destroy(audio_id, entry, true);
	open_streams.erase(audio_id);

	_setFormat(device, has_id ? info[2].As<Napi::Number>().Uint32Value() : _defaultId(is_recording));

	return env.Undefined();
}

Napi::Value
audio::setNotify (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	bool notify = info[1].As<Napi::Boolean>().Value();

	StreamState *state = _getEntry(env, audio_id).state;
	if (notify) {
		state->underruns.store(0, std::memory_order_relaxed);
		state->missing.store(0, std::memory_order_relaxed);
	}
	state->notify.store(notify, std::memory_order_release);

	return env.Undefined();
}

Napi::Value
audio::setGain (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	float gain = info[1].As<Napi::Number>().FloatValue();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	if (!SDL_SetAudioStreamGain(stream, gain)) {
		std::ostringstream message;
		message << "SDL_SetAudioStreamGain(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
audio::setFrequencyRatio (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());
	global::assertReady(env);

	int audio_id = info[0].As<Napi::Number>().Int32Value();
	float ratio = info[1].As<Napi::Number>().FloatValue();

	SDL_AudioStream *stream = _getStream(env, audio_id);

	if (!SDL_SetAudioStreamFrequencyRatio(stream, ratio)) {
		std::ostringstream message;
		message << "SDL_SetAudioStreamFrequencyRatio(" << audio_id << ") error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return env.Undefined();
}

Napi::Value
audio::convert (const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	std::lock_guard<std::mutex> guard(global::lock());

	SDL_AudioSpec src_spec;
	src_spec.format = (SDL_AudioFormat) info[0].As<Napi::Number>().Int32Value();
	src_spec.channels = info[1].As<Napi::Number>().Int32Value();
	src_spec.freq = info[2].As<Napi::Number>().Int32Value();

	Napi::Buffer<uint8_t> src = info[3].As<Napi::Buffer<uint8_t>>();
	int src_size = info[4].As<Napi::Number>().Int32Value();

	SDL_AudioSpec dst_spec;
	dst_spec.format = (SDL_AudioFormat) info[5].As<Napi::Number>().Int32Value();
	dst_spec.channels = info[6].As<Napi::Number>().Int32Value();
	dst_spec.freq = info[7].As<Napi::Number>().Int32Value();

	SDL_AudioStream *stream = SDL_CreateAudioStream(&src_spec, &dst_spec);
	if (stream == nullptr) {
		std::ostringstream message;
		message << "SDL_CreateAudioStream() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	if (!SDL_PutAudioStreamData(stream, src.Data(), src_size) || !SDL_FlushAudioStream(stream)) {
		std::ostringstream message;
		message << "SDL_PutAudioStreamData() error: " << SDL_GetError();
		SDL_ClearError();
		SDL_DestroyAudioStream(stream);
		throw Napi::Error::New(env, message.str());
	}

	int available = SDL_GetAudioStreamAvailable(stream);
	if (available < 0) { available = 0; }

	Napi::Buffer<uint8_t> dst = info[8].As<Napi::Buffer<uint8_t>>();
	if (dst.Length() < (size_t) available) {
		SDL_DestroyAudioStream(stream);
		std::ostringstream message;
		message << "dstData must hold at least " << available << " bytes";
		throw Napi::Error::New(env, message.str());
	}

	int got = available > 0 ? SDL_GetAudioStreamData(stream, dst.Data(), available) : 0;
	SDL_DestroyAudioStream(stream);
	if (got < 0) {
		std::ostringstream message;
		message << "SDL_GetAudioStreamData() error: " << SDL_GetError();
		SDL_ClearError();
		throw Napi::Error::New(env, message.str());
	}

	return Napi::Number::New(env, got);
}
