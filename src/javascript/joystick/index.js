const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { JoystickInstance } = require('./joystick-instance')


const { make: makeJoystickDevice } = require('./device')
const {
	make: makeGamepadDevice,
	filter: filterGamepadDevice,
} = require('../gamepad/device')

const devices = Bindings.joystick_getDevices()
Globals.joystickDevices = devices
	.map(makeJoystickDevice)
Globals.gamepadDevices = devices
	.filter(filterGamepadDevice)
	.map(makeGamepadDevice)


const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const joystick = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get devices () {
		Globals.events.poll()
		return [ ...Globals.joystickDevices ]
	}

	openDevice (device) { return new JoystickInstance(device) }
}()

module.exports = { joystick }
