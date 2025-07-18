const Globals = require('../globals')
const { reconcileDevices } = require('./reconcile')

const { joystick: joystickModule } = require('../joystick')
const {
	make: makeJoystickDevice,
	compare: compareJoystickDevice,
} = require('../joystick/device')

const { controller: controllerModule } = require('../controller')
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
		joystickModule,
		Globals.joystickDevices,
		joystickDevices,
		compareJoystickDevice,
	)

	reconcileDevices(
		controllerModule,
		Globals.controllerDevices,
		controllerDevices,
		compareControllerDevice,
	)
}

module.exports = { reconcileJoystickAndControllerDevices }
