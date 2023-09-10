const Bindings = require('../bindings')
const Globals = require('../globals')
const {
	make: makeControllerDevice,
	filter: filterControllerDevice,
} = require('./device')
const { EventsViaPoll } = require('../events/events-via-poll')
const { ControllerInstance } = require('./controller-instance')

Globals.controllerDevices = Bindings.joystick_getDevices()
	.filter(filterControllerDevice)
for (const controllerDevice of Globals.controllerDevices) {
	makeControllerDevice(controllerDevice)
}


const validEvents = [ 'deviceAdd', 'deviceRemove' ]

const controller = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get devices () { return Globals.controllerDevices }

	openDevice (device) { return new ControllerInstance(device) }

	addMappings (mappings) {
		if (!Array.isArray(mappings)) { throw Object.assign(new Error("mappings must be an array"), { mappings }) }
		for (const mapping of mappings) {
			if (typeof mapping !== 'string') { throw Object.assign(new Error("mapping must be a string"), { mappings }) }
		}

		Bindings.controller_addMappings(mappings)
	}
}()

module.exports = { controller }
