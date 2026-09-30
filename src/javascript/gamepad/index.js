const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { GamepadInstance } = require('./gamepad-instance')
const { make: makeGamepadDevice } = require('./device')
const { make: makeJoystickDevice } = require('../joystick/device')

const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const gamepad = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get devices () {
		Globals.events.poll()
		return [ ...Globals.gamepadDevices ]
	}

	openDevice (device) { return new GamepadInstance(device) }

	addMappings (mappings) {
		if (!Array.isArray(mappings)) { throw Object.assign(new Error("mappings must be an array"), { mappings }) }
		for (const mapping of mappings) {
			if (typeof mapping !== 'string') { throw Object.assign(new Error("mapping must be a string"), { mapping }) }
		}

		try { Bindings.gamepad_addMappings(mappings) }
		finally {
			// Updated mappings change existing joystick and gamepad devices without an event
			const devices = Bindings.joystick_getDevices()
			for (const joystickDevice of Globals.joystickDevices) {
				const device = devices.find(({ id }) => id === joystickDevice.id)
				if (device) { Object.assign(joystickDevice, makeJoystickDevice(device)) }
			}
			for (const gamepadDevice of Globals.gamepadDevices) {
				const device = devices.find(({ id }) => id === gamepadDevice.id)
				if (device?.isGamepad) { Object.assign(gamepadDevice, makeGamepadDevice(device)) }
			}

			Globals.events.poll()
		}
	}
}()

module.exports = { gamepad }
