import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import JoystickEvents from '../../src/javascript/joystick/events.js'
import GamepadEvents from '../../src/javascript/gamepad/events.js'
import { attachVirtual, withVirtual, pollEvents } from '../helpers/virtual.mjs'

const AXIS_MAX = 32767
const AXIS_MIN = -32768

T.test("sdl::joystick axis and button events", async (t) => {
	await withVirtual(false, (virtual) => {
		const instance = sdl.joystick.openDevice(virtual.joystick())
		const events = []
		const listener = (type, event) => { events.push({ ...event, type }) }
		instance.on('*', listener)
		try {
			virtual.setAxis(0, AXIS_MAX)
			virtual.setAxis(1, AXIS_MIN)
			virtual.setButton(1, true)
			pollEvents()

			t.equal(instance.axes, [ 1, -1 ])
			t.equal(instance.buttons, [ false, true ])
			t.ok(events.some((e) => e.type === 'axisMotion' && e.axis === 0 && e.value === 1))
			t.ok(events.some((e) => e.type === 'axisMotion' && e.axis === 1 && e.value === -1))
			t.ok(events.some((e) => e.type === 'buttonDown' && e.button === 1))

			events.length = 0
			virtual.setButton(1, false)
			virtual.setAxis(0, 0)
			pollEvents()

			t.equal(instance.axes, [ 0, -1 ])
			t.equal(instance.buttons, [ false, false ])
			t.ok(events.some((e) => e.type === 'buttonUp' && e.button === 1))
			t.ok(events.some((e) => e.type === 'axisMotion' && e.axis === 0 && e.value === 0))
		}
		finally {
			instance.off('*', listener)
			instance.close()
		}
	})
})

T.test("sdl::joystick events reach every instance of a device", async (t) => {
	await withVirtual(false, (virtual) => {
		const a = sdl.joystick.openDevice(virtual.joystick())
		const b = sdl.joystick.openDevice(virtual.joystick())
		try {
			virtual.setButton(0, true)
			pollEvents()
			t.equal(a.buttons, [ true, false ])
			t.equal(b.buttons, [ true, false ])

			a.close()
			virtual.setButton(0, false)
			pollEvents()
			t.equal(b.buttons, [ false, false ])
			t.throws(() => a.buttons)
		}
		finally {
			if (!a.closed) { a.close() }
			b.close()
		}
	})
})

T.test("sdl::gamepad axis and button events", async (t) => {
	await withVirtual(true, (virtual) => {
		const instance = sdl.gamepad.openDevice(virtual.gamepad())
		const events = []
		const listener = (type, event) => { events.push({ ...event, type }) }
		instance.on('*', listener)
		try {
			virtual.setAxis(0, AXIS_MAX)
			virtual.setButton(0, true)
			pollEvents()

			t.equal(instance.axes.leftStickX, 1)
			t.equal(instance.buttons.south, true)
			t.ok(events.some((e) => e.type === 'axisMotion' && e.axis === 'leftStickX' && e.value === 1))
			t.ok(events.some((e) => e.type === 'buttonDown' && e.button === 'south'))

			events.length = 0
			virtual.setButton(0, false)
			virtual.setAxis(0, AXIS_MIN)
			pollEvents()

			t.equal(instance.axes.leftStickX, -1)
			t.equal(instance.buttons.south, false)
			t.ok(events.some((e) => e.type === 'buttonUp' && e.button === 'south'))
		}
		finally {
			instance.off('*', listener)
			instance.close()
		}
	})
})

T.test("sdl::joystick deviceAdd and deviceRemove", (t) => {
	const joystickEvents = []
	const gamepadEvents = []
	const onJoystick = (type, event) => { joystickEvents.push([ type, event.device ]) }
	const onGamepad = (type, event) => { gamepadEvents.push([ type, event.device ]) }
	sdl.joystick.on('*', onJoystick)
	sdl.gamepad.on('*', onGamepad)

	const joystick = attachVirtual(false)
	const gamepad = attachVirtual(true)
	try {
		const joystickDevice = joystick.joystick()
		const gamepadDevice = gamepad.gamepad()

		t.ok(joystickEvents.some(([ type, device ]) => type === 'deviceAdd' && device === joystickDevice))
		t.ok(joystickEvents.some(([ type, device ]) => type === 'deviceAdd' && device.id === gamepad.id))
		t.ok(gamepadEvents.some(([ type, device ]) => type === 'deviceAdd' && device === gamepadDevice))
		t.ok(!gamepadEvents.some(([ , device ]) => device.id === joystick.id))

		const joystickInstance = sdl.joystick.openDevice(joystickDevice)
		const gamepadInstance = sdl.gamepad.openDevice(gamepadDevice)
		const gamepadAsJoystick = sdl.joystick.openDevice(gamepad.joystick())
		const closed = []
		const onClose = (instance) => () => { closed.push(instance) }
		for (const instance of [ joystickInstance, gamepadInstance, gamepadAsJoystick ]) {
			instance.on('close', onClose(instance))
		}

		joystick.detach()
		t.equal(joystickInstance.closed, true)
		t.equal(gamepadInstance.closed, false)
		t.ok(joystickEvents.some(([ type, device ]) => type === 'deviceRemove' && device === joystickDevice))
		t.ok(!sdl.joystick.devices.includes(joystickDevice))

		gamepad.detach()
		t.equal(gamepadInstance.closed, true)
		t.equal(gamepadAsJoystick.closed, true)
		t.ok(gamepadEvents.some(([ type, device ]) => type === 'deviceRemove' && device === gamepadDevice))
		t.ok(!sdl.gamepad.devices.includes(gamepadDevice))
		t.equal(closed, [ joystickInstance, gamepadInstance, gamepadAsJoystick ])
	}
	finally {
		joystick.detach()
		gamepad.detach()
		sdl.joystick.off('*', onJoystick)
		sdl.gamepad.off('*', onGamepad)
	}
})

