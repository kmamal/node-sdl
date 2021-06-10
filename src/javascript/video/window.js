const Bindings = require('../bindings')
const Globals = require('../globals')
const { EventsViaPoll } = require('../events/events-via-poll')
const { maybeTriggerQuit } = require('../events/quit')

class Window extends EventsViaPoll {
	constructor (options = {}) {
		super()

		const {
			title = "",
			display = null,
			x = null, y = null,
			width = -1, height = -1,
			visible = true,
			fullscreen = false,
			resizable = false,
			borderless = false,
			opengl = false,
		} = options

		if (typeof title !== 'string') { throw new Error("title must be a string") }
		if (display !== null && typeof display !== 'object') { throw new Error("display must be an object") }
		if (x !== null && !Number.isFinite(x)) { throw new Error("x must be a number") }
		if (y !== null && !Number.isFinite(y)) { throw new Error("y must be a number") }
		if (!Number.isFinite(width)) { throw new Error("width must be a number") }
		if (!Number.isFinite(height)) { throw new Error("height must be a number") }
		if (typeof visible !== 'boolean') { throw new Error("visible must be a boolean") }
		if (typeof fullscreen !== 'boolean') { throw new Error("fullscreen must be a boolean") }
		if (typeof resizable !== 'boolean') { throw new Error("resizable must be a boolean") }
		if (typeof borderless !== 'boolean') { throw new Error("borderless must be a boolean") }
		if (typeof opengl !== 'boolean') { throw new Error("opengl must be a boolean") }
		if (display && (Number.isFinite(x) || Number.isFinite(y))) {
			throw new Error("display and x/y are mutually exclusive")
		}
		if (resizable && borderless) {
			throw new Error("resizable and borderless are mutually exclusive")
		}

		let display_index = 0
		if (display) {
			const { name } = display
			const displays = Bindings.video_getDisplays()
			const index = displays.findIndex((a) => a.name === name)
			display_index = Math.max(0, index)
		}

		const result = Bindings.window_create(
			title,
			display_index,
			width,
			height,
			x,
			y,
			visible,
			fullscreen,
			resizable,
			borderless,
			opengl,
		)

		this._id = result.id
		this._x = result.x
		this._y = result.y
		this._width = result.width
		this._height = result.height
		this._native = result.native

		this._title = title
		this._visible = visible
		this._fullscreen = fullscreen
		this._resizable = resizable
		this._borderless = borderless
		this._opengl = opengl

		this._focused = false
		this._hovered = false
		this._minimized = false
		this._maximized = false
		this._destroyed = false

		Globals.windows.all.set(this._id, this)

		this.once('close', () => {})

		process.nextTick(() => {
			const event = {
				type: 'resize',
				timestamp: Date.now(),
				window: this,
				width: this._width,
				height: this._height,
			}
			this.emit(event.type, event)
		})
	}

	get id () { return this._id }

	get title () { return this._title }
	setTitle (title) {
		if (typeof title !== 'string') { throw new Error("title must be a string") }
		this._title = title
		Bindings.window_setTitle(this._id, title)
	}

	get x () { return this._x }
	get y () { return this._y }
	setPosition (x, y) {
		if (!Number.isFinite(x)) { throw new Error("x must be a number") }
		if (!Number.isFinite(y)) { throw new Error("y must be a number") }
		this._x = x
		this._y = y
		Bindings.window_setPosition(this._id, x, y)
	}

	get width () { return this._width }
	get height () { return this._height }
	setSize (width, height) {
		if (!Number.isFinite(width)) { throw new Error("width must be a number") }
		if (!Number.isFinite(height)) { throw new Error("height must be a number") }
		Bindings.window_setSize(this._id, width, height)
	}

	get visible () { return this._visible }
	show (show = true) {
		this._visible = show
		show
			? Bindings.window_show(this._id)
			: Bindings.window_hide(this._id)
	}

	hide () { this.show(false) }

	get fullscreen () { return this._fullscreen }
	setFullscreen (fullscreen) {
		if (typeof fullscreen !== 'boolean') { throw new Error("fullscreen must be a boolean") }
		this._fullscreen = fullscreen
		Bindings.window_setFullscreen(this._id, fullscreen)
	}

	get resizable () { return this._resizable }
	setResizable (resizable) {
		if (typeof resizable !== 'boolean') { throw new Error("resizable must be a boolean") }
		this._resizable = resizable
		Bindings.window_setResizable(this._id, resizable)
	}

	get borderless () { return this._borderless }
	setBorderless (borderless) {
		if (typeof borderless !== 'boolean') { throw new Error("borderless must be a boolean") }
		this._borderless = borderless
		Bindings.window_setBorderless(this._id, borderless)
	}

	get native () { return this._native }

	get minimized () { return this._minimized }
	minimize () {
		this._minimized = true
		Bindings.window_minimize(this._id)
	}

	get maximized () { return this._maximized }
	maximize () {
		this._maximized = true
		this._visible = true
		Bindings.window_maximize(this._id)
	}

	restore () {
		this._maximized = false
		this._minimized = false
		Bindings.window_restore(this._id)
	}

	get focused () { return this._focused }
	focus () {
		Bindings.window_focus(this._id)
	}

	get hovered () { return this._hovered }

	render (width, height, stride, format, buffer) {
		if (!Number.isFinite(width)) { throw new Error("width must be a number") }
		if (!Number.isFinite(height)) { throw new Error("height must be a number") }
		if (!Number.isFinite(stride)) { throw new Error("stride must be a number") }
		if (!Number.isFinite(format)) { throw new Error("format must be a number") }
		if (!(buffer instanceof Buffer)) { throw new Error("buffer must be a Buffer") }
		if (buffer.length < stride * height) { throw new Error("buffer is smaller than expected") }

		Bindings.window_render(this._id, width, height, stride, format, buffer)
	}

	setIcon (width, height, stride, format, buffer) {
		if (!Number.isFinite(width)) { throw new Error("width must be a number") }
		if (!Number.isFinite(height)) { throw new Error("height must be a number") }
		if (!Number.isFinite(stride)) { throw new Error("stride must be a number") }
		if (!Number.isFinite(format)) { throw new Error("format must be a number") }
		if (!(buffer instanceof Buffer)) { throw new Error("buffer must be a Buffer") }
		if (buffer.length < stride * height) { throw new Error("buffer is smaller than expected") }

		Bindings.window_setIcon(this._id, width, height, stride, format, buffer)
	}

	get destroyed () { return this._destroyed }
	destroy () {
		if (Globals.windows.hovered === this) { Globals.windows.hovered = null }
		if (Globals.windows.focused === this) { Globals.windows.focused = null }
		this._destroyed = true
		Bindings.window_destroy(this._id)
		Globals.windows.all.delete(this._id)

		maybeTriggerQuit()
	}
}

module.exports = { Window }
