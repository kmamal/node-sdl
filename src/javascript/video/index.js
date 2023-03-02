import Bindings from '../bindings'
import { windows as _windows } from '../globals'
import Enums from '../enums'
import { Window } from './window'

const video = {
	get displays () {
		const displays = Bindings.video_getDisplays()
		for (const display of displays) {
			display.format = Enums.pixelFormatNames[display.format]
		}
		return displays
	},

	get windows () { return [ ..._windows.all.values() ] },
	get focused () { return _windows.focused },
	get hovered () { return _windows.hovered },

	createWindow: (options) => new Window(options),
}

export default { video }
