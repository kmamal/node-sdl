const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { ControllerInstance } = require('./controller-instance')
const { reconcileJoystickAndControllerDevices } = require('../events/reconcile-joystick-and-controller-devices')


const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const controller = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get devices () {
		Globals.events.poll()
		return Globals.controllerDevices
	}

	openDevice (device) { return new ControllerInstance(device) }

	addMappings (mappings) {
		if (!Array.isArray(mappings)) { throw Object.assign(new Error("mappings must be an array"), { mappings }) }
		for (const mapping of mappings) {
			if (typeof mapping !== 'string') { throw Object.assign(new Error("mapping must be a string"), { mappings }) }
		}

		Bindings.controller_addMappings(mappings)

		const devices = Bindings.joystick_getDevices()
		reconcileJoystickAndControllerDevices(devices)
	}
}()

module.exports = { controller }
