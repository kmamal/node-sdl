const Globals = require('../globals')
const Bindings = require('../bindings')
const { validateNotClosed } = require('../validate')
const { lookupDevice } = require('../device-instance')
const { JoystickDeviceInstance } = require('./joystick-device-instance')

const validEvents = [
	'axisMotion',
	'ballMotion',
	'buttonDown',
	'buttonUp',
	'hatMotion',
	'powerUpdate',
	'close',
]

class JoystickInstance extends JoystickDeviceInstance {
	constructor (requested) {
		const device = lookupDevice(requested, 'joystick', () => Globals.joystickDevices)

		const result = Bindings.joystick_open(device.id)

		super(validEvents, device, Globals.joystickInstances, Bindings.joystick_close)

		this._firmwareVersion = result.firmwareVersion
		this._serialNumber = result.serialNumber
		this._axes = result.axes
		this._balls = result.balls
		this._buttons = result.buttons
		this._hats = result.hats
		this._power = result.power
	}

	get axes () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._axes
	}

	get balls () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._balls
	}

	get buttons () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._buttons
	}

	get hats () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._hats
	}
}

module.exports = { JoystickInstance }
