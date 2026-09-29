const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { Window } = require('./window')
const { getFormatHelpers } = require('./format-helpers')


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

	minBufferSize (format, stride, height) {
		const helpers = getFormatHelpers(format)
		if (!Number.isInteger(stride)) { throw Object.assign(new Error("stride must be an integer"), { stride }) }
		if (stride < 0) { throw Object.assign(new Error("invalid stride"), { stride }) }
		if (!Number.isInteger(height)) { throw Object.assign(new Error("height must be an integer"), { height }) }
		if (height < 0) { throw Object.assign(new Error("invalid height"), { height }) }
		return helpers.minBufferSize(stride, height)
	}
}()

module.exports = { video }
