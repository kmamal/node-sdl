
// Bytes per pixel for each pixel format. For the planar YUV formats the
// value refers to the Y plane, whose pitch is the stride.
const bytesPerPixel = {
	rgb332: 1,
	rgb444: 2,
	rgb555: 2,
	bgr555: 2,
	argb4444: 2,
	rgba4444: 2,
	abgr4444: 2,
	bgra4444: 2,
	argb1555: 2,
	rgba5551: 2,
	abgr1555: 2,
	bgra5551: 2,
	rgb565: 2,
	bgr565: 2,
	rgb24: 3,
	bgr24: 3,
	rgb888: 4,
	rgbx8888: 4,
	bgr888: 4,
	bgrx8888: 4,
	argb8888: 4,
	rgba8888: 4,
	abgr8888: 4,
	bgra8888: 4,
	argb2101010: 4,
	rgba32: 4,
	argb32: 4,
	bgra32: 4,
	abgr32: 4,
	yv12: 1,
	iyuv: 1,
	yuy2: 2,
	uyvy: 2,
	yvyu: 2,
	nv12: 1,
	nv21: 1,
}

// The planar YUV formats store extra chroma planes after the Y plane
const heightFactor = {
	yv12: 1.5,
	iyuv: 1.5,
	nv12: 1.5,
	nv21: 1.5,
}

const minBufferSize = (format, stride, height) => Math.ceil(stride * height * (heightFactor[format] ?? 1))

module.exports = {
	bytesPerPixel,
	minBufferSize,
}
