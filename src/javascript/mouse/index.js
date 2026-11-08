const Globals = require('../globals')
const { assertInitialized, isAvailable } = require('../subsystems')
const Bindings = require('../bindings')
const Enums = require('../enums')
const { validateImage, validateRgbFormat } = require('../video/validate')
const { validateInteger, validateIntegerRange, validateFloat, validateString } = require('../validate')

let captured = false

const mouse = {
	isAvailable () { return isAvailable('video') },

	get BUTTON () { return Enums.mouseButtons },

	getButton (button) {
		assertInitialized('video')
		validateIntegerRange('button', button, 1, 32)

		Globals.events.poll()
		return Bindings.mouse_getButton(button)
	},

	get position () {
		assertInitialized('video')
		return Bindings.mouse_getPosition()
	},

	setPosition (x, y) {
		assertInitialized('video')
		validateFloat('x', x)
		validateFloat('y', y)

		Bindings.mouse_setPosition(x, y)
	},

	setCursor (cursor) {
		assertInitialized('video')
		validateString('cursor', cursor)

		const _cursor = Enums.cursors[cursor]
		if (_cursor === undefined) { throw Object.assign(new Error("invalid cursor"), { cursor }) }

		Bindings.mouse_setCursor(_cursor)
	},

	resetCursor () {
		assertInitialized('video')
		Bindings.mouse_resetCursor()
	},

	setCursorImage (width, height, stride, format, buffer, x, y) {
		assertInitialized('video')
		validateImage(width, height, stride, format, buffer, validateRgbFormat)
		validateInteger('x', x)
		if (x < 0 || x >= width) { throw Object.assign(new Error("x must be between 0 and width - 1"), { x, width }) }
		validateInteger('y', y)
		if (y < 0 || y >= height) { throw Object.assign(new Error("y must be between 0 and height - 1"), { y, height }) }

		const _format = Enums.pixelFormat[format]

		Bindings.mouse_setCursorImage(width, height, stride, _format, buffer, x, y)
	},

	showCursor (show = true) {
		assertInitialized('video')
		if (typeof show !== 'boolean') { throw Object.assign(new Error("show must be a boolean"), { show }) }

		Bindings.mouse_showCursor(show)
	},

	hideCursor () { mouse.showCursor(false) },

	redrawCursor () {
		assertInitialized('video')
		Bindings.mouse_redrawCursor()
	},

	get captured () { return captured },

	capture (capture = true) {
		assertInitialized('video')
		if (typeof capture !== 'boolean') { throw Object.assign(new Error("capture must be a boolean"), { capture }) }

		Bindings.mouse_capture(capture)
		captured = capture
	},

	uncapture () { mouse.capture(false) },
}

module.exports = { mouse }
