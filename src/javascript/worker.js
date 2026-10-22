const { isMainThread } = require('node:worker_threads')
if (isMainThread) { throw new Error("@kmamal/sdl/worker can only be used in worker threads, import @kmamal/sdl in the main thread") }

const Globals = require('./globals')

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
const { makeDefault: makeDefaultDevice } = require('./audio/device')

const makeModule = (type, Stream) => {
	const defaultDevice = makeDefaultDevice()

	return {
		openDevice (device = null, options = {}) {
			if (device === null) { device = defaultDevice }
			else {
				if (typeof device !== 'object') { throw Object.assign(new Error("device must be an object"), { device }) }
				const { id } = device
				if (id !== null && !Number.isInteger(id)) { throw Object.assign(new Error("device.id must be an integer or null"), { id }) }
				if (id !== null && (id < 0 || id > 2 ** 32 - 1)) { throw Object.assign(new Error("device.id must be an unsigned 32-bit integer"), { id }) }
			}

			return new Stream(device, options)
		},
	}
}

module.exports = {
	video: {
		bytesPerPixel (format) { return getVideoFormatHelpers(format).bytesPerPixel },
		isYuv (format) { return getVideoFormatHelpers(format).isYuv },
		isPlanarYuv (format) { return getVideoFormatHelpers(format).isPlanarYuv },

		minStride (format, width) {
			const helpers = getVideoFormatHelpers(format)
			if (!Number.isInteger(width)) { throw Object.assign(new Error("width must be an integer"), { width }) }
			if (width < 0) { throw Object.assign(new Error("width must be non-negative"), { width }) }
			return helpers.minStride(width)
		},

		minBufferSize (format, stride, height) {
			const helpers = getVideoFormatHelpers(format)
			if (!Number.isInteger(stride)) { throw Object.assign(new Error("stride must be an integer"), { stride }) }
			if (stride < 0) { throw Object.assign(new Error("stride must be non-negative"), { stride }) }
			if (!Number.isInteger(height)) { throw Object.assign(new Error("height must be an integer"), { height }) }
			if (height < 0) { throw Object.assign(new Error("height must be non-negative"), { height }) }
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
			if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
			return getAudioFormatHelpers(format).reader.call(buffer, offset)
		},

		writeSample (format, buffer, value, offset) {
			if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
			return getAudioFormatHelpers(format).writer.call(buffer, value, offset)
		},

		playback: makeModule('playback', AudioPlaybackStream),
		recording: makeModule('recording', AudioRecordingStream),
	},
}
