// TODO: handle import issues here

const Globals = require('../globals')
const { EventsViaPoll } = require('../events/events-via-poll').default
const { AudioPlaybackInstance } = require('./audio-playback-instance').default
const { AudioRecordingInstance } = require('./audio-recording-instance')
const { AudioFormatHelpers } = require('./format-helpers').default

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
