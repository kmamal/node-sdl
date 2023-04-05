const Bindings = require('../bindings')
const Enums = require('../enums')
const Globals = require('../globals')
const { EventsViaPoll } = require('../events/events-via-poll')
const { AudioFormatHelpers } = require('./format-helpers')

const validEvents = [ 'close' ]

class AudioInstance extends EventsViaPoll {
	constructor (device, options) {
		super(validEvents)

		const { name, type } = device

		const {
			channels = 1,
			frequency = 48000,
			format = 'f32',
			buffered = 4096,
		} = options

		const _format = Enums.audioFormat[format] ?? null

		if (name !== undefined && name !== null && typeof name !== 'string') { throw Object.assign(new Error("name must be a string"), { name }) }
		if (typeof type !== 'string') { throw Object.assign(new Error("type must be a string"), { type }) }
		if (type !== 'playback' && type !== 'recording') { throw Object.assign(new Error("type must be either 'playback' or 'recording'"), { type }) }
		if (!Number.isFinite(channels)) { throw Object.assign(new Error("channels must be a number"), { channels }) }
		if (![ 1, 2, 4, 6 ].includes(channels)) { throw Object.assign(new Error("invalid channels"), { channels }) }
		if (!Number.isFinite(frequency)) { throw Object.assign(new Error("frequency must be a number"), { frequency }) }
		if (frequency <= 0) { throw Object.assign(new Error("invalid frequency"), { frequency }) }
		if (typeof format !== 'string') { throw Object.assign(new Error("format must be a string"), { format }) }
		if (_format === null) { throw Object.assign(new Error("invalid format"), { format }) }
		if (!Number.isFinite(buffered)) { throw Object.assign(new Error("buffered must be a number"), { buffered }) }
		if (buffered !== 2 ** (32 - Math.clz32(buffered) - 1)) { throw Object.assign(new Error("invalid buffered"), { buffered }) }

		this._id = Bindings.audio_openDevice(name ?? '', type === 'recording', frequency, _format, channels, buffered)

		this._device = device
		this._name = name
		this._buffered = buffered
		this._channels = channels
		this._format = format
		this._frequency = frequency

		this._playing = true
		this._closed = false

		const helper = AudioFormatHelpers[this._format]
		this._bytesPerSample = helper.bytesPerSample
		this._minSampleValue = helper.minSampleValue
		this._maxSampleValue = helper.maxSampleValue
		this._zeroSampleValue = helper.zeroSampleValue
		this._readerName = helper.readerName
		this._writerName = helper.writerName
		this._reader = helper.reader
		this._writer = helper.writer

		Globals.audioInstances.set(this._id, this)
	}

	get id () { return this._id }
	get device () { return this._device }
	get name () { return this._name }

	get channels () { return this._channels }
	get frequency () { return this._frequency }

	get format () { return this._format }
	get bytesPerSample () { return this._bytesPerSample }
	get minSampleValue () { return this._minSampleValue }
	get maxSampleValue () { return this._maxSampleValue }
	get zeroSampleValue () { return this._zeroSampleValue }

	readSample (buffer, offset) {
		return this._reader.call(buffer, offset)
	}

	get readerName () { return this._readerName }

	writeSample (buffer, value, offset) {
		return this._writer.call(buffer, value, offset)
	}

	get writerName () { return this._writerName }

	get buffered () { return this._buffered }

	get playing () { return this._playing }
	play (play = true) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._id }) }

		if (typeof play !== 'boolean') { throw Object.assign(new Error("play must be a boolean"), { play }) }
		this._playing = play
		Bindings.audio_play(this._id, play)
	}

	pause () {
		this.play(false)
	}

	get queued () {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._id }) }

		return Bindings.audio_getQueueSize(this._id)
	}

	clearQueue () {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._id }) }

		Bindings.audio_clearQueue(this._id)
	}

	get closed () { return this._closed }
	close () {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._id }) }

		this.emit('close')
		this.removeAllListeners()
		this._closed = true

		Bindings.audio_close(this._id)
		Globals.audioInstances.delete(this._id)
	}
}

module.exports = { AudioInstance }
