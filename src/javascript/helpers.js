const Enums = require('./enums')
const { getFormatHelpers: getAudioFormatHelpers } = require('./audio/format-helpers')
const { getFormatHelpers: getVideoFormatHelpers } = require('./video/format-helpers')

module.exports = {
	video: {
		bytesPerPixel (format) { return getVideoFormatHelpers(format).bytesPerPixel },
		isYuv (format) { return getVideoFormatHelpers(format).isYuv },
		isPlanarYuv (format) { return getVideoFormatHelpers(format).isPlanarYuv },

		minBufferSize (format, stride, height) {
			return getVideoFormatHelpers(format).minBufferSize(stride, height)
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
			return getAudioFormatHelpers(format).reader.call(buffer, offset)
		},

		writeSample (format, buffer, value, offset) {
			return getAudioFormatHelpers(format).writer.call(buffer, value, offset)
		},
	},
}
