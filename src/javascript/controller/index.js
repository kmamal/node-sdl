import Bindings from '../bindings.js'
import * as Globals from '../globals.js'
import { EventsViaPoll } from '../events/events-via-poll.js'
import { ControllerInstance } from './controller-instance.js'

const validEvents = ['deviceAdd', 'deviceRemove', 'deviceRemap']

export class controller extends EventsViaPoll {
	constructor() { super(validEvents) }

	get devices() { return Globals.controllerDevices }

	openDevice(device) { return new ControllerInstance(device) }

	addMappings(mappings) {
		if (!Array.isArray(mappings)) { throw Object.assign(new Error("mappings must be an array"), { mappings }) }
		for (const mapping of mappings) {
			if (typeof mapping !== 'string') { throw Object.assign(new Error("mapping must be a string"), { mappings }) }
		}

		Bindings.controller_addMappings(mappings)
	}
}
