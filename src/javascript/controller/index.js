const Bindings = require('../bindings').default
const Globals = require('../globals')
const { EventsViaPoll } = require('../events/events-via-poll').default
const { ControllerInstance } = require('./controller-instance')

const validEvents = [ 'deviceAdd', 'deviceRemove', 'deviceRemap' ]

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
