const Globals = require('../globals')
const { EventsViaPoll } = require('../events/events-via-poll')
const { JoystickInstance } = require('./joystick-instance')

const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const joystick = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get devices () { return Globals.joystickDevices }

	openDevice (device) { return new JoystickInstance(device) }
}()

module.exports = { joystick }
