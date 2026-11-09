const Globals = require('../globals')
const Bindings = require('../bindings')
const Enums = require('../enums')
const { EventsViaPoll } = require('../events/events-via-poll')
const {
	validateBoolean,
	validateString,
	validateObject,
	validateInt32,
	validateFloat,
	validatePositiveFloat,
	validatePositiveInt32,
	validateNotDestroyed,
} = require('../validate')
const {
	validateVsync,
	validateImage,
	validateRenderableFormat,
	validateRgbFormat,
} = require('./validate')

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
	'fingerCancel',
	'dropBegin',
	'dropText',
	'dropFile',
	'dropComplete',
]

class Window extends EventsViaPoll {
	constructor (options = {}) {
		super(validEvents)

		validateObject('options', options)

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
			accelerated,
			vsync,
			opengl = false,
			webgpu = false,
		} = options

		const hasAccelerated = accelerated !== undefined
		const hasVsync = vsync !== undefined

		validateString('title', title)
		if (display !== null) { validateObject('display', display) }
		if (x !== null) { validateInt32('x', x) }
		if (y !== null) { validateInt32('y', y) }
		if (width !== null) { validatePositiveInt32('width', width) }
		if (height !== null) { validatePositiveInt32('height', height) }
		validateBoolean('visible', visible)
		validateBoolean('fullscreen', fullscreen)
		validateBoolean('resizable', resizable)
		validateBoolean('borderless', borderless)
		validateBoolean('alwaysOnTop', alwaysOnTop)
		if (hasAccelerated) { validateBoolean('accelerated', accelerated) }
		if (hasVsync) { validateVsync(vsync) }
		validateBoolean('opengl', opengl)
		validateBoolean('webgpu', webgpu)
		if (display !== null && (x !== null || y !== null)) { throw Object.assign(new Error("display and x/y are mutually exclusive"), { display, x, y }) }
		if (resizable && borderless) { throw Object.assign(new Error("resizable and borderless are mutually exclusive"), { resizable, borderless }) }
		if (opengl && webgpu) { throw Object.assign(new Error("opengl and webgpu are mutually exclusive"), { opengl, webgpu }) }
		if (opengl && (hasAccelerated || hasVsync)) { throw Object.assign(new Error("opengl and accelerated/vsync are mutually exclusive"), { opengl, accelerated, vsync }) }
		if (webgpu && (hasAccelerated || hasVsync)) { throw Object.assign(new Error("webgpu and accelerated/vsync are mutually exclusive"), { webgpu, accelerated, vsync }) }

		let displayId = 0
		if (display) {
			Globals.events.poll()
			if (!Globals.displays.includes(display)) { throw Object.assign(new Error("display must be from sdl.video.displays"), { display }) }
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
			accelerated ?? true,
			vsync ?? 1,
			opengl,
			webgpu,
		)

		this._id = result.id
		this._title = result.title
		this._visible = result.visible
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

		this._opengl = opengl
		this._webgpu = webgpu

		this._minimized = result.minimized
		this._maximized = result.maximized
		this._relativeMouseMode = false
		this._destroyed = false

		Globals.windows.all.set(this._id, this)

		// Keeps Node.js alive while windows are open
		const keepAlive = () => {}
		this.on('close', keepAlive)
		this._addInternalListener('removeListener', (type, listener) => {
			if (listener === keepAlive && !this._destroyed) { this.on('close', keepAlive) }
		})

