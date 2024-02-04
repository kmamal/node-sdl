import E from '@kmamal/evdev'

const virtualJoystick = E.uinput.createDevice({
	name: 'Emulated Joystick',
	events: [
		{
			type: E.EV_KEY,
			codes: [ E.BTN_A, E.BTN_B, E.BTN_X, E.BTN_Y ],
		},
		{ type: E.EV_ABS,
			codes: [
				{ code: E.ABS_X, min: -100, max: +100 },
				{ code: E.ABS_Y, min: -100, max: +100 },
			] },
	],
})


await new Promise((resolve) => { setTimeout(resolve, 3e3) })


import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

T.test("sdl::joystick", (t) => {
	t.ok(Array.isArray(sdl.joystick.devices))

	t.equal(sdl.joystick.devices.length, 1)

	const device = sdl.joystick.devices[0]

	t.equal(typeof device.id, 'number')
	t.equal(device.type, 'gamecontroller')
	t.equal(device.name, 'Emulated Joystick')
	t.equal(typeof device.path, 'string')
	t.equal(typeof device.guid, 'string')
	t.equal(device.guid.length, 32)
	t.equal(device.vendor, null)
	t.equal(device.product, null)
	t.equal(device.version, null)
	t.equal(typeof device.player, 'number')

	const instance = sdl.joystick.openDevice(device)

	t.equal(instance.device, device)
	t.equal(instance.firmwareVersion, null)
	t.equal(instance.serialNumber, null)
	t.equal(instance.hasLed, false)
	t.equal(instance.hasRumble, false)
	t.equal(instance.hasRumbleTriggers, false)

	t.ok(Array.isArray(instance.axes))
	t.equal(instance.axes.length, 2)
	for (const axis of instance.axes) {
		t.equal(typeof axis, 'number')
	}

	t.ok(Array.isArray(instance.buttons))
	t.equal(instance.buttons.length, 2)
	for (const button of instance.buttons) {
		t.equal(typeof button, 'boolean')
	}

	t.ok(Array.isArray(instance.balls))
	t.equal(instance.balls.length, 0)

	t.ok(Array.isArray(instance.hats))
	t.equal(instance.hats.length, 0)

	t.equal(instance.closed, false)
	instance.close()
	t.equal(instance.closed, true)

	virtualJoystick.destroy()
})
