import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'

T.test("sdl::video::convert", (t) => {
	const width = 3
	const height = 2
	const rgba = Buffer.alloc(width * height * 4)
	for (let i = 0; i < width * height; i++) { rgba.set([ 10 + i, 20 + i, 30 + i, 255 ], i * 4) }
	const src = { width, height, format: 'rgba32' }

	const bgra = sdl.video.convert(src, rgba, { format: 'bgra32' })
	t.ok(Buffer.isBuffer(bgra))
	t.equal(bgra.length, width * height * 4)
	for (let i = 0; i < width * height; i++) {
		t.equal([ ...bgra.subarray(i * 4, i * 4 + 4) ], [ 30 + i, 20 + i, 10 + i, 255 ])
	}

	const out = Buffer.alloc(bgra.length)
	t.equal(sdl.video.convert(src, rgba, { format: 'bgra32' }, out), bgra.length)
	t.ok(out.equals(bgra))

	const rgb24 = sdl.video.convert(src, rgba, { format: 'rgb24' })
	t.equal(rgb24.length, width * height * 3)

	const padded = sdl.video.convert(src, rgba, { format: 'rgb24', stride: 16 })
	t.equal(padded.length, 16 * height)
	t.ok(padded.subarray(16, 16 + width * 3).equals(rgb24.subarray(width * 3)))

	const bigOut = Buffer.alloc(bgra.length + 8)
	t.equal(sdl.video.convert(src, rgba, { format: 'bgra32', stride: width * 4 }, bigOut), bgra.length)

	t.throws(() => sdl.video.convert(src, rgba, { format: 'bgra32' }, Buffer.alloc(bgra.length - 1)), /dstData is smaller/u)
	t.throws(() => sdl.video.convert(src, rgba, { format: 'bgra32' }, new Uint8Array(bgra.length)), /dstData must be a Buffer/u)
	t.throws(() => sdl.video.convert(src, rgba, { format: 'bgra32', stride: 4 }), /dstSpec.stride is smaller/u)
	t.throws(() => sdl.video.convert(src, rgba, { format: 'nope' }), /invalid dstSpec.format/u)
	t.throws(() => sdl.video.convert({ ...src, format: 'nope' }, rgba, { format: 'bgra32' }), /invalid srcSpec.format/u)
	t.throws(() => sdl.video.convert(src, rgba, { format: 'p010' }), /dstSpec.format can't be converted/u)
	t.throws(() => sdl.video.convert({ ...src, format: 'p010' }, Buffer.alloc(64), { format: 'bgra32' }), /srcSpec.format can't be converted/u)
	t.throws(() => sdl.video.convert(src, rgba.subarray(1), { format: 'bgra32' }), /srcData is smaller/u)
	t.throws(() => sdl.video.convert(src, rgba, { format: 'bgra32' }, rgba), /must not overlap/u)
})

T.test("sdl::video::convert scaling", (t) => {
	const rgba = Buffer.from([ 10, 20, 30, 128, 40, 50, 60, 255 ])
	const src = { width: 2, height: 1, format: 'rgba32' }

	const up = sdl.video.convert(src, rgba, { width: 4, height: 2, format: 'bgra32' })
	t.equal(up.length, 4 * 2 * 4)
	for (let y = 0; y < 2; y++) {
		for (let x = 0; x < 4; x++) {
			const expected = x < 2 ? [ 30, 20, 10, 128 ] : [ 60, 50, 40, 255 ]
			const offset = (y * 4 + x) * 4
			t.equal([ ...up.subarray(offset, offset + 4) ], expected)
		}
	}

	const prefilled = Buffer.alloc(4 * 2 * 4, 0xff)
	t.equal(sdl.video.convert(src, rgba, { width: 4, height: 2, format: 'bgra32' }, prefilled), up.length)
	t.ok(prefilled.equals(up))

	const down = sdl.video.convert(src, rgba, { width: 1, height: 1, format: 'rgba32', scaling: 'linear' })
	t.equal(down.length, 4)

	const padded = sdl.video.convert(src, rgba, { width: 3, height: 2, format: 'rgb24', stride: 16 })
	t.equal(padded.length, 16 * 2)

	const solid = Buffer.alloc(8 * 8 * 4)
	for (let i = 0; i < 64; i++) { solid.set([ 200, 100, 50, 255 ], i * 4) }
	const solidSrc = { width: 8, height: 8, format: 'rgba32' }
	for (const format of [ 'yv12', 'nv12', 'yuy2' ]) {
		const yuv = sdl.video.convert(solidSrc, solid, { width: 4, height: 6, format })
		t.equal(yuv.length, sdl.video.minBufferSize(format, sdl.video.minStride(format, 4), 6))
		const back = sdl.video.convert({ width: 4, height: 6, format }, yuv, { format: 'rgba32' })
		for (let i = 0; i < 4 * 6; i++) {
			const [ r, g, b ] = back.subarray(i * 4, i * 4 + 3)
			t.ok(Math.abs(r - 200) <= 3 && Math.abs(g - 100) <= 3 && Math.abs(b - 50) <= 3)
		}
	}

	const fromYuv = sdl.video.convert({ width: 8, height: 8, format: 'nv12' }, sdl.video.convert(solidSrc, solid, { format: 'nv12' }), { width: 3, height: 5, format: 'rgb24' })
	t.equal(fromYuv.length, 3 * 5 * 3)

	t.throws(() => sdl.video.convert(src, rgba, { width: 0, format: 'bgra32' }), /dstSpec.width/u)
	t.throws(() => sdl.video.convert(src, rgba, { height: 1.5, format: 'bgra32' }), /dstSpec.height/u)
	t.throws(() => sdl.video.convert(src, rgba, { width: 4, format: 'bgra32', scaling: 'nope' }), /dstSpec.scaling/u)
	t.throws(() => sdl.video.convert(src, rgba, { width: 4, height: 2, format: 'bgra32' }, Buffer.alloc(4 * 2 * 4 - 1)), /dstData is smaller/u)
})
