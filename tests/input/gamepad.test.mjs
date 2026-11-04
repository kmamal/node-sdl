import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import { withVirtual } from '../helpers/virtual.mjs'
import { indexPath, runProcess } from '../helpers/worker.mjs'

T.test("sdl::gamepad", async (t) => {
	t.ok(Array.isArray(sdl.gamepad.devices))

	const id = await withVirtual(true, (virtual) => {
		t.equal(virtual.joystick().type, 'gamepad')

		const device = virtual.gamepad()
		t.ok(device)

		t.equal(device.id, virtual.id)
		t.equal(device.name, 'Virtual Gamepad')
		t.equal(device.path, null)
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
		try {
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

			const { mapping } = device
			try {
				let remapName = null
				instance.once('remap', () => { remapName = instance.device.name })
				sdl.gamepad.addMappings([ mapping.replace(device.name, 'foobar') ])
				t.equal(instance.device, device)
				t.equal(instance.device.name, 'foobar')
				t.equal(remapName, 'foobar')
			}
			finally { sdl.gamepad.addMappings([ mapping ]) }
			t.equal(device.name, 'Virtual Gamepad')

			t.equal(instance.closed, false)
		}
		finally { instance.close() }
		t.equal(instance.closed, true)

		return virtual.id
	})

	t.ok(!sdl.gamepad.devices.some((device) => device.id === id))
})

T.test("sdl::gamepad.addMappings turns joysticks into gamepads", async (t) => {
	t.timeout(10e3)

	const { stdout, status } = await runProcess(`
		import sdl from ${JSON.stringify(indexPath)}
		import Bindings from ${JSON.stringify(indexPath.replace(/index\.js$/u, 'bindings.js'))}
		sdl.gamepad.devices
		const id = Bindings.testing_attachVirtualJoystick(false)
		const device = sdl.joystick.devices.find((x) => x.id === id)
		const isGamepad = () => sdl.gamepad.devices.some((x) => x.id === id)
		const platforms = { Linux: 'Linux', macOS: 'Mac OS X', Windows: 'Windows' }
		const mapping = (platform) => device.guid + ',Mapped Joystick,a:b0,b:b1,leftx:a0,lefty:a1,platform:' + platform + ','
		const result = { initial: [ device.type, isGamepad() ] }
		sdl.gamepad.addMappings(Object.entries(platforms).filter(([ key ]) => key !== sdl.info.platform).map(([ , value ]) => mapping(value)))
		result.otherPlatforms = [ device.type, isGamepad() ]
		sdl.gamepad.addMappings([ mapping(platforms[sdl.info.platform]) ])
		result.thisPlatform = [ device.type, isGamepad() ]
		result.sameDevice = sdl.joystick.devices.find((x) => x.id === id) === device
		result.name = sdl.gamepad.devices.find((x) => x.id === id)?.name
		Bindings.testing_detachVirtualJoystick(id)
		console.log(JSON.stringify(result))
	`)

	t.equal(status, 0)
	t.equal(JSON.parse(stdout), {
		initial: [ null, false ],
		otherPlatforms: [ null, false ],
		thisPlatform: [ 'gamepad', true ],
		sameDevice: true,
		name: 'Mapped Joystick',
	})
})
