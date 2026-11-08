const Globals = require('../globals')
const Bindings = require('../bindings')
const { validateNotClosed, validateObject } = require('../validate')
const { SharedDeviceInstance } = require('../joystick/shared-device-instance')

const validEvents = [
	'axisMotion',
	'buttonDown',
	'buttonUp',
	'powerUpdate',
	'steamHandleUpdate',
	'remap',
	'close',
]

class GamepadInstance extends SharedDeviceInstance {
	constructor (requested) {
		validateObject('device', requested)

		Globals.events.poll()

		const device = Globals.gamepadDevices.find(({ id }) => id === requested.id)
		if (!device) { throw Object.assign(new Error("device must be from sdl.gamepad.devices"), { device: requested }) }

		const result = Bindings.gamepad_open(device.id)

		super(validEvents, device, Globals.gamepadInstances, Bindings.gamepad_close)

		this._firmwareVersion = result.firmwareVersion
		this._serialNumber = result.serialNumber
		this._steamHandle = result.steamHandle
		this._power = result.power
		this._axes = result.axes
		this._buttons = result.buttons
		this._buttonLabels = result.buttonLabels
	}

	get steamHandle () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._steamHandle
	}

	get axes () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._axes
	}

	get buttons () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._buttons
	}

	get buttonLabels () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._buttonLabels
	}
}

module.exports = { GamepadInstance }
