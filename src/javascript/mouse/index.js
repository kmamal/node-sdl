const Globals = require('../globals')
const { assertInitialized, isAvailable } = require('../subsystems')
const Bindings = require('../bindings')
const Enums = require('../enums')
const { validateImage, validateRgbFormat } = require('../video/validate')
const { validateBoolean, validateIntegerRange, validateFloat, validateString } = require('../validate')

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
		validateIntegerRange('x', x, 0, width - 1, "must be between 0 and width - 1")
		validateIntegerRange('y', y, 0, height - 1, "must be between 0 and height - 1")

		const _format = Enums.pixelFormat[format]

		Bindings.mouse_setCursorImage(width, height, stride, _format, buffer, x, y)
	},

	showCursor (show = true) {
		assertInitialized('video')
		validateBoolean('show', show)

		Bindings.mouse_showCursor(show)
	},

	hideCursor () { mouse.showCursor(false) },

	redrawCursor () {
		assertInitialized('video')
		Bindings.mouse_redrawCursor()
	},

	get captured () {
		assertInitialized('video')
		return captured
	},

	capture (capture = true) {
		assertInitialized('video')
		validateBoolean('capture', capture)

		Bindings.mouse_capture(capture)
		captured = capture
	},

	uncapture () { mouse.capture(false) },
}

module.exports = { mouse }
