const Globals = require('../globals')
const Bindings = require('../bindings')
const { make: makeAudioDevice } = require('./device')
const { EventsViaPoll } = require('../events/events-via-poll')
const { AudioPlaybackInstance } = require('./audio-playback-instance')
const { AudioRecordingInstance } = require('./audio-recording-instance')
const { AudioFormatHelpers } = require('./format-helpers')

Globals.audioDevices.playback = Bindings.audio_getDevices(false)
for (const audioDevice of Globals.audioDevices.playback) {
	makeAudioDevice(audioDevice)
}
Globals.audioDevices.recording = Bindings.audio_getDevices(true)
for (const audioDevice of Globals.audioDevices.recording) {
	makeAudioDevice(audioDevice)
}


const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const audio = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get devices () {
		return [
			...Globals.audioDevices.playback,
			...Globals.audioDevices.recording,
		]
	}

	openDevice (device, options = {}) {
		return device.type === 'recording'
			? new AudioRecordingInstance(device, options)
			: new AudioPlaybackInstance(device, options)
	}

	bytesPerSample (format) { return AudioFormatHelpers[format].bytesPerSample }
	minSampleValue (format) { return AudioFormatHelpers[format].minSampleValue }
	maxSampleValue (format) { return AudioFormatHelpers[format].maxSampleValue }
	zeroSampleValue (format) { return AudioFormatHelpers[format].zeroSampleValue }

	readSample (format, buffer, offset) {
		return AudioFormatHelpers[format].reader.call(buffer, offset)
	}

	readerName (format) {
		return AudioFormatHelpers[format].readerName
	}

	writeSample (format, buffer, value, offset) {
		return AudioFormatHelpers[format].writer.call(buffer, value, offset)
	}

	writerName (format) {
		return AudioFormatHelpers[format].writerName
	}
}()

module.exports = { audio }
