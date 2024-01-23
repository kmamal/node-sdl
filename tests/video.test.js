const { test } = require('@kmamal/testing')
const sdl = require('../src/javascript/index.js')

test("sdl::video", (t) => {
	t.ok(Array.isArray(sdl.video.displays))

	if (sdl.video.displays.length === 0) {
		console.warn("NO DISPLAYS FOUND")
		return
	}

	for (const display of sdl.video.displays) {
		t.equal(typeof display.name, 'string')
		t.ok(display.name.length > 0)

		t.equal(typeof display.format, 'string')
		t.ok(display.format.length > 0)

		t.equal(typeof display.frequency, 'number')

		t.equal(typeof display.geometry.x, 'number')
		t.equal(typeof display.geometry.y, 'number')
		t.equal(typeof display.geometry.width, 'number')
		t.equal(typeof display.geometry.height, 'number')

		t.equal(typeof display.usable.x, 'number')
		t.equal(typeof display.usable.y, 'number')
		t.equal(typeof display.usable.width, 'number')
		t.equal(typeof display.usable.height, 'number')

		t.equal(typeof display.dpi.horizontal, 'number')
		t.equal(typeof display.dpi.vertical, 'number')
		t.equal(typeof display.dpi.diagonal, 'number')
	}
})
