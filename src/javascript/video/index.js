const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { Window } = require('./window')
const { getFormatHelpers } = require('./format-helpers')
const { validateNonNegativeInteger } = require('../validate')


Globals.displays = Globals.info.initialized.video
	? Bindings.video_getDisplays()
	: []


const validEvents = [
	'displayAdd',
	'displayRemove',
	'displayOrient',
	'displayMove',
	'displayScaleChange',
	'displayModeChange',
	'displayUsableChange',
]

const video = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get displays () {
		Globals.events.poll()
		return [ ...Globals.displays ]
	}

	get windows () { return [ ...Globals.windows.all.values() ] }

	get focused () {
		Globals.events.poll()
		return Globals.windows.focused
	}

	get hovered () {
		Globals.events.poll()
		return Globals.windows.hovered
	}

	createWindow (options) { return new Window(options) }

	bytesPerPixel (format) { return getFormatHelpers(format).bytesPerPixel }
	isYuv (format) { return getFormatHelpers(format).isYuv }
	isPlanarYuv (format) { return getFormatHelpers(format).isPlanarYuv }

	minStride (format, width) {
		const helpers = getFormatHelpers(format)
		validateNonNegativeInteger('width', width)
		return helpers.minStride(width)
	}

	minBufferSize (format, stride, height) {
		const helpers = getFormatHelpers(format)
		validateNonNegativeInteger('stride', stride)
		validateNonNegativeInteger('height', height)
		return helpers.minBufferSize(stride, height)
	}
}()

module.exports = { video }
