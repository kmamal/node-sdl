const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { assertInitialized, isAvailable } = require('../subsystems')
const { GamepadInstance } = require('./gamepad-instance')
const { refreshAndBroadcast } = require('../joystick/devices')
const { validateString } = require('../validate')

const validEvents = [ 'deviceAdd', 'deviceRemove' ]

// Updated mappings change existing joystick and gamepad devices without an event
const refreshDevices = () => {
	refreshAndBroadcast()
	Globals.events.poll()
}

const gamepad = new class extends EventsViaPoll {
	constructor () { super(validEvents, () => { assertInitialized('gamepad') }) }

	isAvailable () { return isAvailable('gamepad') }

	get devices () {
		assertInitialized('gamepad')
		Globals.events.poll()
		return [ ...Globals.gamepadDevices ]
	}

	openDevice (device) {
		assertInitialized('gamepad')
		return new GamepadInstance(device)
	}

	addMappings (mappings) {
		assertInitialized('gamepad')
		if (!Array.isArray(mappings)) { throw Object.assign(new Error("mappings must be an array"), { mappings }) }
		for (const mapping of mappings) {
			validateString('mapping', mapping)
		}

		try { Bindings.gamepad_addMappings(mappings) }
		catch (error) {
			try { refreshDevices() }
			catch (_) { }
			throw error
		}
		refreshDevices()
	}
}()

module.exports = { gamepad }
