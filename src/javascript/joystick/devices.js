const Globals = require('../globals')
const Bindings = require('../bindings')
const { makeDevice: makeGamepadDevice } = require('../gamepad/devices')

const makeDevice = (device) => {
	const {
		isGamepad,
		gamepadMapping,
		gamepadName,
		gamepadType,
		...rest
	} = device
	return rest
}

const refreshDevices = () => {
	const devices = Bindings.joystick_getDevices()
	for (const joystickDevice of Globals.joystickDevices) {
		const device = devices.find(({ id }) => id === joystickDevice.id)
		if (device) { Object.assign(joystickDevice, makeDevice(device)) }
	}
	for (const gamepadDevice of Globals.gamepadDevices) {
		const device = devices.find(({ id }) => id === gamepadDevice.id)
		if (device?.isGamepad) { Object.assign(gamepadDevice, makeGamepadDevice(device)) }
	}
}

const handleDevicesChange = () => {
	// Thread might not have initialized this subsystem
	if (!Globals.initialized.joystick) { return }
	refreshDevices()
}

const refreshAndBroadcast = () => {
	refreshDevices()
	Globals.events.broadcastChange('joystickDevices')
}

module.exports = {
	makeDevice,
	handleDevicesChange,
	refreshAndBroadcast,
}
