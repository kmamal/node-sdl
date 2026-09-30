
const minStride = (bytesPerPixel) => (width) => width * bytesPerPixel
const minStridePacked = (width) => 4 * Math.ceil(width / 2)
const minBufferSize = (stride, height) => stride * height
const minBufferSizePlanar = (stride, height) => stride * height + 2 * Math.ceil(stride / 2) * Math.ceil(height / 2)


const rgb = (bytesPerPixel) => ({
	bytesPerPixel,
	isYuv: false,
	isPlanarYuv: false,
	isRenderable: true,
	minStride: minStride(bytesPerPixel),
	minBufferSize,
})

const yuv = (bytesPerPixel, isPlanarYuv, isRenderable = true) => ({
	bytesPerPixel,
	isYuv: true,
	isPlanarYuv,
	isRenderable,
	minStride: isPlanarYuv ? minStride(bytesPerPixel) : minStridePacked,
	minBufferSize: isPlanarYuv ? minBufferSizePlanar : minBufferSize,
})

const VideoFormatHelpers = Object.assign(Object.create(null), {
	rgb332: rgb(1),
	xrgb4444: rgb(2),
	xbgr4444: rgb(2),
	xrgb1555: rgb(2),
	xbgr1555: rgb(2),
	argb4444: rgb(2),
	rgba4444: rgb(2),
	abgr4444: rgb(2),
	bgra4444: rgb(2),
	argb1555: rgb(2),
	rgba5551: rgb(2),
	abgr1555: rgb(2),
	bgra5551: rgb(2),
	rgb565: rgb(2),
	bgr565: rgb(2),
	rgb24: rgb(3),
	bgr24: rgb(3),
	xrgb8888: rgb(4),
	rgbx8888: rgb(4),
	xbgr8888: rgb(4),
	bgrx8888: rgb(4),
	argb8888: rgb(4),
	rgba8888: rgb(4),
	abgr8888: rgb(4),
	bgra8888: rgb(4),
	argb2101010: rgb(4),
	xrgb2101010: rgb(4),
	xbgr2101010: rgb(4),
	abgr2101010: rgb(4),
	rgb48: rgb(6),
	bgr48: rgb(6),
	rgba64: rgb(8),
	argb64: rgb(8),
	bgra64: rgb(8),
	abgr64: rgb(8),
	rgb48f: rgb(6),
	bgr48f: rgb(6),
	rgba64f: rgb(8),
	argb64f: rgb(8),
	bgra64f: rgb(8),
	abgr64f: rgb(8),
	rgb96f: rgb(12),
	bgr96f: rgb(12),
	rgba128f: rgb(16),
	argb128f: rgb(16),
	bgra128f: rgb(16),
	abgr128f: rgb(16),
	rgba32: rgb(4),
	argb32: rgb(4),
	bgra32: rgb(4),
	abgr32: rgb(4),
	rgbx32: rgb(4),
	xrgb32: rgb(4),
	bgrx32: rgb(4),
	xbgr32: rgb(4),
	yv12: yuv(1, true),
	iyuv: yuv(1, true),
	yuy2: yuv(2, false),
	uyvy: yuv(2, false),
	yvyu: yuv(2, false),
	nv12: yuv(1, true),
	nv21: yuv(1, true),
	p010: { ...yuv(2, true, false), minStride: minStridePacked },
})

const getFormatHelpers = (format) => {
	if (typeof format !== 'string') { throw Object.assign(new Error("format must be a string"), { format }) }
	const helpers = VideoFormatHelpers[format]
	if (helpers === undefined) { throw Object.assign(new Error("invalid format"), { format }) }
	return helpers
}

module.exports = { VideoFormatHelpers, getFormatHelpers }
