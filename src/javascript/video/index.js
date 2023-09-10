const Bindings = require('../bindings')
const Globals = require('../globals')
const Enums = require('../enums')
const { EventsViaPoll } = require('../events/events-via-poll')
const { Window } = require('./window')

Globals.displays = Bindings.video_getDisplays()
for (const display of Globals.displays) {
	display.format = Enums.pixelFormatNames[display.format]
}


const validEvents = [ 'displayAdd', 'displayRemove', 'displayOrient' ]

const video = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get displays () { return Globals.displays }

	get windows () { return [ ...Globals.windows.all.values() ] }
	get focused () { return Globals.windows.focused }
	get hovered () { return Globals.windows.hovered }

	createWindow (options) { return new Window(options) }
}()

module.exports = { video }
