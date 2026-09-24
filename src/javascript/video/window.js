const Globals = require('../globals')
const Bindings = require('../bindings')
const Enums = require('../enums')
const { VideoFormatHelpers } = require('./format-helpers')
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
	'displayChange',
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
	'fingerDown',
	'fingerUp',
	'fingerMove',
	'dropBegin',
	'dropText',
	'dropFile',
	'dropComplete',
]

class Window extends EventsViaPoll {
	constructor (options = {}) {
		super(validEvents)

		if (typeof options !== 'object' || options === null) { throw Object.assign(new Error("options must be an object"), { options }) }

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
		} = options

		if (typeof title !== 'string') { throw Object.assign(new Error("title must be a string"), { title }) }
		if (display !== null && typeof display !== 'object') { throw Object.assign(new Error("display must be an object"), { display }) }
		if (x !== null && !Number.isInteger(x)) { throw Object.assign(new Error("x must be an integer"), { x }) }
		if (x !== null && (x < -(2 ** 31) || x > 2 ** 31 - 1)) { throw Object.assign(new Error("invalid x"), { x }) }
		if (y !== null && !Number.isInteger(y)) { throw Object.assign(new Error("y must be an integer"), { y }) }
		if (y !== null && (y < -(2 ** 31) || y > 2 ** 31 - 1)) { throw Object.assign(new Error("invalid y"), { y }) }
		if (width !== null) {
			if (!Number.isInteger(width)) { throw Object.assign(new Error("width must be an integer"), { width }) }
			if (width <= 0 || width > 2 ** 31 - 1) { throw Object.assign(new Error("invalid width"), { width }) }
		}
		if (height !== null) {
			if (!Number.isInteger(height)) { throw Object.assign(new Error("height must be an integer"), { height }) }
			if (height <= 0 || height > 2 ** 31 - 1) { throw Object.assign(new Error("invalid height"), { height }) }
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
		if (display !== null && (x !== null || y !== null)) { throw Object.assign(new Error("display and x/y are mutually exclusive"), { display, x, y }) }
		if (resizable && borderless) { throw Object.assign(new Error("resizable and borderless are mutually exclusive"), { resizable, borderless }) }
		if (opengl && webgpu) { throw Object.assign(new Error("opengl and webgpu are mutually exclusive"), { opengl, webgpu }) }

		let displayId = 0
		if (display) {
			Globals.events.poll()
			if (!Globals.displays.includes(display)) { throw Object.assign(new Error("invalid display"), { display }) }
			displayId = display.id
		}

		const result = Bindings.window_create(
			title,
			displayId,
			x,
			y,
			width,
			height,
			visible,
			fullscreen,
			resizable,
			borderless,
			alwaysOnTop,
			accelerated,
			vsync,
			opengl,
			webgpu,
		)

		this._id = result.id
		this._x = result.x
		this._y = result.y
		this._width = result.width
		this._height = result.height
		this._pixelWidth = result.pixelWidth
		this._pixelHeight = result.pixelHeight
		this._displayId = result.displayId
		this._fullscreen = result.fullscreen
		this._resizable = result.resizable
		this._borderless = result.borderless
		this._alwaysOnTop = result.alwaysOnTop
		this._accelerated = result.accelerated
		this._vsync = result.vsync
		this._native = result.native

		this._title = title
		this._visible = visible
		this._opengl = opengl
		this._webgpu = webgpu

		this._minimized = false
		this._maximized = false
		this._relativeMouseMode = false
		this._destroyed = false

		Globals.windows.all.set(this._id, this)

		// Keeps Node.js alive while windows are open
		const keepAlive = () => {}
		this.on('close', keepAlive)
		this.on('removeListener', (type, listener) => {
			if (listener === keepAlive && !this._destroyed) { this.on('close', keepAlive) }
		})

		// Manually emit some initial events for convenience
		process.nextTick(() => {
			if (this._destroyed) { return }
			try {
				this.emit('move', {
					x: this._x,
					y: this._y,
					type: 'move',
				})
			}
			catch (error) { this.emit('error', error) }
			try {
				this.emit('resize', {
					width: this._width,
					height: this._height,
					pixelWidth: this._pixelWidth,
					pixelHeight: this._pixelHeight,
					type: 'resize',
				})
			}
			catch (error) { this.emit('error', error) }
			try {
				this.emit('expose', {
					type: 'expose',
				})
			}
			catch (error) { this.emit('error', error) }
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

	get x () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._x
	}

	get y () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._y
	}

	setPosition (x, y) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (!Number.isInteger(x)) { throw Object.assign(new Error("x must be an integer"), { x }) }
		if (x < -(2 ** 31) || x > 2 ** 31 - 1) { throw Object.assign(new Error("invalid x"), { x }) }
		if (!Number.isInteger(y)) { throw Object.assign(new Error("y must be an integer"), { y }) }
		if (y < -(2 ** 31) || y > 2 ** 31 - 1) { throw Object.assign(new Error("invalid y"), { y }) }

		Bindings.window_setPosition(this._id, x, y)
		this._x = x
		this._y = y
	}

