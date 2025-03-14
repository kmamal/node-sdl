const Globals = require('../globals')
const { reconcileDevices } = require('./reconcile')

const {
	make: makeJoystickDevice,
	compare: compareJoystickDevice,
} = require('../joystick/device')
const {
	make: makeControllerDevice,
	compare: compareControllerDevice,
	filter: filterControllerDevice,
} = require('../controller/device')

const reconcileJoystickAndControllerDevices = (devices) => {
	const joystickDevices = devices
		.map(makeJoystickDevice)

	const controllerDevices = devices
		.filter(filterControllerDevice)
		.map(makeControllerDevice)

	reconcileDevices(
		require('../joystick').joystick,
		Globals.joystickDevices,
		joystickDevices,
		compareJoystickDevice,
	)

	reconcileDevices(
		require('../controller').controller,
		Globals.controllerDevices,
		controllerDevices,
		compareControllerDevice,
	)
}

module.exports = { reconcileJoystickAndControllerDevices }
