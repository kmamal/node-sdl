const Globals = require('../globals')
const { assertInitialized, isAvailable } = require('../subsystems')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { AudioPlaybackStream } = require('./audio-playback-stream')
const { AudioRecordingStream } = require('./audio-recording-stream')
const { getFormatHelpers } = require('./format-helpers')
const { convert } = require('./conversion')
const { validateBuffer, validateObject } = require('../validate')


const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const makeModule = (type, Stream) => new class extends EventsViaPoll {
	constructor () { super(validEvents, () => { assertInitialized('audio') }) }

	get devices () {
		assertInitialized('audio')
		Globals.events.poll()
		return [ ...Globals.audioDevices[type] ]
	}

	openDevice (requested = null, options = {}) {
		assertInitialized('audio')
		Globals.events.poll()
		const list = Globals.audioDevices[type]

		if (requested === null) { return new Stream(list[0], options) }

		validateObject('device', requested)

		const device = list.find(({ id }) => id === requested.id)
		if (!device) { throw Object.assign(new Error(`device must be from sdl.audio.${type}.devices`), { device: requested }) }

		return new Stream(device, options)
	}
}()

const audio = {
	isAvailable () { return isAvailable('audio') },

	get drivers () {
		assertInitialized('audio')
		return Bindings.audio_getDrivers()
	},

	playback: makeModule('playback', AudioPlaybackStream),
	recording: makeModule('recording', AudioRecordingStream),

	bytesPerSample (format) { return getFormatHelpers(format).bytesPerSample },
	minSampleValue (format) { return getFormatHelpers(format).minSampleValue },
	maxSampleValue (format) { return getFormatHelpers(format).maxSampleValue },
	zeroSampleValue (format) { return getFormatHelpers(format).zeroSampleValue },

	convert,

	readSample (format, buffer, offset) {
		validateBuffer('buffer', buffer)
		return getFormatHelpers(format).reader.call(buffer, offset)
	},

	writeSample (format, buffer, value, offset) {
		validateBuffer('buffer', buffer)
		return getFormatHelpers(format).writer.call(buffer, value, offset)
	},
}

module.exports = { audio }
