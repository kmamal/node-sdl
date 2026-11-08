const Bindings = require('../bindings')
const Enums = require('../enums')
const { VideoFormatHelpers } = require('./format-helpers')
const { validateObject, validateString, validateBuffer, validateInteger, validatePositiveInt32 } = require('../validate')

const overlaps = (a, b) => {
	if (a.buffer !== b.buffer) { return false }
	return a.byteOffset < b.byteOffset + b.length && b.byteOffset < a.byteOffset + a.length
}

const convert = (srcSpec, srcData, dstSpec, dstData) => {
	validateObject('srcSpec', srcSpec)
	validateObject('dstSpec', dstSpec)
	const { width: srcWidth, height: srcHeight, format: srcFormat } = srcSpec
	const { width: dstWidth = srcWidth, height: dstHeight = srcHeight, format: dstFormat, scaling = 'nearest' } = dstSpec
	let { stride: srcStride } = srcSpec
	let { stride: dstStride } = dstSpec

	validatePositiveInt32('srcSpec.width', srcWidth)
	validatePositiveInt32('srcSpec.height', srcHeight)
	validateString('srcSpec.format', srcFormat)
	const srcHelpers = VideoFormatHelpers[srcFormat]
	if (srcHelpers === undefined) { throw Object.assign(new Error("invalid srcSpec.format"), { srcFormat }) }
	if (!srcHelpers.isConvertible) { throw Object.assign(new Error("srcSpec.format can't be converted"), { srcFormat }) }

	const minSrcStride = srcHelpers.minStride(srcWidth)
	if (srcStride === undefined) { srcStride = minSrcStride }
	validateInteger('srcSpec.stride', srcStride)
	if (srcStride < minSrcStride) { throw Object.assign(new Error("srcSpec.stride is smaller than expected"), { srcStride, width: srcWidth, srcFormat }) }
	if (srcStride > 2 ** 31 - 1) { throw Object.assign(new Error("srcSpec.stride must be a 32-bit integer"), { srcStride }) }

	validateBuffer('srcData', srcData)
	if (srcData.length < srcHelpers.minBufferSize(srcStride, srcHeight)) { throw Object.assign(new Error("srcData is smaller than expected"), { srcData, srcStride, height: srcHeight, srcFormat }) }

	validatePositiveInt32('dstSpec.width', dstWidth)
	validatePositiveInt32('dstSpec.height', dstHeight)
	validateString('dstSpec.scaling', scaling)
	const _scaling = Enums.scaleMode[scaling]
	if (_scaling === undefined) { throw Object.assign(new Error("dstSpec.scaling must be 'nearest' or 'linear'"), { scaling }) }

	validateString('dstSpec.format', dstFormat)
	const dstHelpers = VideoFormatHelpers[dstFormat]
	if (dstHelpers === undefined) { throw Object.assign(new Error("invalid dstSpec.format"), { dstFormat }) }
	if (!dstHelpers.isConvertible) { throw Object.assign(new Error("dstSpec.format can't be converted"), { dstFormat }) }

	const minStride = dstHelpers.minStride(dstWidth)
	if (dstStride === undefined) { dstStride = minStride }
	validateInteger('dstSpec.stride', dstStride)
	if (dstStride < minStride) { throw Object.assign(new Error("dstSpec.stride is smaller than expected"), { dstStride, dstWidth, dstFormat }) }
	if (dstStride > 2 ** 31 - 1) { throw Object.assign(new Error("dstSpec.stride must be a 32-bit integer"), { dstStride }) }

	const size = dstHelpers.minBufferSize(dstStride, dstHeight)
	const _srcFormat = Enums.pixelFormat[srcFormat]
	const _dstFormat = Enums.pixelFormat[dstFormat]

	if (dstData === undefined) {
		const buffer = Buffer.alloc(size)
		Bindings.video_convert(srcWidth, srcHeight, _srcFormat, srcData, srcStride, dstWidth, dstHeight, _dstFormat, buffer, dstStride, _scaling)
		return buffer
	}

	validateBuffer('dstData', dstData)
	if (dstData.length < size) { throw Object.assign(new Error("dstData is smaller than expected"), { dstData, dstStride, dstHeight, dstFormat }) }
	if (overlaps(srcData, dstData)) { throw Object.assign(new Error("srcData and dstData must not overlap")) }
	Bindings.video_convert(srcWidth, srcHeight, _srcFormat, srcData, srcStride, dstWidth, dstHeight, _dstFormat, dstData, dstStride, _scaling)
	return size
}

module.exports = { convert }
