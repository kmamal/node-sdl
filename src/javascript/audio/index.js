const Globals = require('../globals')
const { assertInitialized, isAvailable } = require('../subsystems')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { lookupDevice } = require('../device-instance')
const { AudioPlaybackStream } = require('./audio-playback-stream')
const { AudioRecordingStream } = require('./audio-recording-stream')
const { getFormatHelpers } = require('./format-helpers')
const { convert } = require('./conversion')
const { validateBuffer } = require('../validate')


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

		if (requested === null) {
			Globals.events.poll()
			return new Stream(Globals.audioDevices[type][0], options)
		}

		const device = lookupDevice(requested, `audio.${type}`, () => Globals.audioDevices[type])
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
