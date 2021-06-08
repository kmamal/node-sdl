const Bindings = require('../bindings')
const { enums } = require('../enums')
const Globals = require('../globals')
const { audio_format_helpers } = require('./format-helpers')
const { resetTimeout } = require('./prevent-exit')

Globals.audio_devices.playback = Bindings.audio_getDevices(false)
Globals.audio_devices.recording = Bindings.audio_getDevices(true)

class AudioDevice {
	constructor (device, options) {
		const { name, recording } = device

		const {
			buffered = 4096,
			channels = 1,
			format = enums.audio_format.S16,
			frequency = 48000,
		} = options

		if (!Number.isFinite(buffered)) { throw new Error("buffered must be a number") }
		if (!Number.isFinite(channels)) { throw new Error("channels must be a number") }
		if (!Number.isFinite(format)) { throw new Error("format must be a number") }
		if (!Number.isFinite(frequency)) { throw new Error("frequency must be a number") }

		this._id = Bindings.audio_openDevice(name, recording, frequency, format, channels, buffered)

		this._name = name
		this._buffered = buffered
		this._channels = channels
		this._format = format
		this._frequency = frequency

		this._playing = true
		this._closed = false

		const helper = audio_format_helpers[this._format]
		this._bytes_per_sample = helper.bytes_per_sample
		this._reader = helper.reader
		this._writer = helper.writer

		Globals.audio_devices.all.set(this._id, this)
	}

	get id () { return this._id }
	get name () { return this._name }

	get channels () { return this._channels }
	get frequency () { return this._frequency }
	get format () { return this._format }
	get buffered () { return this._buffered }

	get playing () { return this._playing }
	play (play = true) {
		if (typeof play !== 'boolean') { throw new Error("play must be a boolean") }
		this._playing = play
		Bindings.audio_play(this._id, play)
	}

	pause () {
		this.play(false)
	}

	get queued () { return Bindings.audio_getQueuedSize(this._id) }
	clearQueued () {
		Bindings.audio_clearQueued(this._id)
		resetTimeout()
	}

	get closed () { return this._closed }
	close () {
		this._closed = true
		Bindings.audio_close(this._id)
		Globals.audio_devices.all.delete(this._id)
	}

	get bytesPerSample () { return this._bytes_per_sample }

	writeSample (buffer, value, offset) {
		return this._writer.call(buffer, value, offset)
	}

	readSample (buffer, offset) {
		return this._reader.call(buffer, offset)
	}
}

module.exports = { AudioDevice }
