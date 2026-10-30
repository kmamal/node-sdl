const { isMainThread } = require('node:worker_threads')
if (isMainThread) { throw new Error("@kmamal/sdl/worker can only be used in worker threads, import @kmamal/sdl in the main thread") }

const Globals = require('./globals')
const { validateObject, validateBuffer, validateNonNegativeInteger } = require('./validate')

Globals.events = {
	poll () {},
	withoutPolling (fn) { fn() },
	switchToPollingFast () {},
	switchToPollingSlow () {},
}

const Enums = require('./enums')
const { getFormatHelpers: getAudioFormatHelpers } = require('./audio/format-helpers')
const { getFormatHelpers: getVideoFormatHelpers } = require('./video/format-helpers')
const { AudioPlaybackStream } = require('./audio/audio-playback-stream')
const { AudioRecordingStream } = require('./audio/audio-recording-stream')
const Bindings = require('./bindings')
const { make: makeDevice } = require('./audio/device')
const { convert: convertAudio } = require('./audio/conversion')
const { convert: convertImage } = require('./video/conversion')

const makeModule = (type, Stream) => {
	const recording = type === 'recording'
	const defaultDevice = makeDevice({})

	return {
		get devices () {
			const [ defaultInfo, ...devices ] = Bindings.audio_getDevices(recording)
			Object.assign(defaultDevice, defaultInfo)
			return [ defaultDevice, ...devices.map(makeDevice) ]
		},

		openDevice (device = null, options = {}) {
			if (device === null) { return new Stream(defaultDevice, options) }

			validateObject('device', device)
			const { id } = device
			if (id !== null && !Number.isInteger(id)) { throw Object.assign(new Error("device.id must be an integer"), { id }) }
			if (id !== null && (id < 0 || id > 2 ** 32 - 1)) { throw Object.assign(new Error("device.id must be an unsigned 32-bit integer"), { id }) }

			return new Stream(device, options)
		},
	}
}

module.exports = {
	video: {
		convert: convertImage,

		bytesPerPixel (format) { return getVideoFormatHelpers(format).bytesPerPixel },
		isYuv (format) { return getVideoFormatHelpers(format).isYuv },
		isPlanarYuv (format) { return getVideoFormatHelpers(format).isPlanarYuv },

		minStride (format, width) {
			const helpers = getVideoFormatHelpers(format)
			validateNonNegativeInteger('width', width)
			return helpers.minStride(width)
		},

		minBufferSize (format, stride, height) {
			const helpers = getVideoFormatHelpers(format)
			validateNonNegativeInteger('stride', stride)
			validateNonNegativeInteger('height', height)
			return helpers.minBufferSize(stride, height)
		},
	},
	keyboard: {
		get SCANCODE () { return Enums.scancodes },
	},
	mouse: {
		get BUTTON () { return Enums.mouseButtons },
	},
	sensor: {
		STANDARD_GRAVITY: 9.80665,
	},
	audio: {
		bytesPerSample (format) { return getAudioFormatHelpers(format).bytesPerSample },
		minSampleValue (format) { return getAudioFormatHelpers(format).minSampleValue },
		maxSampleValue (format) { return getAudioFormatHelpers(format).maxSampleValue },
		zeroSampleValue (format) { return getAudioFormatHelpers(format).zeroSampleValue },

		readSample (format, buffer, offset) {
			validateBuffer('buffer', buffer)
			return getAudioFormatHelpers(format).reader.call(buffer, offset)
		},

		writeSample (format, buffer, value, offset) {
			validateBuffer('buffer', buffer)
			return getAudioFormatHelpers(format).writer.call(buffer, value, offset)
		},

		convert: convertAudio,

		playback: makeModule('playback', AudioPlaybackStream),
		recording: makeModule('recording', AudioRecordingStream),
	},
}
