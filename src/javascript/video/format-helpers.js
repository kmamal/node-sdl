
const minBufferSize = (stride, height) => stride * height
const minBufferSizePlanar = (stride, height) => stride * height + 2 * Math.ceil(stride / 2) * Math.ceil(height / 2)


const rgb = (bytesPerPixel) => ({
	bytesPerPixel,
	isYuv: false,
	isPlanarYuv: false,
	minBufferSize,
})

const yuv = (bytesPerPixel, isPlanarYuv) => ({
	bytesPerPixel,
	isYuv: true,
	isPlanarYuv,
	minBufferSize: isPlanarYuv ? minBufferSizePlanar : minBufferSize,
})

const VideoFormatHelpers = Object.assign(Object.create(null), {
	rgb332: rgb(1),
	rgb444: rgb(2),
	rgb555: rgb(2),
	bgr555: rgb(2),
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
	rgb888: rgb(4),
	rgbx8888: rgb(4),
	bgr888: rgb(4),
	bgrx8888: rgb(4),
	argb8888: rgb(4),
	rgba8888: rgb(4),
	abgr8888: rgb(4),
	bgra8888: rgb(4),
	argb2101010: rgb(4),
	rgba32: rgb(4),
	argb32: rgb(4),
	bgra32: rgb(4),
	abgr32: rgb(4),
	yv12: yuv(1, true),
	iyuv: yuv(1, true),
	yuy2: yuv(2, false),
	uyvy: yuv(2, false),
	yvyu: yuv(2, false),
	nv12: yuv(1, true),
	nv21: yuv(1, true),
})

const getFormatHelpers = (format) => {
	const helpers = VideoFormatHelpers[format]
	if (helpers === undefined) { throw Object.assign(new Error("invalid format"), { format }) }
	return helpers
}

module.exports = { VideoFormatHelpers, getFormatHelpers }
