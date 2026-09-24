const Globals = require('../globals')
const Bindings = require('../bindings')
const Enums = require('../enums')
const { EventsViaPoll } = require('../events/events-via-poll')
const { AudioFormatHelpers } = require('./format-helpers')

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
		if (channels < 1 || channels > 8) { throw Object.assign(new Error("invalid channels"), { channels }) }
		if (!Number.isInteger(frequency)) { throw Object.assign(new Error("frequency must be an integer"), { frequency }) }
		if (frequency <= 0 || frequency > 2 ** 31 - 1) { throw Object.assign(new Error("invalid frequency"), { frequency }) }
		if (typeof format !== 'string') { throw Object.assign(new Error("format must be a string"), { format }) }
		if (!Number.isInteger(buffered)) { throw Object.assign(new Error("buffered must be an integer"), { buffered }) }
		if (buffered <= 0) { throw Object.assign(new Error("invalid buffered"), { buffered }) }
		if (buffered !== 2 ** (32 - Math.clz32(buffered) - 1)) { throw Object.assign(new Error("invalid buffered"), { buffered }) }
		if (buffered > 2 ** 15) { throw Object.assign(new Error("invalid buffered"), { buffered }) }

		const _format = Enums.audioFormat[format]
		if (_format === undefined) { throw Object.assign(new Error("invalid format"), { format }) }

		this._id = Bindings.audio_open(device?.id ?? null, recording, frequency, _format, channels, buffered)

		this._recording = recording
		this._device = device
		this._buffered = buffered
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

	get buffered () { return this._buffered }

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

		Globals.audioStreams.delete(this._id)

		// TODO: This call could throw if the device is gone
		try { Bindings.audio_close(this._id) }
		catch (_) { }

		// We might be inside an event listener
		process.nextTick(() => { this.removeAllListeners() })

		try { this.emit('close', { type: 'close' }) }
		catch (error) { this.emit('error', error) }
	}
}

module.exports = { AudioStream }
