const Bindings = require('../bindings')
const Globals = require('../globals')
const { enums } = require('../enums')
const { EventsViaPoll } = require('../events/events-via-poll')
const { maybeTriggerQuit } = require('../events/quit')

const validEvents = [
	'show',
	'hide',
	'expose',
	'minimize',
	'maximize',
	'restore',
	'move',
	'resize',
	'focus',
	'blur',
	'hover',
	'leave',
	'beforeClose',
	'close',
	'keyDown',
	'keyUp',
	'textInput',
	'mouseButtonDown',
	'mouseButtonUp',
	'mouseMove',
	'mouseWheel',
	'dropBegin',
	'dropText',
	'dropFile',
	'dropComplete',
]

class Window extends EventsViaPoll {
	constructor (options = {}) {
		super(validEvents)

		const {
			title = "",
			display = null,
			x = null, y = null,
			width = null, height = null,
			visible = true,
			fullscreen = false,
			resizable = false,
			borderless = false,
			accelerated = true,
			vsync = true,
			opengl = false,
		} = options

		if (typeof title !== 'string') { throw Object.assign(new Error("title must be a string"), { title }) }
		if (display !== null && typeof display !== 'object') { throw Object.assign(new Error("display must be an object"), { display }) }
		if (x !== null && !Number.isFinite(x)) { throw Object.assign(new Error("x must be a number"), { x }) }
		if (y !== null && !Number.isFinite(y)) { throw Object.assign(new Error("y must be a number"), { y }) }
		if (width !== null) {
			if (!Number.isFinite(width)) { throw Object.assign(new Error("width must be a number"), { width }) }
			if (width <= 0) { throw Object.assign(new Error("invalid width"), { width }) }
		}
		if (height !== null) {
			if (!Number.isFinite(height)) { throw Object.assign(new Error("height must be a number"), { height }) }
			if (height <= 0) { throw Object.assign(new Error("invalid height"), { height }) }
		}
		if (typeof visible !== 'boolean') { throw Object.assign(new Error("visible must be a boolean"), { visible }) }
		if (typeof fullscreen !== 'boolean') { throw Object.assign(new Error("fullscreen must be a boolean"), { fullscreen }) }
		if (typeof resizable !== 'boolean') { throw Object.assign(new Error("resizable must be a boolean"), { resizable }) }
		if (typeof borderless !== 'boolean') { throw Object.assign(new Error("borderless must be a boolean"), { borderless }) }
		if (typeof accelerated !== 'boolean') { throw Object.assign(new Error("accelerated must be a boolean"), { accelerated }) }
		if (typeof vsync !== 'boolean') { throw Object.assign(new Error("vsync must be a boolean"), { vsync }) }
		if (typeof opengl !== 'boolean') { throw Object.assign(new Error("opengl must be a boolean"), { opengl }) }
		if (display && (Number.isFinite(x) || Number.isFinite(y))) { throw Object.assign(new Error("display and x/y are mutually exclusive"), { display, x, y }) }
		if (resizable && borderless) { throw Object.assign(new Error("resizable and borderless are mutually exclusive"), { resizable, borderless }) }

		let displayIndex = 0
		if (display) {
			const { name } = display
			const displays = Bindings.video_getDisplays()
			const index = displays.findIndex((a) => a.name === name)
			displayIndex = Math.max(0, index)
		}

		const result = Bindings.window_create(
			title,
			displayIndex,
			width,
			height,
			x,
			y,
			visible,
			fullscreen,
			resizable,
			borderless,
			accelerated,
			vsync,
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
		this._accelerated = accelerated
		this._vsync = vsync
		this._opengl = opengl

		this._focused = false
		this._hovered = false
		this._minimized = false
		this._maximized = false
		this._destroyed = false

		Globals.windows.all.set(this._id, this)

		// Keep node.js alive while windows are open
		this.once('close', () => {})

		// Manually emit an initial resize event (for convenience)
		process.nextTick(() => {
			this.emit('resize', {
				width: this._width,
				height: this._height,
			})
		})
	}

	get id () { return this._id }

	get title () { return this._title }
	setTitle (title) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof title !== 'string') { throw Object.assign(new Error("title must be a string"), { title }) }
		this._title = title
		Bindings.window_setTitle(this._id, title)
	}

	get x () { return this._x }
	get y () { return this._y }
	setPosition (x, y) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (!Number.isFinite(x)) { throw Object.assign(new Error("x must be a number"), { x }) }
		if (!Number.isFinite(y)) { throw Object.assign(new Error("y must be a number"), { y }) }
		this._x = x
		this._y = y
		Bindings.window_setPosition(this._id, x, y)
	}

	get width () { return this._width }
	get height () { return this._height }
	setSize (width, height) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (!Number.isFinite(width)) { throw Object.assign(new Error("width must be a number"), { width }) }
		if (width <= 0) { throw Object.assign(new Error("invalid width"), { width }) }
		if (!Number.isFinite(height)) { throw Object.assign(new Error("height must be a number"), { height }) }
		if (height <= 0) { throw Object.assign(new Error("invalid height"), { height }) }
		Bindings.window_setSize(this._id, width, height)
	}

	get visible () { return this._visible }
	show (show = true) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		this._visible = show
		show
			? Bindings.window_show(this._id)
			: Bindings.window_hide(this._id)
	}

	hide () { this.show(false) }

	get fullscreen () { return this._fullscreen }
	setFullscreen (fullscreen) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof fullscreen !== 'boolean') { throw Object.assign(new Error("fullscreen must be a boolean"), { fullscreen }) }
		this._fullscreen = fullscreen
		Bindings.window_setFullscreen(this._id, fullscreen)
	}

	get resizable () { return this._resizable }
	setResizable (resizable) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof resizable !== 'boolean') { throw Object.assign(new Error("resizable must be a boolean"), { resizable }) }
		this._resizable = resizable
		Bindings.window_setResizable(this._id, resizable)
	}

	get borderless () { return this._borderless }
	setBorderless (borderless) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof borderless !== 'boolean') { throw Object.assign(new Error("borderless must be a boolean"), { borderless }) }
		this._borderless = borderless
		Bindings.window_setBorderless(this._id, borderless)
	}

	get accelerated () { return this._accelerated }
	setAccelerated (accelerated) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof accelerated !== 'boolean') { throw Object.assign(new Error("accelerated must be a boolean"), { accelerated }) }
		this._accelerated = accelerated
		Bindings.window_setAcceleratedAndVsync(this._id, accelerated, this._vsync)
	}

	get vsync () { return this._vsync }
	setVsync (vsync) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof vsync !== 'boolean') { throw Object.assign(new Error("vsync must be a boolean"), { vsync }) }
		this._vsync = vsync
		Bindings.window_setAcceleratedAndVsync(this._id, this._accelerated, vsync)
	}

	get opengl () { return this._opengl }
	get native () { return this._native }

	get minimized () { return this._minimized }
	minimize () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		this._minimized = true
		Bindings.window_minimize(this._id)
	}

	get maximized () { return this._maximized }
	maximize () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		this._maximized = true
		this._visible = true
		Bindings.window_maximize(this._id)
	}

	restore () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		this._maximized = false
		this._minimized = false
		Bindings.window_restore(this._id)
	}

	get focused () { return this._focused }
	focus () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		Bindings.window_focus(this._id)
	}

	get hovered () { return this._hovered }

	render (width, height, stride, format, buffer) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (this._opengl) { throw new Error("can't call render in opengl mode") }

		const _format = enums.pixelFormat[format] ?? null

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

		Bindings.window_render(this._id, width, height, stride, _format, buffer)
	}

	setIcon (width, height, stride, format, buffer) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		const _format = enums.pixelFormat[format] ?? null

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

		Bindings.window_setIcon(this._id, width, height, stride, _format, buffer)
	}

	setDrawColor(red, green, blue, alpha) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		const a = alpha || 255

		if (!Number.isFinite(red)) { throw Object.assign(new Error("red must be a number"), { red }) }
		if (red < 0 || red > 255) { throw Object.assign(new Error("invalid red"), { red }) }
		if (!Number.isFinite(green)) { throw Object.assign(new Error("green must be a number"), { green }) }
		if (green < 0 || green > 255) { throw Object.assign(new Error("invalid green"), { green }) }
		if (!Number.isFinite(blue)) { throw Object.assign(new Error("blue must be a number"), { blue }) }
		if (blue < 0 || blue > 255) { throw Object.assign(new Error("invalid blue"), { blue }) }
		if (!Number.isFinite(a)) { throw Object.assign(new Error("alpha must be a number"), { a }) }
		if (a < 0 || a > 255) { throw Object.assign(new Error("invalid alpha"), { a }) }

		Bindings.window_setDrawColor(this._id, red, green, blue, a)
	}

	drawRect(x, y, width, height, fill) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		const f = fill || false;

		if (!Number.isFinite(x)) { throw Object.assign(new Error("x must be a number"), { x }) }
		if (x <= 0) { throw Object.assign(new Error("invalid x"), { x }) }
		if (!Number.isFinite(y)) { throw Object.assign(new Error("y must be a number"), { y }) }
		if (y <= 0) { throw Object.assign(new Error("invalid y"), { y }) }
		if (!Number.isFinite(width)) { throw Object.assign(new Error("width must be a number"), { width }) }
		if (width <= 0) { throw Object.assign(new Error("invalid width"), { width }) }
		if (!Number.isFinite(height)) { throw Object.assign(new Error("height must be a number"), { height }) }
		if (height <= 0) { throw Object.assign(new Error("invalid height"), { height }) }
		if (typeof f !== 'boolean') { throw Object.assign(new Error("fill must be a boolean"), { f }) }

		Bindings.window_drawRect(this._id, x, y, width, height, f)
	}

	drawLine(x1, y1, x2, y2) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (!Number.isFinite(x1)) { throw Object.assign(new Error("x1 must be a number"), { x1 }) }
		if (x1 <= 0) { throw Object.assign(new Error("invalid x1"), { x1 }) }
		if (!Number.isFinite(y1)) { throw Object.assign(new Error("y1 must be a number"), { y1 }) }
		if (y1 <= 0) { throw Object.assign(new Error("invalid y1"), { y1 }) }
		if (!Number.isFinite(x2)) { throw Object.assign(new Error("x2 must be a number"), { x2 }) }
		if (x2 <= 0) { throw Object.assign(new Error("invalid x2"), { x2 }) }
		if (!Number.isFinite(y2)) { throw Object.assign(new Error("y2 must be a number"), { y2 }) }
		if (y2 <= 0) { throw Object.assign(new Error("invalid y2"), { y2 }) }

		Bindings.window_drawLine(this._id, x1, y1, x2, y2)
	}

	drawPoint(x, y) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (!Number.isFinite(x)) { throw Object.assign(new Error("x must be a number"), { x }) }
		if (x <= 0) { throw Object.assign(new Error("invalid x"), { x }) }
		if (!Number.isFinite(y)) { throw Object.assign(new Error("y must be a number"), { y }) }
		if (y <= 0) { throw Object.assign(new Error("invalid y"), { y }) }

		Bindings.window_drawPoint(this._id, x, y)
	}

	present() {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		Bindings.window_present(this._id)
	}

	clear() {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		Bindings.window_clear(this._id)
	}

	get destroyed () { return this._destroyed }
	destroy () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (Globals.windows.hovered === this) { Globals.windows.hovered = null }
		if (Globals.windows.focused === this) { Globals.windows.focused = null }
		this._destroyed = true
		Bindings.window_destroy(this._id)
		Globals.windows.all.delete(this._id)

		maybeTriggerQuit()
	}
}

module.exports = { Window }
