const Globals = require('../globals')
const { makeDevice: makeGamepadDevice } = require('./devices')
const { tryEmit } = require('../events/try')

const handleEvent = (event, targetId) => {
	const { type } = event

	const collection = Globals.gamepadInstances.byId.get(targetId)
	if (!collection) { return }

	switch (type) {
		case 'axisMotion': {
			for (const gamepadInstance of collection) {
				gamepadInstance._axes[event.axis] = event.value
				tryEmit(gamepadInstance, type, event)
			}
		} break

		case 'buttonDown': {
			for (const gamepadInstance of collection) {
				gamepadInstance._buttons[event.button] = true
				tryEmit(gamepadInstance, type, event)
			}
		} break

		case 'buttonUp': {
			for (const gamepadInstance of collection) {
				gamepadInstance._buttons[event.button] = false
				tryEmit(gamepadInstance, type, event)
			}
		} break

		case 'steamHandleUpdate': {
			for (const gamepadInstance of collection) {
				gamepadInstance._steamHandle = event.steamHandle
				tryEmit(gamepadInstance, type, event)
			}
		} break

		case 'remap': {
			const { device, axes, buttons, buttonLabels } = event
			delete event.device
			delete event.axes
			delete event.buttons
			delete event.buttonLabels

			const gamepadDevice = Globals.gamepadDevices.find(({ id }) => id === targetId)
			if (gamepadDevice) { Object.assign(gamepadDevice, makeGamepadDevice(device)) }

			for (const gamepadInstance of collection) {
				Object.assign(gamepadInstance._axes, axes)
				Object.assign(gamepadInstance._buttons, buttons)
				Object.assign(gamepadInstance._buttonLabels, buttonLabels)
				tryEmit(gamepadInstance, type, event)
			}
		} break

		// No default
	}
}

module.exports = { handleEvent }
