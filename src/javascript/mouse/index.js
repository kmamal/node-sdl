const Bindings = require('../bindings')
const Enums = require('../enums')

const mouse = {
	get BUTTON () { return Enums.button },

	getButton (button) {
		if (!Number.isFinite(button)) { throw Object.assign(new Error("button must be a number"), { button }) }
		if (button < 0 || button >= 32) { throw Object.assign(new Error("invalid button"), { button }) }

		return Bindings.mouse_getButton(button)
	},

	get position () {
		const position = Bindings.mouse_getPosition()
		return {
			get x () { return position.x },
			get y () { return position.y },
		}
	},

	setPosition (x, y) {
		if (!Number.isFinite(x)) { throw Object.assign(new Error("x must be a number"), { x }) }
		if (!Number.isFinite(y)) { throw Object.assign(new Error("y must be a number"), { y }) }

		Bindings.mouse_setPosition(x, y)
	},

	setCursor (cursor) {
		const _cursor = Enums.cursor[cursor] ?? null
		if (typeof cursor !== 'string') { throw Object.assign(new Error("cursor must be a string"), { cursor }) }
		if (_cursor === null) { throw Object.assign(new Error("invalid cursor"), { cursor }) }

		Bindings.mouse_setCursor(_cursor)
	},

	setCursorImage (width, height, stride, format, buffer, x, y) {
		const _format = Enums.pixelFormat[format] ?? null

		if (!Number.isFinite(width)) { throw Object.assign(new Error("width must be a number"), { width }) }
		if (width <= 0) { throw Object.assign(new Error("invalid width"), { width }) }
		if (!Number.isFinite(height)) { throw Object.assign(new Error("height must be a number"), { height }) }
		if (height <= 0) { throw Object.assign(new Error("invalid height"), { height }) }
		if (!Number.isFinite(stride)) { throw Object.assign(new Error("stride must be a number"), { stride }) }
		if (stride < width) { throw Object.assign(new Error("invalid stride"), { stride, width }) }
		if (typeof format !== 'string') { throw Object.assign(new Error("format must be a string"), { format }) }
		if (_format === null) { throw Object.assign(new Error("invalid format"), { format }) }
		if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
		if (buffer.length < stride * height) { throw Object.assign(new Error("buffer is smaller than expected"), { buffer, stride, height }) }
		if (!Number.isFinite(x)) { throw Object.assign(new Error("x must be a number"), { x }) }
		if (x < 0 || x >= width) { throw Object.assign(new Error("invalid x"), { x }) }
		if (!Number.isFinite(y)) { throw Object.assign(new Error("y must be a number"), { y }) }
		if (y < 0 || y >= height) { throw Object.assign(new Error("invalid y"), { y }) }

		Bindings.mouse_setCursorImage(width, height, stride, _format, buffer, x, y)
	},

	showCursor (show = true) {
		if (typeof show !== 'boolean') { throw Object.assign(new Error("show must be a boolean"), { show }) }
		Bindings.mouse_showCursor(show)
	},

	hideCursor () { mouse.showCursor(false) },

	capture (capture = true) {
		if (typeof capture !== 'boolean') { throw Object.assign(new Error("capture must be a boolean"), { capture }) }
		Bindings.mouse_capture(capture)
	},

	uncapture () { mouse.capture(false) },
}

module.exports = { mouse }
