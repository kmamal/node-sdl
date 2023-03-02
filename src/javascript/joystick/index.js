import { joystickDevices } from '../globals'
import { EventsViaPoll } from '../events/events-via-poll'
import { JoystickInstance } from './joystick-instance'

const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const joystick = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get devices () { return joystickDevices }

	openDevice (device) { return new JoystickInstance(device) }
}()

export default { joystick }
