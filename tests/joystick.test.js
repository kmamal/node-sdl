const { test } = require('@kmamal/testing')
const sdl = require('../src/javascript/index.js')

test("sdl::joystick", (t) => {
	t.ok(Array.isArray(sdl.joystick.devices))

	if (sdl.joystick.devices.length === 0) {
		console.warn("NO JOYSTICKS FOUND")
		return
	}

	//
})
