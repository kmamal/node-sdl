const Bindings = require('../bindings')
const Globals = require('../globals')
const Enums = require('../enums')
const { EventsViaPoll } = require('../events/events-via-poll')

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
			alwaysOnTop = false,
			accelerated = true,
			vsync = true,
			opengl = false,
			webgpu = false,
			skipTaskbar = false,
			popupMenu = false,
			tooltip = false,
			utility = false,
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
		if (typeof alwaysOnTop !== 'boolean') { throw Object.assign(new Error("alwaysOnTop must be a boolean"), { alwaysOnTop }) }
		if (typeof accelerated !== 'boolean') { throw Object.assign(new Error("accelerated must be a boolean"), { accelerated }) }
		if (typeof vsync !== 'boolean') { throw Object.assign(new Error("vsync must be a boolean"), { vsync }) }
		if (typeof opengl !== 'boolean') { throw Object.assign(new Error("opengl must be a boolean"), { opengl }) }
		if (typeof webgpu !== 'boolean') { throw Object.assign(new Error("webgpu must be a boolean"), { webgpu }) }
		if (typeof skipTaskbar !== 'boolean') { throw Object.assign(new Error("skipTaskbar must be a boolean"), { skipTaskbar }) }
		if (typeof popupMenu !== 'boolean') { throw Object.assign(new Error("popupMenu must be a boolean"), { popupMenu }) }
		if (typeof tooltip !== 'boolean') { throw Object.assign(new Error("tooltip must be a boolean"), { tooltip }) }
		if (typeof utility !== 'boolean') { throw Object.assign(new Error("utility must be a boolean"), { utility }) }
		if (display && (Number.isFinite(x) || Number.isFinite(y))) { throw Object.assign(new Error("display and x/y are mutually exclusive"), { display, x, y }) }
		if (resizable && borderless) { throw Object.assign(new Error("resizable and borderless are mutually exclusive"), { resizable, borderless }) }
		if (opengl && webgpu) { throw Object.assign(new Error("opengl and webgpu are mutually exclusive"), { opengl, webgpu }) }

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
			alwaysOnTop,
			accelerated,
			vsync,
			opengl,
			webgpu,
			skipTaskbar,
			popupMenu,
			tooltip,
			utility,
		)

		this._id = result.id
		this._x = result.x
		this._y = result.y
		this._width = result.width
		this._height = result.height
		this._pixelWidth = result.pixelWidth
		this._pixelHeight = result.pixelHeight
		this._fullscreen = result.fullscreen
		this._resizable = result.resizable
		this._borderless = result.borderless
		this._alwaysOnTop = result.alwaysOnTop
		this._accelerated = result.accelerated
		this._vsync = result.vsync
		this._native = result.native ?? null
		this._skipTaskbar = result.skipTaskbar
		this._popupMenu = result.popupMenu
		this._tooltip = result.tooltip
		this._utility = result.utility

		this._title = title
		this._visible = visible
		this._opengl = opengl
		this._webgpu = webgpu

		this._focused = false
		this._hovered = false
		this._minimized = false
		this._maximized = false
		this._destroyed = false

		Globals.windows.all.set(this._id, this)

		// This also keeps Node.js alive while windows are open
		this.on('close', () => {
			if (Globals.windows.hovered === this) { Globals.windows.hovered = null }
			if (Globals.windows.focused === this) { Globals.windows.focused = null }

			Bindings.window_destroy(this._id)
			this._destroyed = true

			Globals.windows.all.delete(this._id)

			process.nextTick(() => { this.removeAllListeners() })
		})

		// Manually emit an initial resize event for convenience
		process.nextTick(() => {
			this.emit('resize', {
				width: this._width,
				height: this._height,
				pixelWidth: this._pixelWidth,
				pixelHeight: this._pixelHeight,
				type: 'resize',
			})
		})
	}

	get id () { return this._id }

	get title () { return this._title }
	setTitle (title) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof title !== 'string') { throw Object.assign(new Error("title must be a string"), { title }) }

		Bindings.window_setTitle(this._id, title)
		this._title = title
	}

	get x () { return this._x }
	get y () { return this._y }
	setPosition (x, y) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (!Number.isFinite(x)) { throw Object.assign(new Error("x must be a number"), { x }) }
		if (!Number.isFinite(y)) { throw Object.assign(new Error("y must be a number"), { y }) }

		Bindings.window_setPosition(this._id, x, y)
		this._x = x
		this._y = y
	}

	get width () { return this._width }
	get height () { return this._height }
	setSize (width, height) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (!Number.isFinite(width)) { throw Object.assign(new Error("width must be a number"), { width }) }
		if (width <= 0) { throw Object.assign(new Error("invalid width"), { width }) }
		if (!Number.isFinite(height)) { throw Object.assign(new Error("height must be a number"), { height }) }
		if (height <= 0) { throw Object.assign(new Error("invalid height"), { height }) }

		const { pixelWidth, pixelHeight } = Bindings.window_setSize(this._id, width, height)
		this._width = width
		this._height = height
		this._pixelWidth = pixelWidth
		this._pixelHeight = pixelHeight
	}

	get pixelWidth () { return this._pixelWidth }
	get pixelHeight () { return this._pixelHeight }

	get visible () { return this._visible }
	show (show = true) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof show !== 'boolean') { throw Object.assign(new Error("show must be a boolean"), { show }) }

		show ? Bindings.window_show(this._id) : Bindings.window_hide(this._id)
		this._visible = show
	}

	hide () { this.show(false) }

	get fullscreen () { return this._fullscreen }
	setFullscreen (fullscreen) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof fullscreen !== 'boolean') { throw Object.assign(new Error("fullscreen must be a boolean"), { fullscreen }) }

		this._fullscreen = Bindings.window_setFullscreen(this._id, fullscreen)
	}

	get resizable () { return this._resizable }
	setResizable (resizable) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof resizable !== 'boolean') { throw Object.assign(new Error("resizable must be a boolean"), { resizable }) }

		this._resizable = Bindings.window_setResizable(this._id, resizable)
	}

	get borderless () { return this._borderless }
	setBorderless (borderless) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof borderless !== 'boolean') { throw Object.assign(new Error("borderless must be a boolean"), { borderless }) }

		this._borderless = Bindings.window_setBorderless(this._id, borderless)
	}

	get alwaysOnTop () { return this._alwaysOnTop }

	get accelerated () { return this._accelerated }
	setAccelerated (accelerated) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (this._opengl) { throw new Error("can't call setAccelerated in opengl mode") }
		if (this._webgpu) { throw new Error("can't call setAccelerated in webgpu mode") }

		if (typeof accelerated !== 'boolean') { throw Object.assign(new Error("accelerated must be a boolean"), { accelerated }) }

		[ this._accelerated, this._vsync ] = Bindings.window_setAcceleratedAndVsync(this._id, accelerated, this._vsync)
	}

	get vsync () { return this._vsync }
	setVsync (vsync) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (this._opengl) { throw new Error("can't call setVsync in opengl mode") }
		if (this._webgpu) { throw new Error("can't call setVsync in webgpu mode") }

		if (typeof vsync !== 'boolean') { throw Object.assign(new Error("vsync must be a boolean"), { vsync }) }

		[ this._accelerated, this._vsync ] = Bindings.window_setAcceleratedAndVsync(this._id, this._accelerated, vsync)
	}

	get opengl () { return this._opengl }
	get webgpu () { return this._webgpu }
	get native () { return this._native }

	get minimized () { return this._minimized }
	minimize () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		Bindings.window_minimize(this._id)
		this._visible = false
		this._minimized = true
		this._maximized = false
		this._fullscreen = false
	}

	get maximized () { return this._maximized }
	maximize () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		Bindings.window_maximize(this._id)
		this._visible = true
		this._minimized = false
		this._maximized = true
		this._fullscreen = false
	}

	restore () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		Bindings.window_restore(this._id)
		this._visible = true
		this._minimized = false
		this._maximized = false
		this._fullscreen = false
	}

	get focused () { return this._focused }
	focus () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		Bindings.window_focus(this._id)
		this._focused = true
		Globals.windows.focused = this
	}

	get hovered () { return this._hovered }

	get skipTaskbar () { return this._skipTaskbar }
	get popupMenu () { return this._popupMenu }
	get tooltip () { return this._tooltip }
	get utility () { return this._utility }

	render (width, height, stride, format, buffer) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (this._opengl) { throw new Error("can't call render in opengl mode") }
		if (this._webgpu) { throw new Error("can't call render in webgpu mode") }

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

		Bindings.window_render(this._id, width, height, stride, _format, buffer)
	}

	setIcon (width, height, stride, format, buffer) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

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

		Bindings.window_setIcon(this._id, width, height, stride, _format, buffer)
	}

	flash (untilFocused = false) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof untilFocused !== 'boolean') { throw Object.assign(new Error("untilFocused must be a boolean"), { untilFocused }) }

		Bindings.window_flash(this._id, untilFocused ? 2 : 1)
	}

	stopFlashing () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		Bindings.window_flash(this._id, 0)
	}

	get destroyed () { return this._destroyed }
	destroy () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		this.emit('close', { type: 'close' })
	}
}

module.exports = { Window }
