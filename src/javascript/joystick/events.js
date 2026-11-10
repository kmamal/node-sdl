const Globals = require('../globals')
const { joystick: joystickModule } = require('.')
const { gamepad: gamepadModule } = require('../gamepad')
const { makeDevice: makeJoystickDevice } = require('./devices')
const { makeDevice: makeGamepadDevice, isGamepadDevice } = require('../gamepad/devices')
const { tryEmit, tryCall } = require('../events/try')

const handleEvent = (event, targetId) => {
	const { type } = event

	const collection = Globals.joystickInstances.byId.get(targetId)

	// Battery updates arrive as joystick events but also concern gamepads
	if (type === 'powerUpdate') {
		if (collection) {
			for (const joystickInstance of collection) {
				joystickInstance._power = event.power
				tryEmit(joystickInstance, type, event)
			}
		}

		const otherCollection = Globals.gamepadInstances.byId.get(targetId)
		if (!otherCollection) { return }

		for (const gamepadInstance of otherCollection) {
			gamepadInstance._power = event.power
			tryEmit(gamepadInstance, type, event)
		}
		return
	}

	if (!collection) { return }

	switch (type) {
		case 'axisMotion': {
			for (const joystickInstance of collection) {
				joystickInstance._axes[event.axis] = event.value
				tryEmit(joystickInstance, type, event)
			}
		} break

		case 'ballMotion': {
			for (const joystickInstance of collection) {
				const ball = joystickInstance._balls[event.ball]
				ball.x += event.dx
				ball.y += event.dy
				// Each instance accumulates its own x and y, so each gets its own copy of the event
				tryEmit(joystickInstance, type, { ...event, x: ball.x, y: ball.y })
			}
		} break

		case 'buttonDown': {
			for (const joystickInstance of collection) {
				joystickInstance._buttons[event.button] = true
				tryEmit(joystickInstance, type, event)
			}
		} break
		case 'buttonUp': {
			for (const joystickInstance of collection) {
				joystickInstance._buttons[event.button] = false
				tryEmit(joystickInstance, type, event)
			}
		} break

		case 'hatMotion': {
			for (const joystickInstance of collection) {
				joystickInstance._hats[event.hat] = event.value
				tryEmit(joystickInstance, type, event)
			}
		} break

		// No default
	}
}

const handleDeviceEvent = (isGamepad, event) => {
	// Thread might not have initialized this subsystem
	if (!Globals.initialized.joystick) { return }

	const { type } = event

	const emitter = isGamepad ? gamepadModule : joystickModule
	const list = isGamepad ? Globals.gamepadDevices : Globals.joystickDevices

	switch (type) {
		case 'deviceAdd': {
			const { device } = event
			delete event.device

			if (isGamepad && !isGamepadDevice(device)) { return }
			if (list.some((a) => a.id === device.id)) { return }

			const made = isGamepad ? makeGamepadDevice(device) : makeJoystickDevice(device)
			list.push(made)
			event.device = made
		} break

		case 'deviceRemove': {
			const { deviceId } = event
			delete event.deviceId

			const instances = isGamepad ? Globals.gamepadInstances : Globals.joystickInstances
			const collection = instances.byId.get(deviceId)
			if (collection) {
				for (const instance of collection.values()) {
					tryCall(() => { instance.close() })
				}
			}

			const index = list.findIndex((a) => a.id === deviceId)
			if (index === -1) { return }
			event.device = list[index]
			list.splice(index, 1)
		} break

		// No default
	}

	tryEmit(emitter, type, event)
}

const handleJoystickDeviceEvent = (event) => { handleDeviceEvent(false, event) }
const handleGamepadDeviceEvent = (event) => { handleDeviceEvent(true, event) }

module.exports = {
	handleEvent,
	handleJoystickDeviceEvent,
	handleGamepadDeviceEvent,
}
