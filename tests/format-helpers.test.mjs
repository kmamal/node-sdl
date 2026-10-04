import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'
import Enums from '../src/javascript/enums.js'
import { VideoFormatHelpers } from '../src/javascript/video/format-helpers.js'
import { AudioFormatHelpers } from '../src/javascript/audio/format-helpers.js'

T.test("sdl.video format helpers cover every pixel format", (t) => {
	const formats = Object.keys(Enums.pixelFormat)
	t.ok(formats.length > 0)

	for (const format of formats) {
		const bytesPerPixel = sdl.video.bytesPerPixel(format)
		t.ok(Number.isInteger(bytesPerPixel) && bytesPerPixel > 0, format)
		t.equal(typeof sdl.video.isYuv(format), 'boolean', format)
		t.equal(typeof sdl.video.isPlanarYuv(format), 'boolean', format)

		const minStride = sdl.video.minStride(format, 10)
		t.ok(Number.isInteger(minStride) && minStride >= 10, format)

		const minBufferSize = sdl.video.minBufferSize(format, minStride, 10)
		t.ok(Number.isInteger(minBufferSize) && minBufferSize >= minStride * 10, format)

		t.equal(typeof VideoFormatHelpers[format].isRenderable, 'boolean', format)
	}

	for (const format of Object.keys(VideoFormatHelpers)) {
		t.ok(formats.includes(format), format)
	}
})

T.test("sdl.audio format helpers cover every audio format", (t) => {
	const formats = Object.keys(Enums.audioFormat)
	t.ok(formats.length > 0)

	for (const format of formats) {
		const bytesPerSample = sdl.audio.bytesPerSample(format)
		t.ok(Number.isInteger(bytesPerSample) && bytesPerSample > 0, format)

		const min = sdl.audio.minSampleValue(format)
		const zero = sdl.audio.zeroSampleValue(format)
		const max = sdl.audio.maxSampleValue(format)
		t.ok(min <= zero && zero <= max && min < max, format)

		const buffer = Buffer.alloc(bytesPerSample)
		for (const value of [ min, zero, max ]) {
			sdl.audio.writeSample(format, buffer, value, 0)
			t.equal(sdl.audio.readSample(format, buffer, 0), value, format)
		}
	}

	for (const format of Object.keys(AudioFormatHelpers)) {
		t.ok(formats.includes(format), format)
	}
})
