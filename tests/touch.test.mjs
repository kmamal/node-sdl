import E from '@kmamal/evdev'
import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

T.test("sdl::touch", async (t) => {
	t.timeout(4e3)

	t.ok(Array.isArray(sdl.touch.devices))

	t.equal(sdl.touch.devices.length, 0)

	const virtualPenTablet = E.uinput.createDevice({
		name: 'Emulated Wacom Tablet',
		props: [ E.INPUT_PROP_DIRECT ],
		events: [
			{
				type: E.EV_ABS,
				codes: [
					{ code: E.ABS_X, min: 0, max: 32767, resolution: 100 },
					{ code: E.ABS_Y, min: 0, max: 32767, resolution: 100 },
					{ code: E.ABS_PRESSURE, min: 0, max: 8191 },
				],
			},
			{
				type: E.EV_KEY,
				codes: [
					E.BTN_TOOL_PEN,
					E.BTN_TOOL_RUBBER,
					E.BTN_TOUCH,
					E.BTN_STYLUS,
					E.BTN_STYLUS2,
				],
			},
			{ type: E.EV_SYN, codes: [ E.SYN_REPORT, E.SYN_DROPPED ] },
		],
	})
	await new Promise((resolve) => { setTimeout(resolve, 1e3) })

	virtualPenTablet.writeEvents([
		{ type: E.EV_KEY, code: E.BTN_TOUCH, value: 0 },
		{ type: E.EV_KEY, code: E.BTN_TOOL_PEN, value: 1 },
		{ type: E.EV_SYN, code: E.SYN_REPORT, value: 0 },
	])
	virtualPenTablet.writeEvents([
		{ type: E.EV_KEY, code: E.BTN_TOUCH, value: 0 },
		{ type: E.EV_KEY, code: E.BTN_TOOL_PEN, value: 0 },
		{ type: E.EV_SYN, code: E.SYN_REPORT, value: 0 },
	])
	await new Promise((resolve) => { setTimeout(resolve, 1e3) })

	// t.equal(sdl.touch.devices.length, 1)

	// const device = sdl.touch.devices[0]

	// t.equal(typeof device.id, 'number')
	// t.equal(device.name, 'Emulated Wacom Tablet')
	// t.equal(device.type, 'direct')

	t.equal(sdl.touch.devices.length, 0)
	console.warn("TOUCH TESTS NOT IMPLEMENTED YET")

	virtualPenTablet.destroy()
	await new Promise((resolve) => { setTimeout(resolve, 1e3) })
})