T.test("sdl::joystick handles hat, ball, and power events", async (t) => {
	await withVirtual(false, (virtual) => {
		const a = sdl.joystick.openDevice(virtual.joystick())
		const b = sdl.joystick.openDevice(virtual.joystick())
		const events = []
		const listenerA = (type, event) => { events.push([ 'a', type, event ]) }
		const listenerB = (type, event) => { events.push([ 'b', type, event ]) }
		a.on('*', listenerA)
		b.on('*', listenerB)
		try {
			a._hats.push('centered')
			b._hats.push('centered')
			JoystickEvents.handleEvent({ type: 'hatMotion', hat: 0, value: 'up' }, virtual.id)
			t.equal(a.hats, [ 'up' ])
			t.equal(b.hats, [ 'up' ])

			a._balls.push({ x: 0, y: 0 })
			b._balls.push({ x: 10, y: 20 })
			JoystickEvents.handleEvent({ type: 'ballMotion', ball: 0, dx: 1, dy: 2 }, virtual.id)
			JoystickEvents.handleEvent({ type: 'ballMotion', ball: 0, dx: 3, dy: 4 }, virtual.id)
			t.equal(a.balls, [ { x: 4, y: 6 } ])
			t.equal(b.balls, [ { x: 14, y: 26 } ])
			const ballEvents = events.filter(([ , type ]) => type === 'ballMotion')
			t.equal(ballEvents.map(([ who, , event ]) => [ who, event.x, event.y, event.dx, event.dy ]), [
				[ 'a', 1, 2, 1, 2 ],
				[ 'b', 11, 22, 1, 2 ],
				[ 'a', 4, 6, 3, 4 ],
				[ 'b', 14, 26, 3, 4 ],
			])

			const power = { state: 'battery', percent: 50 }
			JoystickEvents.handleEvent({ type: 'powerUpdate', power }, virtual.id)
			t.equal(a.power, power)
			t.equal(b.power, power)
			t.equal(events.filter(([ , type ]) => type === 'powerUpdate').length, 2)

			events.length = 0
			JoystickEvents.handleEvent({ type: 'hatMotion', hat: 0, value: 'down' }, -1)
			JoystickEvents.handleEvent({ type: 'powerUpdate', power }, -1)
			t.equal(events, [])
		}
		finally {
			a.off('*', listenerA)
			b.off('*', listenerB)
			a.close()
			b.close()
		}
	})
})

T.test("sdl::gamepad handles power and steam handle events", async (t) => {
	await withVirtual(true, (virtual) => {
		const gamepadInstance = sdl.gamepad.openDevice(virtual.gamepad())
		const events = []
		const listener = (type, event) => { events.push([ type, event ]) }
		gamepadInstance.on('*', listener)
		try {
			const power = { state: 'charging', percent: 80 }
			JoystickEvents.handleEvent({ type: 'powerUpdate', power }, virtual.id)
			t.equal(gamepadInstance.power, power)
			t.ok(events.some(([ type ]) => type === 'powerUpdate'))

			GamepadEvents.handleEvent({ type: 'steamHandleUpdate', steamHandle: 123n }, virtual.id)
			t.equal(gamepadInstance.steamHandle, 123n)
			t.ok(events.some(([ type, event ]) => type === 'steamHandleUpdate' && event.steamHandle === 123n))

			GamepadEvents.handleEvent({ type: 'steamHandleUpdate', steamHandle: null }, virtual.id)
			t.equal(gamepadInstance.steamHandle, null)
		}
		finally {
			gamepadInstance.off('*', listener)
			gamepadInstance.close()
		}
	})
})

