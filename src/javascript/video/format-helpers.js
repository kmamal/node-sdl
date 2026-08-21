
// Bytes per pixel for each pixel format. For the planar YUV formats the
// value refers to the Y plane, whose pitch is the stride.
// Null prototypes so that formats like 'constructor' can't match inherited
// Object members and leak through as valid entries.
const bytesPerPixel = {
	__proto__: null,
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

// The planar YUV formats store extra chroma planes after the Y plane. The
// chroma pitches and row counts are rounded up for odd dimensions.
const isPlanarYuv = {
	__proto__: null,
	yv12: true,
	iyuv: true,
	nv12: true,
	nv21: true,
}

const minBufferSize = (format, stride, height) => {
	const luma = stride * height
	if (!isPlanarYuv[format]) { return luma }
	return luma + 2 * Math.ceil(stride / 2) * Math.ceil(height / 2)
}

module.exports = {
	bytesPerPixel,
	minBufferSize,
}
