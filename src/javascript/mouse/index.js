const Bindings = require('../bindings')
const { enums } = require('../enums')

const mouse = {
	get BUTTON () { return enums.mouse_button },
	get BUTTON_NAME () { return enums.mouse_button_names },
	get CURSOR () { return enums.cursor },
	get CURSOR_NAME () { return enums.cursor_names },

	get position () {
		const position = Bindings.mouse_getPosition()
		return {
			get x () { return position.x },
			get y () { return position.y },
		}
	},

	setPosition (x, y) {
		if (!Number.isFinite(x)) { throw new Error("x must be a number") }
		if (!Number.isFinite(y)) { throw new Error("y must be a number") }

		Bindings.mouse_setPosition(x, y)
	},

	setCursor (cursor) {
		if (!Number.isFinite(cursor)) { throw new Error("cursor must be a number") }
	},

	setCursorImage (width, height, stride, format, buffer, x, y) {
		if (!Number.isFinite(width)) { throw new Error("width must be a number") }
		if (!Number.isFinite(height)) { throw new Error("height must be a number") }
		if (!Number.isFinite(stride)) { throw new Error("stride must be a number") }
		if (!Number.isFinite(format)) { throw new Error("format must be a number") }
		if (!(buffer instanceof Buffer)) { throw new Error("buffer must be a Buffer") }
		if (buffer.length < stride * height) { throw new Error("buffer is smaller than expected") }
		if (!Number.isFinite(x)) { throw new Error("x must be a number") }
		if (!Number.isFinite(y)) { throw new Error("y must be a number") }

		Bindings.mouse_setCursorImage(width, height, stride, format, buffer, x, y)
	},

	showCursor (show = true) {
		if (typeof show !== 'boolean') { throw new Error("show must be a boolean") }
		Bindings.mouse_showCursor(show)
	},

	hideCursor () { mouse.showCursor(false) },

	capture (capture = true) {
		if (typeof capture !== 'boolean') { throw new Error("capture must be a boolean") }
		Bindings.mouse_capture(capture)
	},

	uncapture () { mouse.capture(false) },
}

module.exports = { mouse }
