const { enums } = require('../enums')
const Globals = require('../globals')
const { EventsViaPoll } = require('../events/events-via-poll')
const { AudioPlaybackDevice } = require('./audio-playback-device')
const { AudioRecordingDevice } = require('./audio-recording-device')
const { audio_format_helpers } = require('./format-helpers')

const audio = new class extends EventsViaPoll {
	get FORMAT () { return enums.audio_format }
	get FORMAT_NAME () { return enums.audio_format_names }

	bytesPerSample (format) {
		return audio_format_helpers[format].bytes_per_sample
	}

	writeSample (format, buffer, value, offset) {
		return audio_format_helpers[format].writer.call(buffer, value, offset)
	}

	readSample (format, buffer, offset) {
		return audio_format_helpers[format].reader.call(buffer, offset)
	}

	get devices () {
		return [
			...Globals.audio_devices.playback,
			...Globals.audio_devices.recording,
		]
	}

	openDevice (device, options) {
		return device.recording
			? new AudioRecordingDevice(device, options)
			: new AudioPlaybackDevice(device, options)
	}
}()

module.exports = { audio }