	get width () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._width
	}

	get height () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._height
	}

	setSize (width, height) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (!Number.isInteger(width)) { throw Object.assign(new Error("width must be an integer"), { width }) }
		if (width <= 0 || width > 2 ** 31 - 1) { throw Object.assign(new Error("invalid width"), { width }) }
		if (!Number.isInteger(height)) { throw Object.assign(new Error("height must be an integer"), { height }) }
		if (height <= 0 || height > 2 ** 31 - 1) { throw Object.assign(new Error("invalid height"), { height }) }

		const { pixelWidth, pixelHeight } = Bindings.window_setSize(this._id, width, height)
		this._width = width
		this._height = height
		this._pixelWidth = pixelWidth
		this._pixelHeight = pixelHeight
	}

	setSizeInPixels (pixelWidth, pixelHeight) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (!Number.isInteger(pixelWidth)) { throw Object.assign(new Error("pixelWidth must be an integer"), { pixelWidth }) }
		if (pixelWidth <= 0 || pixelWidth > 2 ** 31 - 1) { throw Object.assign(new Error("invalid pixelWidth"), { pixelWidth }) }
		if (!Number.isInteger(pixelHeight)) { throw Object.assign(new Error("pixelHeight must be an integer"), { pixelHeight }) }
		if (pixelHeight <= 0 || pixelHeight > 2 ** 31 - 1) { throw Object.assign(new Error("invalid pixelHeight"), { pixelHeight }) }

		// Multiply before dividing to keep the math exact
		const width = pixelWidth * this._width / this._pixelWidth
		const height = pixelHeight * this._height / this._pixelHeight

		if (!Number.isInteger(width)) { throw Object.assign(new Error(`pixelWidth must be a multiple of ${this._pixelWidth / this._width}`), { pixelWidth }) }
		if (!Number.isInteger(height)) { throw Object.assign(new Error(`pixelHeight must be a multiple of ${this._pixelHeight / this._height}`), { pixelHeight }) }

		const result = Bindings.window_setSize(this._id, width, height)
		this._width = width
		this._height = height
		this._pixelWidth = result.pixelWidth
		this._pixelHeight = result.pixelHeight
	}

	get pixelWidth () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._pixelWidth
	}

	get pixelHeight () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._pixelHeight
	}

	get display () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return Globals.displays.find((a) => a.id === this._displayId) ?? null
	}

	get visible () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._visible
	}

	show (show = true) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof show !== 'boolean') { throw Object.assign(new Error("show must be a boolean"), { show }) }

		show ? Bindings.window_show(this._id) : Bindings.window_hide(this._id)
		this._visible = show
	}

	hide () { this.show(false) }

	get fullscreen () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._fullscreen
	}

	setFullscreen (fullscreen) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof fullscreen !== 'boolean') { throw Object.assign(new Error("fullscreen must be a boolean"), { fullscreen }) }

		Bindings.window_setFullscreen(this._id, fullscreen)
	}

	get resizable () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._resizable
	}

	setResizable (resizable) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof resizable !== 'boolean') { throw Object.assign(new Error("resizable must be a boolean"), { resizable }) }
		if (resizable && this._borderless) { throw Object.assign(new Error("resizable and borderless are mutually exclusive"), { resizable, borderless: this._borderless }) }

		this._resizable = Bindings.window_setResizable(this._id, resizable)
	}

	get borderless () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._borderless
	}

	setBorderless (borderless) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof borderless !== 'boolean') { throw Object.assign(new Error("borderless must be a boolean"), { borderless }) }
		if (borderless && this._resizable) { throw Object.assign(new Error("resizable and borderless are mutually exclusive"), { resizable: this._resizable, borderless }) }

		this._borderless = Bindings.window_setBorderless(this._id, borderless)
	}

	get alwaysOnTop () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._alwaysOnTop
	}

	get accelerated () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._accelerated
	}

	setAccelerated (accelerated) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (this._opengl) { throw new Error("can't call setAccelerated in opengl mode") }
		if (this._webgpu) { throw new Error("can't call setAccelerated in webgpu mode") }

		if (typeof accelerated !== 'boolean') { throw Object.assign(new Error("accelerated must be a boolean"), { accelerated }) }

		const result = Bindings.window_setAcceleratedAndVsync(this._id, accelerated, this._vsync)
		this._accelerated = result.accelerated
		this._vsync = result.vsync
	}

	get vsync () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._vsync
	}

	setVsync (vsync) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (this._opengl) { throw new Error("can't call setVsync in opengl mode") }
		if (this._webgpu) { throw new Error("can't call setVsync in webgpu mode") }

		if (typeof vsync !== 'boolean') { throw Object.assign(new Error("vsync must be a boolean"), { vsync }) }

		const result = Bindings.window_setAcceleratedAndVsync(this._id, this._accelerated, vsync)
		this._accelerated = result.accelerated
		this._vsync = result.vsync
	}

	get opengl () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._opengl
	}

	get webgpu () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._webgpu
	}

	get native () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._native
	}

	get minimized () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._minimized
	}

	minimize () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		Bindings.window_minimize(this._id)
	}

	get maximized () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._maximized
	}

	maximize () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (!this._resizable) { throw new Error("can't maximize a non-resizable window") }

		Bindings.window_maximize(this._id)
	}

	restore () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		Bindings.window_restore(this._id)
	}

	get focused () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return Globals.windows.focused === this
	}

	focus () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		Bindings.window_focus(this._id)
		Globals.windows.focused = this
	}

	get hovered () {
		Globals.events.poll()
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return Globals.windows.hovered === this
	}

	get relativeMouseMode () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		return this._relativeMouseMode
	}

	setRelativeMouseMode (relative = true) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (typeof relative !== 'boolean') { throw Object.assign(new Error("relative must be a boolean"), { relative }) }

		this._relativeMouseMode = Bindings.window_setRelativeMouseMode(this._id, relative)
	}

	unsetRelativeMouseMode () { this.setRelativeMouseMode(false) }

	render (width, height, stride, format, buffer, options = {}) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		if (this._opengl) { throw new Error("can't call render in opengl mode") }
		if (this._webgpu) { throw new Error("can't call render in webgpu mode") }

		const {
			scaling = 'nearest',
			dstRect = null,
		} = options

		if (!Number.isInteger(width)) { throw Object.assign(new Error("width must be an integer"), { width }) }
		if (width <= 0 || width > 2 ** 31 - 1) { throw Object.assign(new Error("invalid width"), { width }) }
		if (!Number.isInteger(height)) { throw Object.assign(new Error("height must be an integer"), { height }) }
		if (height <= 0 || height > 2 ** 31 - 1) { throw Object.assign(new Error("invalid height"), { height }) }
		if (!Number.isInteger(stride)) { throw Object.assign(new Error("stride must be an integer"), { stride }) }
		if (typeof format !== 'string') { throw Object.assign(new Error("format must be a string"), { format }) }
		const helpers = VideoFormatHelpers[format]
		if (helpers === undefined) { throw Object.assign(new Error("invalid format"), { format }) }
		if (!helpers.isRenderable) { throw Object.assign(new Error("format can't be rendered"), { format }) }
		if (stride < width * helpers.bytesPerPixel || stride > 2 ** 31 - 1) { throw Object.assign(new Error("invalid stride"), { stride, width, bytesPerPixel: helpers.bytesPerPixel }) }
		if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
		if (buffer.length < helpers.minBufferSize(stride, height)) { throw Object.assign(new Error("buffer is smaller than expected"), { buffer, stride, height, format }) }
		if (typeof scaling !== 'string') { throw Object.assign(new Error("scaling must be a string"), { scaling }) }

		if (dstRect !== null) {
			if (typeof dstRect !== 'object') { throw Object.assign(new Error("dstRect must be an object"), { dstRect }) }
			if (!Number.isFinite(dstRect.x)) { throw Object.assign(new Error("dstRect.x must be a number"), { dstRect }) }
			if (!Number.isFinite(dstRect.y)) { throw Object.assign(new Error("dstRect.y must be a number"), { dstRect }) }
			if (!Number.isFinite(dstRect.width)) { throw Object.assign(new Error("dstRect.width must be a number"), { dstRect }) }
			if (dstRect.width <= 0) { throw Object.assign(new Error("invalid dstRect.width"), { dstRect }) }
			if (!Number.isFinite(dstRect.height)) { throw Object.assign(new Error("dstRect.height must be a number"), { dstRect }) }
			if (dstRect.height <= 0) { throw Object.assign(new Error("invalid dstRect.height"), { dstRect }) }
		}

		const _format = Enums.pixelFormat[format]

		const _scaling = Enums.scaleMode[scaling]
		if (_scaling === undefined) { throw Object.assign(new Error("invalid scaling"), { scaling }) }

		Bindings.window_render(this._id, width, height, stride, _format, buffer, _scaling, dstRect)
	}

	setIcon (width, height, stride, format, buffer) {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

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

		const _format = Enums.pixelFormat[format]

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

		if (Globals.windows.hovered === this) { Globals.windows.hovered = null }
		if (Globals.windows.focused === this) { Globals.windows.focused = null }

		// Defer the native destruction until the pump has unwound.
		if (Bindings.events_isDispatchingFromWatch()) {
			process.nextTick(() => { Bindings.window_destroy(this._id) })
		}
		else {
			Bindings.window_destroy(this._id)
		}
		this._destroyed = true

		Globals.windows.all.delete(this._id)

		// We might be inside an event listener
		process.nextTick(() => { this.removeAllListeners() })

		try { this.emit('close', { type: 'close' }) }
		catch (error) { this.emit('error', error) }
	}

	destroyGently () {
		if (this._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: this._id }) }

		let shouldPrevent = false
		try {
			this.emit('beforeClose', {
				type: 'beforeClose',
				prevent: () => { shouldPrevent = true },
			})
		}
		catch (error) { this.emit('error', error) }
		if (shouldPrevent) { return }

		// A listener may have already destroyed the window
		if (this._destroyed) { return }

		this.destroy()
	}
}

module.exports = { Window }
