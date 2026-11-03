const Globals = require('../globals')
const Bindings = require('../bindings')
const Enums = require('../enums')
const { EventsViaPoll } = require('../events/events-via-poll')
const { AudioFormatHelpers } = require('./format-helpers')
const {
	validateString,
	validateObject,
	validateBuffer,
	validateNonNegativeNumber,
	validateNumberRange,
	validatePositiveInteger,
	validateIntegerRange,
	validatePositiveInt32,
} = require('../validate')

const notifyEvents = { playback: 'drain', recording: 'readable' }

class AudioStream extends EventsViaPoll {
	constructor (recording, device, options) {
		const notifyEvent = notifyEvents[recording ? 'recording' : 'playback']
		super([ 'close', notifyEvent ])

		validateObject('options', options)

		const {
			channels = 1,
			frequency = 48000,
			format = 'f32',
			buffered = 4096,
			gain = 1,
			frequencyRatio = 1,
		} = options

		validateIntegerRange('channels', channels, 1, 8)
		validatePositiveInt32('frequency', frequency)
		validateString('format', format)
		validatePositiveInteger('buffered', buffered)
		if (buffered > 2 ** 15) { throw Object.assign(new Error("buffered must be at most 32768"), { buffered }) }
		if (buffered !== 2 ** (32 - Math.clz32(buffered) - 1)) { throw Object.assign(new Error("buffered must be a power of 2"), { buffered }) }
		validateNonNegativeNumber('gain', gain)
		validateNumberRange('frequencyRatio', frequencyRatio, 0.01, 100)

		const _format = Enums.audioFormat[format]
		if (_format === undefined) { throw Object.assign(new Error("invalid format"), { format }) }

		const helper = AudioFormatHelpers[format]

		const notify = (underruns, missing) => {
			if (this._closed) { return }
			const event = recording
				? { type: notifyEvent }
				: { type: notifyEvent, underruns, missing }
			Globals.events.withoutPolling(() => {
				try { this.emit(notifyEvent, event) }
				catch (error) { this.emit('error', error) }
			})
		}

		const id = Bindings.audio_open(device.id, recording, frequency, _format, channels, buffered, notify, device)
		try {
			if (gain !== 1) { Bindings.audio_setGain(id, gain) }
			if (frequencyRatio !== 1) { Bindings.audio_setFrequencyRatio(id, frequencyRatio) }
		}
		catch (error) {
			Bindings.audio_close(id, device)
			throw error
		}

		this._id = id
		this._recording = recording
		this._frameSize = channels * helper.bytesPerSample

		this._device = device
		this._channels = channels
		this._format = helper.name
		this._frequency = frequency

		this._playing = false
		this._closed = false
		this._gain = gain
		this._frequencyRatio = frequencyRatio

		this._bytesPerSample = helper.bytesPerSample
		this._minSampleValue = helper.minSampleValue
		this._maxSampleValue = helper.maxSampleValue
		this._zeroSampleValue = helper.zeroSampleValue
		this._reader = helper.reader
		this._writer = helper.writer

		Globals.audioStreams.set(this._id, this)

		const notifyListeners = () => this.listenerCount(notifyEvent) + this.listenerCount('*')
		this.on('newListener', (type) => {
			if ((type !== notifyEvent && type !== '*') || notifyListeners() !== 0) { return }
			Bindings.audio_setNotify(this._id, true)
		})
		this.on('removeListener', (type) => {
			if ((type !== notifyEvent && type !== '*') || notifyListeners() !== 0 || this._closed) { return }
			Bindings.audio_setNotify(this._id, false)
		})
	}

	get id () { return this._id }
	_makeClosedError () { return Object.assign(new Error("stream is closed"), { id: this._id }) }

	_assertOpen () {
		if (this._closed) { throw this._makeClosedError() }
	}

	get device () { return this._device }

	get channels () { return this._channels }
	get frequency () { return this._frequency }

	get format () { return this._format }
	get bytesPerSample () { return this._bytesPerSample }
	get minSampleValue () { return this._minSampleValue }
	get maxSampleValue () { return this._maxSampleValue }
	get zeroSampleValue () { return this._zeroSampleValue }

	readSample (buffer, offset) {
		validateBuffer('buffer', buffer)
		return this._reader.call(buffer, offset)
	}

	writeSample (buffer, value, offset) {
		validateBuffer('buffer', buffer)
		return this._writer.call(buffer, value, offset)
	}

	get gain () { return this._gain }
	setGain (gain) {
		this._assertOpen()

		validateNonNegativeNumber('gain', gain)

		Bindings.audio_setGain(this._id, gain)

		this._gain = gain
	}

	get frequencyRatio () { return this._frequencyRatio }
	setFrequencyRatio (frequencyRatio) {
		this._assertOpen()

		validateNumberRange('frequencyRatio', frequencyRatio, 0.01, 100)

		Bindings.audio_setFrequencyRatio(this._id, frequencyRatio)

		this._frequencyRatio = frequencyRatio
	}

	get playing () { return this._playing }
	play (play = true) {
		this._assertOpen()

		if (typeof play !== 'boolean') { throw Object.assign(new Error("play must be a boolean"), { play }) }

		Bindings.audio_play(this._id, play)

		this._playing = play
	}

	pause () {
		this.play(false)
	}

	clear () {
		this._assertOpen()

		Bindings.audio_clear(this._id)
	}

	get closed () { return this._closed }
	close () {
		this._assertOpen()

		this._closed = true
		this._playing = false

		Globals.audioStreams.delete(this._id)

		// This call could throw if the device is gone
		try { Bindings.audio_close(this._id, this._device) }
		catch (_) { }

		// We might be inside an event listener
		this._retire(() => this._makeClosedError())

		Globals.events.withoutPolling(() => {
			try { this.emit('close', { type: 'close' }) }
			catch (error) { this.emit('error', error) }
		})
	}
}

module.exports = { AudioStream }
