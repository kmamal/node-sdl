import * as Globals from '../globals.js'
import { EventsViaPoll } from '../events/events-via-poll.js'
import { AudioPlaybackInstance } from './audio-playback-instance.js'
import { AudioRecordingInstance } from './audio-recording-instance.js'
import { AudioFormatHelpers } from './format-helpers.js'

const validEvents = ['deviceAdd', 'deviceRemove']

export class audio extends EventsViaPoll {
	constructor() { super(validEvents) }

	get devices() {
		return [
			...Globals.audioDevices.playback,
			...Globals.audioDevices.recording,
		]
	}

	openDevice(device, options = {}) {
		return device.type === 'recording'
			? new AudioRecordingInstance(device, options)
			: new AudioPlaybackInstance(device, options)
	}

	bytesPerSample(format) { return AudioFormatHelpers[format].bytesPerSample }
	minSampleValue(format) { return AudioFormatHelpers[format].minSampleValue }
	maxSampleValue(format) { return AudioFormatHelpers[format].maxSampleValue }
	zeroSampleValue(format) { return AudioFormatHelpers[format].zeroSampleValue }

	readSample(format, buffer, offset) {
		return AudioFormatHelpers[format].reader.call(buffer, offset)
	}

	readerName(format) {
		return AudioFormatHelpers[format].readerName
	}

	writeSample(format, buffer, value, offset) {
		return AudioFormatHelpers[format].writer.call(buffer, value, offset)
	}

	writerName(format) {
		return AudioFormatHelpers[format].writerName
	}
}
