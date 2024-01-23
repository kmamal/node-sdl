const { test } = require('@kmamal/testing')
const sdl = require('../src/javascript/index.js')

test("sdl::sensor", (t) => {
	t.equal(sdl.sensor.STANDARD_GRAVITY, 9.80665)


	t.ok(Array.isArray(sdl.sensor.devices))

	if (sdl.sensor.devices.length === 0) {
		console.warn("NO SENSORS FOUND")
		return
	}

	//
})
