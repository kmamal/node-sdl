const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { JoystickInstance } = require('./joystick-instance')


const { make: makeJoystickDevice } = require('./device')
const {
	make: makeControllerDevice,
	filter: filterControllerDevice,
} = require('../controller/device')

const devices = Bindings.joystick_getDevices()
Globals.joystickDevices = devices
	.map(makeJoystickDevice)
Globals.controllerDevices = devices
	.filter(filterControllerDevice)
	.map(makeControllerDevice)


const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const joystick = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get devices () {
		Globals.events.poll()
		return Globals.joystickDevices
	}

	openDevice (device) { return new JoystickInstance(device) }
}()

module.exports = { joystick }
