const { VideoFormatHelpers } = require('./format-helpers')
const { validateString, validateBuffer, validateInteger, validatePositiveInt32 } = require('../validate')

const validateVsync = (vsync) => {
	validateInteger('vsync', vsync)
	if (vsync < -1 || vsync > 2 ** 31 - 1) { throw Object.assign(new Error("vsync must be -1 or a non-negative 32-bit integer"), { vsync }) }
}

const validateImage = (width, height, stride, format, buffer, validateHelpers) => {
	validatePositiveInt32('width', width)
	validatePositiveInt32('height', height)
	validateInteger('stride', stride)
	validateString('format', format)
	const helpers = VideoFormatHelpers[format]
	if (helpers === undefined) { throw Object.assign(new Error("invalid format"), { format }) }
	validateHelpers(helpers, format)
	if (stride < helpers.minStride(width)) { throw Object.assign(new Error("stride is smaller than expected"), { stride, width, format }) }
	if (stride > 2 ** 31 - 1) { throw Object.assign(new Error("stride must be a 32-bit integer"), { stride }) }
	validateBuffer('buffer', buffer)
	if (buffer.length < helpers.minBufferSize(stride, height)) { throw Object.assign(new Error("buffer is smaller than expected"), { buffer, stride, height, format }) }
}

const validateRenderableFormat = (helpers, format) => {
	if (!helpers.isRenderable) { throw Object.assign(new Error("format can't be rendered"), { format }) }
}

const validateRgbFormat = (helpers, format) => {
	if (helpers.isYuv) { throw Object.assign(new Error("format must be an RGB format"), { format }) }
}

module.exports = {
	validateVsync,
	validateImage,
	validateRenderableFormat,
	validateRgbFormat,
}
