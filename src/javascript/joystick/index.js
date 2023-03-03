import { joystickDevices } from '../globals.js'
import { EventsViaPoll } from '../events/events-via-poll.js'
import { JoystickInstance } from './joystick-instance.js'

const validEvents = ['deviceAdd', 'deviceRemove']

class JoystickEventsPoll extends EventsViaPoll {
	constructor() { super(validEvents) }

	get devices() { return joystickDevices }

	openDevice(device) { return new JoystickInstance(device) }
}
export const joystick = new JoystickEventsPoll()
