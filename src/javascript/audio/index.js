const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { AudioPlaybackInstance } = require('./audio-playback-instance')
const { AudioRecordingInstance } = require('./audio-recording-instance')
const { AudioFormatHelpers } = require('./format-helpers')


Globals.audioDevices.playback = Bindings.audio_getDevices(false)
Globals.audioDevices.recording = Bindings.audio_getDevices(true)


const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const audio = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get devices () {
		Globals.events.poll()
		return [
			...Globals.audioDevices.playback,
			...Globals.audioDevices.recording,
		]
	}

	openDevice (device, options = {}) {
		if (typeof device !== 'object') { throw Object.assign(new Error("device must be an object"), { device }) }
		if (typeof device.type !== 'string') { throw Object.assign(new Error("device.type must be a string"), { device }) }
		if (![ 'playback', 'recording' ].includes(device.type)) { throw Object.assign(new Error("invalid device.type"), { device }) }

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

	writeSample (format, buffer, value, offset) {
		return AudioFormatHelpers[format].writer.call(buffer, value, offset)
	}
}()

module.exports = { audio }
