const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { Window } = require('./window')

Globals.displays = Bindings.video_getDisplays()


const validEvents = [ 'displayAdd', 'displayRemove', 'displayOrient' ]

const video = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get displays () {
		Globals.events.poll()
		return Globals.displays
	}

	get windows () { return [ ...Globals.windows.all.values() ] }
	get focused () { return Globals.windows.focused }
	get hovered () { return Globals.windows.hovered }

	createWindow (options) { return new Window(options) }
}()

module.exports = { video }