T.test("sdl::joystick listener errors go to the error event", async (t) => {
	await withVirtual(false, (virtual) => {
		const instance = sdl.joystick.openDevice(virtual.joystick())
		const errors = []
		const failing = () => { throw new Error("boom") }
		const onError = (error) => { errors.push(error.message) }
		instance.on('buttonDown', failing)
		instance.on('error', onError)
		try {
			virtual.setButton(0, true)
			pollEvents()
			t.equal(errors, [ "boom" ])
			t.equal(instance.buttons[0], true)
		}
		finally {
			instance.off('buttonDown', failing)
			instance.off('error', onError)
			instance.close()
		}
	})
})

T.test("sdl::joystick instance validation", async (t) => {
	t.throws(() => { sdl.joystick.openDevice(null) })
	t.throws(() => { sdl.joystick.openDevice({ id: -1 }) })
	t.throws(() => { sdl.gamepad.openDevice(null) })
	t.throws(() => { sdl.gamepad.openDevice({ id: -1 }) })
	t.throws(() => { sdl.joystick.on('foo', () => {}) })
	t.throws(() => { sdl.gamepad.addMappings('foo') })
	t.throws(() => { sdl.gamepad.addMappings([ 1 ]) })

	await withVirtual(false, (virtual) => {
		t.throws(() => { sdl.gamepad.openDevice(virtual.joystick()) })

		const instance = sdl.joystick.openDevice(virtual.joystick())
		try {
			t.throws(() => { instance.on('foo', () => {}) })
			t.throws(() => { instance.setPlayer(-1) })
			t.throws(() => { instance.setPlayer(1.5) })
			t.throws(() => { instance.setPlayer(2 ** 31) })
			t.throws(() => { instance.setLed(2, 0, 0) })
			t.throws(() => { instance.setLed(0, -1, 0) })
			t.throws(() => { instance.setLed(0, 0, NaN) })
			t.throws(() => { instance.rumble(2) })
			t.throws(() => { instance.rumble(1, -1) })
			t.throws(() => { instance.rumble(1, 1, -1) })
			t.throws(() => { instance.rumble(1, 1, 1.5) })
			t.throws(() => { instance.rumbleTriggers(1, 2) })
			t.equal(typeof instance.power, 'object')
		}
		finally { instance.close() }

		t.throws(() => { instance.close() })
		t.throws(() => instance.axes)
		t.throws(() => instance.balls)
		t.throws(() => instance.buttons)
		t.throws(() => instance.hats)
		t.throws(() => instance.power)
		t.throws(() => instance.hasLed)
		t.throws(() => instance.hasRumble)
		t.throws(() => instance.hasRumbleTriggers)
		t.throws(() => { instance.setPlayer(0) })
		t.throws(() => { instance.resetPlayer() })
		t.throws(() => { instance.on('axisMotion', () => {}) })
	})

	await withVirtual(true, (virtual) => {
		const instance = sdl.gamepad.openDevice(virtual.gamepad())
		try {
			t.throws(() => { instance.on('foo', () => {}) })
			t.throws(() => { instance.setPlayer(-1) })
			t.throws(() => { instance.setLed(2, 0, 0) })
			t.throws(() => { instance.rumble(2) })
			t.throws(() => { instance.rumbleTriggers(1, 1, -1) })
			t.equal(typeof instance.power, 'object')
		}
		finally { instance.close() }

		t.throws(() => { instance.close() })
		t.throws(() => instance.axes)
		t.throws(() => instance.buttons)
		t.throws(() => instance.buttonLabels)
		t.throws(() => instance.power)
		t.throws(() => instance.hasLed)
		t.throws(() => instance.hasRumble)
		t.throws(() => instance.hasRumbleTriggers)
		t.throws(() => { instance.setPlayer(0) })
		t.throws(() => { instance.resetPlayer() })
	})
})

T.test("sdl::joystick setPlayer and resetPlayer", async (t) => {
	await withVirtual(true, (virtual) => {
		const joystickInstance = sdl.joystick.openDevice(virtual.joystick())
		const gamepadInstance = sdl.gamepad.openDevice(virtual.gamepad())
		const original = virtual.joystick().player
		try {
			joystickInstance.setPlayer(3)
			t.equal(virtual.joystick().player, 3)
			t.equal(virtual.gamepad().player, 3)

			gamepadInstance.setPlayer(2)
			t.equal(virtual.joystick().player, 2)
			t.equal(virtual.gamepad().player, 2)

			joystickInstance.resetPlayer()
			t.equal(virtual.joystick().player, null)

			gamepadInstance.setPlayer(1)
			gamepadInstance.resetPlayer()
			t.equal(virtual.gamepad().player, null)
		}
		finally {
			if (original !== null) { joystickInstance.setPlayer(original) }
			joystickInstance.close()
			gamepadInstance.close()
		}
	})
})
