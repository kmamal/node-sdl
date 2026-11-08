const { VideoFormatHelpers } = require('./format-helpers')
const { validateString, validateBuffer, validateInteger, validatePositiveInt32 } = require('../validate')

const validateVsync = (vsync) => {
	validateInteger('vsync', vsync)
	if (vsync < -1 || vsync > 2 ** 31 - 1) { throw Object.assign(new Error("vsync must be -1 or a non-negative 32-bit integer"), { vsync }) }
}

const validateStride = (name, stride, minStride, details) => {
	validateInteger(name, stride)
	if (stride > 2 ** 31 - 1) { throw Object.assign(new Error(`${name} must be a 32-bit integer`), details) }
	if (stride < minStride) { throw Object.assign(new Error(`${name} is smaller than expected`), details) }
}

const validateImageBuffer = (name, buffer, minSize, details) => {
	validateBuffer(name, buffer)
	if (buffer.length < minSize) { throw Object.assign(new Error(`${name} is smaller than expected`), details) }
}

const validateImage = (width, height, stride, format, buffer, validateHelpers) => {
	validatePositiveInt32('width', width)
	validatePositiveInt32('height', height)
	validateString('format', format)
	const helpers = VideoFormatHelpers[format]
	if (helpers === undefined) { throw Object.assign(new Error("invalid format"), { format }) }
	validateHelpers(helpers, format)
	validateStride('stride', stride, helpers.minStride(width), { stride, width, format })
	validateImageBuffer('buffer', buffer, helpers.minBufferSize(stride, height), { buffer, stride, height, format })
}

const validateRenderableFormat = (helpers, format) => {
	if (!helpers.isRenderable) { throw Object.assign(new Error("format can't be rendered"), { format }) }
}

const validateRgbFormat = (helpers, format) => {
	if (helpers.isYuv) { throw Object.assign(new Error("format must be an RGB format"), { format }) }
}

module.exports = {
	validateVsync,
	validateStride,
	validateImageBuffer,
	validateImage,
	validateRenderableFormat,
	validateRgbFormat,
}
