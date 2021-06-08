const Bindings = require('../bindings')
const { enums } = require('../enums')
const Globals = require('../globals')
const { Window } = require('./window')

const video = {
	get FORMAT () { return enums.pixel_format },
	get FORMAT_NAME () { return enums.pixel_format_names },

	get displays () { return Bindings.video_getDisplays() },

	get windows () { return [ ...Globals.windows.all.values() ] },
	get focused () { return Globals.windows.focused },
	get hovered () { return Globals.windows.hovered },

	createWindow: (options) => new Window(options),
}

module.exports = { video }
