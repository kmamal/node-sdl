const Bindings = require('../bindings')
const Globals = require('../globals')
const { make: makeJoystickDevice } = require('./device')
const { EventsViaPoll } = require('../events/events-via-poll')
const { JoystickInstance } = require('./joystick-instance')

Globals.joystickDevices = Bindings.joystick_getDevices()
for (const joystickDevice of Globals.joystickDevices) {
	makeJoystickDevice(joystickDevice)
}


const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const joystick = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get devices () { return Globals.joystickDevices }

	openDevice (device) { return new JoystickInstance(device) }
}()

module.exports = { joystick }
