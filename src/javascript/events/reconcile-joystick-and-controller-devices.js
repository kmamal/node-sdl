const Globals = require('../globals')
const { reconcileDevices } = require('./reconcile')

const { joystick: joystickModule } = require('../joystick')
const {
	make: makeJoystickDevice,
	keys: joystickDeviceKeys,
} = require('../joystick/device')

const { controller: controllerModule } = require('../controller')
const {
	make: makeControllerDevice,
	keys: controllerDeviceKeys,
	filter: filterControllerDevice,
} = require('../controller/device')

const reconcileJoystickAndControllerDevices = (devices) => {
	const joystickDevices = devices
		.map(makeJoystickDevice)

	const controllerDevices = devices
		.filter(filterControllerDevice)
		.map(makeControllerDevice)

	reconcileDevices(
		joystickModule,
		Globals.joystickDevices,
		joystickDevices,
		joystickDeviceKeys,
	)

	reconcileDevices(
		controllerModule,
		Globals.controllerDevices,
		controllerDevices,
		controllerDeviceKeys,
	)
}

module.exports = { reconcileJoystickAndControllerDevices }
