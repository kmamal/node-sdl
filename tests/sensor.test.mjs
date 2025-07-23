import E from '@kmamal/evdev'
import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

T.test("sdl::sensor", async (t) => {
	t.timeout(3e3)

	t.equal(sdl.sensor.STANDARD_GRAVITY, 9.80665)

	t.ok(Array.isArray(sdl.sensor.devices))

	t.equal(sdl.sensor.devices.length, 0)

	const sensor = E.uinput.createDevice({
		name: "Emulated Accelerometer",
		props: [ E.INPUT_PROP_ACCELEROMETER ],
		events: [
			{
				type: E.EV_ABS,
				codes: [
					{ code: E.ABS_X, min: -100, max: +100, resolution: 3 },
					{ code: E.ABS_Y, min: -100, max: +100, resolution: 3 },
					{ code: E.ABS_Z, min: -100, max: +100, resolution: 3 },
				],
			},
		],
	})
	await new Promise((resolve) => { setTimeout(resolve, 1e3) })

	//

	t.equal(sdl.sensor.devices.length, 0)
	console.warn("SENSOR TESTS NOT IMPLEMENTED YET")

	sensor.destroy()
	await new Promise((resolve) => { setTimeout(resolve, 1e3) })
})
