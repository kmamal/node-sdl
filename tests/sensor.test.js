const { test } = require('@kmamal/testing')
const sdl = require('../src/javascript/index.js')
// const E = require('@kmamal/evdev')

test("sdl::sensor", (t) => {
	t.equal(sdl.sensor.STANDARD_GRAVITY, 9.80665)


	t.ok(Array.isArray(sdl.sensor.devices))

	if (sdl.sensor.devices.length !== 0) {
		throw new Error("Please disconnect all sensors before running tests")
	}

	// const sensor = E.uinput.createDevice({
	// 	name: "Emulated Accelerometer",
	// 	props: [ E.INPUT_PROP_ACCELEROMETER ],
	// 	events: [
	// 		{ type: E.EV_ABS,
	// 			codes: [
	// 				{ code: E.ABS_X, min: -100, max: +100 },
	// 				{ code: E.ABS_Y, min: -100, max: +100 },
	// 				{ code: E.ABS_Z, min: -100, max: +100 },
	// 			] },
	// 	],
	// })

	// t.equal(sdl.sensor.devices.length, 1)

	//

	console.warn("SENSOR TESTS NOT IMPLEMENTED YET")
})
