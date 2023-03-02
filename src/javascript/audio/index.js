import Globals from '../globals'
import { EventsViaPoll } from '../events/events-via-poll'
import { AudioPlaybackInstance } from './audio-playback-instance'
import { AudioRecordingInstance } from './audio-recording-instance'
import { AudioFormatHelpers } from'./format-helpers'

const validEvents = [ 'deviceAdd', 'deviceRemove' ]

export class audio extends EventsViaPoll {
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
}
