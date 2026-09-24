const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { AudioPlaybackStream } = require('./audio-playback-stream')
const { AudioRecordingStream } = require('./audio-recording-stream')
const { getFormatHelpers } = require('./format-helpers')


if (Globals.info.initialized.audio) {
	Globals.audioDevices.playback = Bindings.audio_getDevices(false)
	Globals.audioDevices.recording = Bindings.audio_getDevices(true)
}


const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const makeDeviceModule = (type, Stream) => new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get devices () {
		Globals.events.poll()
		return [ ...Globals.audioDevices[type] ]
	}

	openDevice (device = null, options = {}) {
		if (device !== null) {
			Globals.events.poll()
			if (!Globals.audioDevices[type].includes(device)) { throw Object.assign(new Error("invalid device"), { device }) }
		}

		return new Stream(device, options)
	}
}()

const audio = {
	playback: makeDeviceModule('playback', AudioPlaybackStream),
	recording: makeDeviceModule('recording', AudioRecordingStream),

	bytesPerSample (format) { return getFormatHelpers(format).bytesPerSample },
	minSampleValue (format) { return getFormatHelpers(format).minSampleValue },
	maxSampleValue (format) { return getFormatHelpers(format).maxSampleValue },
	zeroSampleValue (format) { return getFormatHelpers(format).zeroSampleValue },

	readSample (format, buffer, offset) {
		if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
		return getFormatHelpers(format).reader.call(buffer, offset)
	},

	writeSample (format, buffer, value, offset) {
		if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
		return getFormatHelpers(format).writer.call(buffer, value, offset)
	},
}

module.exports = { audio }
