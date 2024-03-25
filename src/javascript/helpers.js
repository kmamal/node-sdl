const { AudioFormatHelpers } = require('./audio/format-helpers')

module.exports = {
	audio: {
		bytesPerSample (format) { return AudioFormatHelpers[format].bytesPerSample },
		minSampleValue (format) { return AudioFormatHelpers[format].minSampleValue },
		maxSampleValue (format) { return AudioFormatHelpers[format].maxSampleValue },
		zeroSampleValue (format) { return AudioFormatHelpers[format].zeroSampleValue },

		readSample (format, buffer, offset) {
			return AudioFormatHelpers[format].reader.call(buffer, offset)
		},

		writeSample (format, buffer, value, offset) {
			return AudioFormatHelpers[format].writer.call(buffer, value, offset)
		},
	},
}
