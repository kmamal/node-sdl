import E from '@kmamal/evdev'
import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

T.test("sdl::gamepad", async (t) => {
	t.timeout(3e3)

	t.ok(Array.isArray(sdl.gamepad.devices))

	t.equal(sdl.gamepad.devices.length, 0)

	const virtualJoystick = E.uinput.createDevice({
		name: 'Emulated Joystick',
		events: [
			{
				type: E.EV_KEY,
				codes: [ E.BTN_A, E.BTN_B, E.BTN_X, E.BTN_Y ],
			},
			{
				type: E.EV_ABS,
				codes: [
					{ code: E.ABS_X, min: -100, max: +100 },
					{ code: E.ABS_Y, min: -100, max: +100 },
				],
			},
		],
	})
	await new Promise((resolve) => { setTimeout(resolve, 1e3) })

	t.equal(sdl.gamepad.devices.length, 1)

	const device = sdl.gamepad.devices[0]

	t.equal(typeof device.id, 'number')
	t.equal(device.name, 'Emulated Joystick')
	t.equal(typeof device.path, 'string')
	t.equal(typeof device.guid, 'string')
	t.equal(device.guid.length, 32)
	t.equal(device.vendor, null)
	t.equal(device.product, null)
	t.equal(device.version, null)
	t.equal(typeof device.player, 'number')

	t.equal(typeof device.mapping, 'string')
	t.equal(device.mapping.slice(0, 32), device.guid)
	t.equal(device.mapping.slice(33, 33 + device.name.length), device.name)

	const instance = sdl.gamepad.openDevice(device)

	t.equal(instance.device, device)
	t.equal(instance.firmwareVersion, null)
	t.equal(instance.serialNumber, null)
	t.equal(instance.steamHandle, null)
	t.equal(instance.hasLed, false)
	t.equal(instance.hasRumble, false)
	t.equal(instance.hasRumbleTriggers, false)
	t.throws(() => { instance.setLed(1, 0, 0) })
	t.throws(() => { instance.rumble() })
	t.throws(() => { instance.stopRumble() })
	t.throws(() => { instance.rumbleTriggers() })
	t.throws(() => { instance.stopRumbleTriggers() })

	t.equal(Object.keys(instance.axes), [
		'leftStickX',
		'leftStickY',
		'rightStickX',
		'rightStickY',
		'leftTrigger',
		'rightTrigger',
	])

	t.equal(instance.buttons, {
		dpadLeft: false,
		dpadRight: false,
		dpadUp: false,
		dpadDown: false,
		south: false,
		east: false,
		west: false,
		north: false,
		guide: false,
		back: false,
		start: false,
		leftStick: false,
		rightStick: false,
		leftShoulder: false,
		rightShoulder: false,
		rightPaddle1: false,
		leftPaddle1: false,
		rightPaddle2: false,
		leftPaddle2: false,
		misc1: false,
		misc2: false,
		misc3: false,
		misc4: false,
		misc5: false,
		misc6: false,
		touchpad: false,
	})

	t.equal(Object.keys(instance.buttonLabels), [ 'south', 'east', 'west', 'north' ])

	const newMapping = device.mapping.replace(device.name, 'foobar')
	sdl.gamepad.addMappings([ newMapping ])
	t.equal(instance.device, device)
	t.equal(instance.device.name, 'foobar')

	t.equal(instance.closed, false)
	instance.close()
	t.equal(instance.closed, true)

	virtualJoystick.destroy()
	await new Promise((resolve) => { setTimeout(resolve, 1e3) })
})
