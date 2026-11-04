import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import { withVirtual } from '../helpers/virtual.mjs'

T.test("sdl::joystick", async (t) => {
	t.ok(Array.isArray(sdl.joystick.devices))

	const id = await withVirtual(false, (virtual) => {
		const device = virtual.joystick()
		t.ok(device)

		t.equal(device.id, virtual.id)
		t.equal(device.type, null)
		t.equal(device.name, 'Virtual Joystick')
		t.equal(device.path, null)
		t.equal(typeof device.guid, 'string')
		t.equal(device.guid.length, 32)
		t.equal(device.vendor, null)
		t.equal(device.product, null)
		t.equal(device.version, null)
		t.ok(device.player === null || Number.isInteger(device.player))

		const instance = sdl.joystick.openDevice(device)
		try {
			t.equal(instance.device, device)
			t.equal(instance.firmwareVersion, null)
			t.equal(instance.serialNumber, null)
			t.equal(instance.hasLed, false)
			t.equal(instance.hasRumble, false)
			t.equal(instance.hasRumbleTriggers, false)
			t.throws(() => { instance.setLed(1, 0, 0) })
			t.throws(() => { instance.rumble() })
			t.throws(() => { instance.stopRumble() })
			t.throws(() => { instance.rumbleTriggers() })
			t.throws(() => { instance.stopRumbleTriggers() })

			t.equal(instance.axes, [ 0, 0 ])
			t.equal(instance.buttons, [ false, false ])
			t.equal(instance.balls, [])
			t.equal(instance.hats, [])

			t.equal(instance.closed, false)
		}
		finally { instance.close() }
		t.equal(instance.closed, true)

		return virtual.id
	})

	t.ok(!sdl.joystick.devices.some((device) => device.id === id))
})
