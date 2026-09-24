const Globals = require('../globals')
const Bindings = require('../bindings')
const Enums = require('../enums')
const { VideoFormatHelpers } = require('../video/format-helpers')

let captured = false

const mouse = {
	get BUTTON () { return Enums.mouseButtons },

	getButton (button) {
		if (!Number.isInteger(button)) { throw Object.assign(new Error("button must be an integer"), { button }) }
		if (button < 1 || button > 32) { throw Object.assign(new Error("invalid button"), { button }) }

		Globals.events.poll()
		return Bindings.mouse_getButton(button)
	},

	get position () { return Bindings.mouse_getPosition() },

	setPosition (x, y) {
		if (!Number.isFinite(x)) { throw Object.assign(new Error("x must be a number"), { x }) }
		if (!Number.isFinite(y)) { throw Object.assign(new Error("y must be a number"), { y }) }

		Bindings.mouse_setPosition(x, y)
	},

	setCursor (cursor) {
		if (typeof cursor !== 'string') { throw Object.assign(new Error("cursor must be a string"), { cursor }) }

		const _cursor = Enums.cursors[cursor]
		if (_cursor === undefined) { throw Object.assign(new Error("invalid cursor"), { cursor }) }

		Bindings.mouse_setCursor(_cursor)
	},

	resetCursor () { Bindings.mouse_resetCursor() },

	setCursorImage (width, height, stride, format, buffer, x, y) {
		if (!Number.isInteger(width)) { throw Object.assign(new Error("width must be an integer"), { width }) }
		if (width <= 0 || width > 2 ** 31 - 1) { throw Object.assign(new Error("invalid width"), { width }) }
		if (!Number.isInteger(height)) { throw Object.assign(new Error("height must be an integer"), { height }) }
		if (height <= 0 || height > 2 ** 31 - 1) { throw Object.assign(new Error("invalid height"), { height }) }
		if (!Number.isInteger(stride)) { throw Object.assign(new Error("stride must be an integer"), { stride }) }
		if (typeof format !== 'string') { throw Object.assign(new Error("format must be a string"), { format }) }
		const helpers = VideoFormatHelpers[format]
		if (helpers === undefined) { throw Object.assign(new Error("invalid format"), { format }) }
		if (helpers.isYuv) { throw Object.assign(new Error("format must be an RGB format"), { format }) }
		if (stride < width * helpers.bytesPerPixel || stride > 2 ** 31 - 1) { throw Object.assign(new Error("invalid stride"), { stride, width, bytesPerPixel: helpers.bytesPerPixel }) }
		if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
		if (buffer.length < helpers.minBufferSize(stride, height)) { throw Object.assign(new Error("buffer is smaller than expected"), { buffer, stride, height, format }) }
		if (!Number.isInteger(x)) { throw Object.assign(new Error("x must be an integer"), { x }) }
		if (x < 0 || x >= width) { throw Object.assign(new Error("invalid x"), { x }) }
		if (!Number.isInteger(y)) { throw Object.assign(new Error("y must be an integer"), { y }) }
		if (y < 0 || y >= height) { throw Object.assign(new Error("invalid y"), { y }) }

		const _format = Enums.pixelFormat[format]

		Bindings.mouse_setCursorImage(width, height, stride, _format, buffer, x, y)
	},

	showCursor (show = true) {
		if (typeof show !== 'boolean') { throw Object.assign(new Error("show must be a boolean"), { show }) }

		Bindings.mouse_showCursor(show)
	},

	hideCursor () { mouse.showCursor(false) },

	redrawCursor () { Bindings.mouse_redrawCursor() },

	get captured () { return captured },

	capture (capture = true) {
		if (typeof capture !== 'boolean') { throw Object.assign(new Error("capture must be a boolean"), { capture }) }

		Bindings.mouse_capture(capture)
		captured = capture
	},

	uncapture () { mouse.capture(false) },
}

module.exports = { mouse }
