const Globals = require('../globals')
const { EventsViaPoll } = require('../events/events-via-poll')
const { assertInitialized } = require('../subsystems')
const { JoystickInstance } = require('./joystick-instance')

const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const joystick = new class extends EventsViaPoll {
	constructor () { super(validEvents, () => { assertInitialized('joystick') }) }

	get devices () {
		assertInitialized('joystick')
		Globals.events.poll()
		return [ ...Globals.joystickDevices ]
	}

	openDevice (device) {
		assertInitialized('joystick')
		return new JoystickInstance(device)
	}
}()

module.exports = { joystick }
