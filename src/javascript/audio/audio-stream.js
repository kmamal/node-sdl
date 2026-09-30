const Globals = require('../globals')
const Bindings = require('../bindings')
const Enums = require('../enums')
const { EventsViaPoll } = require('../events/events-via-poll')
const { AudioFormatHelpers } = require('./format-helpers')
const { update: updateDevice } = require('./device')

const validEvents = [ 'close' ]

class AudioStream extends EventsViaPoll {
	constructor (recording, device, options) {
		super(validEvents)

		if (typeof options !== 'object' || options === null) { throw Object.assign(new Error("options must be an object"), { options }) }

		const {
			channels = 1,
			frequency = 48000,
			format = 'f32',
			buffered = 4096,
		} = options

		if (!Number.isInteger(channels)) { throw Object.assign(new Error("channels must be an integer"), { channels }) }
		if (channels < 1 || channels > 8) { throw Object.assign(new Error("channels must be between 1 and 8"), { channels }) }
		if (!Number.isInteger(frequency)) { throw Object.assign(new Error("frequency must be an integer"), { frequency }) }
		if (frequency <= 0 || frequency > 2 ** 31 - 1) { throw Object.assign(new Error("frequency must be a positive 32-bit integer"), { frequency }) }
		if (typeof format !== 'string') { throw Object.assign(new Error("format must be a string"), { format }) }
		if (!Number.isInteger(buffered)) { throw Object.assign(new Error("buffered must be an integer"), { buffered }) }
		if (buffered <= 0) { throw Object.assign(new Error("buffered must be positive"), { buffered }) }
		if (buffered !== 2 ** (32 - Math.clz32(buffered) - 1)) { throw Object.assign(new Error("buffered must be a power of 2"), { buffered }) }
		if (buffered > 2 ** 15) { throw Object.assign(new Error("buffered must be at most 32768"), { buffered }) }

		const _format = Enums.audioFormat[format]
		if (_format === undefined) { throw Object.assign(new Error("invalid format"), { format }) }

		const id = Bindings.audio_open(device.id, recording, frequency, _format, channels, buffered)

		this._id = id
		this._recording = recording
		this._device = device
		this._channels = channels
		this._format = format
		this._frequency = frequency

		this._playing = false
		this._closed = false

		const helper = AudioFormatHelpers[this._format]
		this._bytesPerSample = helper.bytesPerSample
		this._minSampleValue = helper.minSampleValue
		this._maxSampleValue = helper.maxSampleValue
		this._zeroSampleValue = helper.zeroSampleValue
		this._reader = helper.reader
		this._writer = helper.writer

		Globals.audioStreams.set(this._id, this)
		updateDevice(this._device)
	}

	get id () { return this._id }
	get device () { return this._device }

	get channels () { return this._channels }
	get frequency () { return this._frequency }

	get format () { return this._format }
	get bytesPerSample () { return this._bytesPerSample }
	get minSampleValue () { return this._minSampleValue }
	get maxSampleValue () { return this._maxSampleValue }
	get zeroSampleValue () { return this._zeroSampleValue }

	readSample (buffer, offset) {
		if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
		return this._reader.call(buffer, offset)
	}

	writeSample (buffer, value, offset) {
		if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
		return this._writer.call(buffer, value, offset)
	}

	get playing () { return this._playing }
	play (play = true) {
		if (this._closed) { throw Object.assign(new Error("stream is closed"), { id: this._id }) }

		if (typeof play !== 'boolean') { throw Object.assign(new Error("play must be a boolean"), { play }) }

		Bindings.audio_play(this._id, play)

		this._playing = play
	}

	pause () {
		this.play(false)
	}

	clear () {
		if (this._closed) { throw Object.assign(new Error("stream is closed"), { id: this._id }) }

		Bindings.audio_clear(this._id)
	}

	get closed () { return this._closed }
	close () {
		if (this._closed) { throw Object.assign(new Error("stream is closed"), { id: this._id }) }

		this._closed = true
		this._playing = false

		Globals.audioStreams.delete(this._id)

		// This call could throw if the device is gone
		try { Bindings.audio_close(this._id) }
		catch (_) { }

		updateDevice(this._device)

		// We might be inside an event listener
		this._retire(() => Object.assign(new Error("stream is closed"), { id: this._id }))

		try { this.emit('close', { type: 'close' }) }
		catch (error) { this.emit('error', error) }
	}
}

module.exports = { AudioStream }