		// Manually emit some initial events for convenience.
		// Note that these can duplicate real events.
		// Something may have polled synchronously before this tick runs, e.g. a getter read right after createWindow().
		// In that case the real move/resize/expose events have already fired and the ones below repeat them with the same values.
		process.nextTick(() => {
			if (this._destroyed) { return }
			Globals.events.withoutPolling(() => {
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
				if (this._visible) {
					try {
						this.emit('expose', {
							type: 'expose',
						})
					}
					catch (error) { this.emit('error', error) }
				}
			})
		})
	}

	get id () { return this._id }

	get title () {
		validateNotDestroyed(this)

		return this._title
	}

	setTitle (title) {
		validateNotDestroyed(this)

		validateString('title', title)

		this._title = Bindings.window_setTitle(this._id, title)
	}

	get x () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return this._x
	}

	get y () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return this._y
	}

	setPosition (x, y) {
		validateNotDestroyed(this)

		validateInt32('x', x)
		validateInt32('y', y)

		Bindings.window_setPosition(this._id, x, y)
	}

	get width () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return this._width
	}

	get height () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return this._height
	}

	setSize (width, height) {
		validateNotDestroyed(this)

		validatePositiveInt32('width', width)
		validatePositiveInt32('height', height)

		Bindings.window_setSize(this._id, width, height, false)
	}

	setSizeInPixels (pixelWidth, pixelHeight) {
		validateNotDestroyed(this)

		validatePositiveInt32('pixelWidth', pixelWidth)
		validatePositiveInt32('pixelHeight', pixelHeight)

		Bindings.window_setSize(this._id, pixelWidth, pixelHeight, true)
	}

	get pixelWidth () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return this._pixelWidth
	}

	get pixelHeight () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return this._pixelHeight
	}

	get display () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return Globals.displays.find((a) => a.id === this._displayId) ?? null
	}

	get visible () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return this._visible
	}

	show (show = true) {
		validateNotDestroyed(this)

		validateBoolean('show', show)

		show ? Bindings.window_show(this._id) : Bindings.window_hide(this._id)
	}

	hide () { this.show(false) }

	get fullscreen () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return this._fullscreen
	}

	setFullscreen (fullscreen) {
		validateNotDestroyed(this)

		validateBoolean('fullscreen', fullscreen)

		Bindings.window_setFullscreen(this._id, fullscreen)
	}

	get resizable () {
		validateNotDestroyed(this)

		return this._resizable
	}

	setResizable (resizable) {
		validateNotDestroyed(this)

		validateBoolean('resizable', resizable)
		if (resizable && this._borderless) { throw Object.assign(new Error("resizable and borderless are mutually exclusive"), { resizable, borderless: this._borderless }) }

		this._resizable = Bindings.window_setResizable(this._id, resizable)
	}

	get borderless () {
		validateNotDestroyed(this)

		return this._borderless
	}

	setBorderless (borderless) {
		validateNotDestroyed(this)

		validateBoolean('borderless', borderless)
		if (borderless && this._resizable) { throw Object.assign(new Error("resizable and borderless are mutually exclusive"), { resizable: this._resizable, borderless }) }

		this._borderless = Bindings.window_setBorderless(this._id, borderless)
	}

	get alwaysOnTop () {
		validateNotDestroyed(this)

		return this._alwaysOnTop
	}

	get accelerated () {
		validateNotDestroyed(this)

		return this._accelerated
	}

	setAccelerated (accelerated) {
		validateNotDestroyed(this)

		if (this._opengl) { throw new Error("can't call setAccelerated in opengl mode") }
		if (this._webgpu) { throw new Error("can't call setAccelerated in webgpu mode") }

		validateBoolean('accelerated', accelerated)

		const result = Bindings.window_setAcceleratedAndVsync(this._id, accelerated, this._vsync)
		this._accelerated = result.accelerated
		this._vsync = result.vsync
	}

	get vsync () {
		validateNotDestroyed(this)

		return this._vsync
	}

	setVsync (vsync) {
		validateNotDestroyed(this)

		if (this._opengl) { throw new Error("can't call setVsync in opengl mode") }
		if (this._webgpu) { throw new Error("can't call setVsync in webgpu mode") }

		validateVsync(vsync)

		const result = Bindings.window_setAcceleratedAndVsync(this._id, this._accelerated, vsync)
		this._accelerated = result.accelerated
		this._vsync = result.vsync
	}

	get opengl () {
		validateNotDestroyed(this)

		return this._opengl
	}

	get webgpu () {
		validateNotDestroyed(this)

		return this._webgpu
	}

	get native () {
		validateNotDestroyed(this)

		return this._native
	}

	get minimized () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return this._minimized
	}

	minimize () {
		validateNotDestroyed(this)

		Bindings.window_minimize(this._id)
	}

	get maximized () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return this._maximized
	}

	maximize () {
		validateNotDestroyed(this)

		if (!this._resizable) { throw new Error("can't maximize a non-resizable window") }

		Bindings.window_maximize(this._id)
	}

	restore () {
		validateNotDestroyed(this)

		Bindings.window_restore(this._id)
	}

	get focused () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return Globals.windows.focused === this
	}

	focus () {
		validateNotDestroyed(this)

		Bindings.window_focus(this._id)
	}

	get hovered () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return Globals.windows.hovered === this
	}

	get mouseCaptured () {
		Globals.events.poll()
		validateNotDestroyed(this)

		return Bindings.window_getMouseCaptured(this._id)
	}

	get relativeMouseMode () {
		validateNotDestroyed(this)

		return this._relativeMouseMode
	}

	setRelativeMouseMode (relative = true) {
		validateNotDestroyed(this)

		validateBoolean('relative', relative)

		this._relativeMouseMode = Bindings.window_setRelativeMouseMode(this._id, relative)
	}

	unsetRelativeMouseMode () { this.setRelativeMouseMode(false) }

	render (width, height, stride, format, buffer, options = {}) {
		validateNotDestroyed(this)

		if (this._opengl) { throw new Error("can't call render in opengl mode") }
		if (this._webgpu) { throw new Error("can't call render in webgpu mode") }

		validateObject('options', options)

		const {
			scaling = 'nearest',
			dstRect = null,
		} = options

		validateImage(width, height, stride, format, buffer, validateRenderableFormat)
		validateString('scaling', scaling)

		if (dstRect !== null) {
			validateObject('dstRect', dstRect)
			validateFloat('dstRect.x', dstRect.x)
			validateFloat('dstRect.y', dstRect.y)
			validatePositiveFloat('dstRect.width', dstRect.width)
			validatePositiveFloat('dstRect.height', dstRect.height)
		}

		const _format = Enums.pixelFormat[format]

		const _scaling = Enums.scaleMode[scaling]
		if (_scaling === undefined) { throw Object.assign(new Error("scaling must be 'nearest' or 'linear'"), { scaling }) }

		Bindings.window_render(this._id, width, height, stride, _format, buffer, _scaling, dstRect)
	}

	setIcon (width, height, stride, format, buffer) {
		validateNotDestroyed(this)

		validateImage(width, height, stride, format, buffer, validateRgbFormat)

		const _format = Enums.pixelFormat[format]

		Bindings.window_setIcon(this._id, width, height, stride, _format, buffer)
	}

	flash (untilFocused = false) {
		validateNotDestroyed(this)

		validateBoolean('untilFocused', untilFocused)

		Bindings.window_flash(this._id, untilFocused ? 2 : 1)
	}

	stopFlashing () {
		validateNotDestroyed(this)

		Bindings.window_flash(this._id, 0)
	}

	get destroyed () { return this._destroyed }
	destroy () {
		validateNotDestroyed(this)

		this._destroyed = true
		Globals.windows.all.delete(this._id)
		if (Globals.windows.hovered === this) { Globals.windows.hovered = null }
		if (Globals.windows.focused === this) { Globals.windows.focused = null }

		const destroyNative = () => {
			try { Bindings.window_destroy(this._id) }
			catch {}
		}

		// Defer the native destruction until the pump has unwound.
		if (Bindings.events_isDispatchingFromWatch()) {
			process.nextTick(destroyNative)
		}
		else {
			destroyNative()
		}

		// We might be inside an event listener
		this._retire(() => Object.assign(new Error("window is destroyed"), { id: this._id }))

		Globals.events.withoutPolling(() => {
			try { this.emit('close', { type: 'close' }) }
			catch (error) { this.emit('error', error) }
		})
	}

	destroyGently () {
		validateNotDestroyed(this)

		let shouldPrevent = false
		Globals.events.withoutPolling(() => {
			try {
				this.emit('beforeClose', {
					type: 'beforeClose',
					prevent: () => { shouldPrevent = true },
				})
			}
			catch (error) { this.emit('error', error) }
		})
		if (shouldPrevent) { return }

		// A listener may have already destroyed the window
		if (this._destroyed) { return }

		this.destroy()
	}
}

module.exports = { Window }
