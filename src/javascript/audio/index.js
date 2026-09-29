const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { AudioPlaybackStream } = require('./audio-playback-stream')
const { AudioRecordingStream } = require('./audio-recording-stream')
const { getFormatHelpers } = require('./format-helpers')
const {
	make: makeDevice,
	makeDefault: makeDefaultDevice,
} = require('./device')


Globals.audioDevices.playback = [ makeDefaultDevice() ]
Globals.audioDevices.recording = [ makeDefaultDevice() ]
if (Globals.info.initialized.audio) {
	Globals.audioDevices.playback.push(...Bindings.audio_getDevices(false).map(makeDevice))
	Globals.audioDevices.recording.push(...Bindings.audio_getDevices(true).map(makeDevice))
}


const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const makeModule = (type, Stream) => new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get devices () {
		Globals.events.poll()
		return [ ...Globals.audioDevices[type] ]
	}

	openDevice (device = null, options = {}) {
		Globals.events.poll()
		const list = Globals.audioDevices[type]
		if (device === null) { device = list[0] }
		else if (!list.includes(device)) { throw Object.assign(new Error("invalid device"), { device }) }

		return new Stream(device, options)
	}
}()

const audio = {
	playback: makeModule('playback', AudioPlaybackStream),
	recording: makeModule('recording', AudioRecordingStream),

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
