const Globals = require('../globals')
const Bindings = require('../bindings')
const Enums = require('../enums')
const { validateImage, validateRgbFormat } = require('../video/validate')
const { validateInteger, validateIntegerRange, validateNumber, validateString } = require('../validate')

let captured = false

const mouse = {
	get BUTTON () { return Enums.mouseButtons },

	getButton (button) {
		validateIntegerRange('button', button, 1, 32)

		Globals.events.poll()
		return Bindings.mouse_getButton(button)
	},

	get position () { return Bindings.mouse_getPosition() },

	setPosition (x, y) {
		validateNumber('x', x)
		validateNumber('y', y)

		Bindings.mouse_setPosition(x, y)
	},

	setCursor (cursor) {
		validateString('cursor', cursor)

		const _cursor = Enums.cursors[cursor]
		if (_cursor === undefined) { throw Object.assign(new Error("invalid cursor"), { cursor }) }

		Bindings.mouse_setCursor(_cursor)
	},

	resetCursor () { Bindings.mouse_resetCursor() },

	setCursorImage (width, height, stride, format, buffer, x, y) {
		validateImage(width, height, stride, format, buffer, validateRgbFormat)
		validateInteger('x', x)
		if (x < 0 || x >= width) { throw Object.assign(new Error("x must be between 0 and width - 1"), { x, width }) }
		validateInteger('y', y)
		if (y < 0 || y >= height) { throw Object.assign(new Error("y must be between 0 and height - 1"), { y, height }) }

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
