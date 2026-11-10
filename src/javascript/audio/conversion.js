const Bindings = require('../bindings')
const Enums = require('../enums')
const { getFormatHelpers } = require('./format-helpers')
const { INT32_MAX, validateIntegerRange, validatePositiveInt32, validateObject, validateBuffer } = require('../validate')

const checkSpec = (spec, name) => {
	validateObject(name, spec)
	const { format = 'f32', channels = 1, frequency = 48000 } = spec
	const helpers = getFormatHelpers(format, `${name}.format`)
	validateIntegerRange(`${name}.channels`, channels, 1, 8)
	validatePositiveInt32(`${name}.frequency`, frequency)
	return { format: Enums.audioFormat[format], channels, frequency, frameSize: channels * helpers.bytesPerSample }
}

const checkSource = (src, srcData) => {
	if (srcData.length % src.frameSize !== 0) { throw Object.assign(new Error(`srcData length must be a multiple of ${src.frameSize}`), { length: srcData.length }) }
	if (srcData.length > INT32_MAX) { throw Object.assign(new Error("srcData must be smaller than 2 GiB"), { length: srcData.length }) }
}

const convert = (srcSpec, srcData, dstSpec, dstData) => {
	const src = checkSpec(srcSpec, 'srcSpec')
	validateBuffer('srcData', srcData)
	const dst = checkSpec(dstSpec, 'dstSpec')
	checkSource(src, srcData)

	const dstSize = Math.ceil(srcData.length / src.frameSize * dst.frequency / src.frequency) * dst.frameSize
	if (dstSize > INT32_MAX) { throw Object.assign(new Error("converted data must be smaller than 2 GiB"), { size: dstSize }) }

	if (dstData === undefined) {
		if (srcData.length === 0) { return Buffer.alloc(0) }
		const buffer = Buffer.alloc(dstSize)
		const written = Bindings.audio_convert(src.format, src.channels, src.frequency, srcData, srcData.length, dst.format, dst.channels, dst.frequency, buffer)
		return buffer.subarray(0, written)
	}

	validateBuffer('dstData', dstData)
	if (srcData.length === 0) { return 0 }
	return Bindings.audio_convert(src.format, src.channels, src.frequency, srcData, srcData.length, dst.format, dst.channels, dst.frequency, dstData)
}

module.exports = { convert }
