const Bindings = require('../bindings')
const Globals = require('../globals')
const { enums } = require('../enums')
const { Window } = require('./window')

const video = {
	get displays () {
		const displays = Bindings.video_getDisplays()
		for (const display of displays) {
			display.format = enums.pixelFormatNames[display.format]
		}
		return displays
	},

	get windows () { return [ ...Globals.windows.all.values() ] },
	get focused () { return Globals.windows.focused },
	get hovered () { return Globals.windows.hovered },

	createWindow: (options) => new Window(options),
}

module.exports = { video }
