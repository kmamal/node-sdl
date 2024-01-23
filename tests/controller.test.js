const { test } = require('@kmamal/testing')
const sdl = require('../src/javascript/index.js')

test("sdl::controller", (t) => {
	t.ok(Array.isArray(sdl.controller.devices))

	if (sdl.controller.devices.length === 0) {
		console.warn("NO CONTROLLERS FOUND")
		return
	}

	//
})
