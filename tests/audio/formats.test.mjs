import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import Enums from '../../src/javascript/enums.js'
import { AudioFormatHelpers } from '../../src/javascript/audio/format-helpers.js'

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

T.test("sdl::audio sample values", (t) => {
	t.equal(sdl.audio.bytesPerSample('f32le'), 4)
	t.equal(sdl.audio.minSampleValue('f32le'), -1)
	t.equal(sdl.audio.maxSampleValue('f32le'), 1)
	t.equal(sdl.audio.zeroSampleValue('f32le'), 0)
})
