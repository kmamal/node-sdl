const { getFormatHelpers } = require('./audio/format-helpers')

module.exports = {
	audio: {
		bytesPerSample (format) { return getFormatHelpers(format).bytesPerSample },
		minSampleValue (format) { return getFormatHelpers(format).minSampleValue },
		maxSampleValue (format) { return getFormatHelpers(format).maxSampleValue },
		zeroSampleValue (format) { return getFormatHelpers(format).zeroSampleValue },

		readSample (format, buffer, offset) {
			return getFormatHelpers(format).reader.call(buffer, offset)
		},

		writeSample (format, buffer, value, offset) {
			return getFormatHelpers(format).writer.call(buffer, value, offset)
		},
	},
}
