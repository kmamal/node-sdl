const Bindings = require('bindings')('test.node')

const windows = new Map()
const closeAllWindows = () => {
	for (const window of windows.values()) {
		if (window.destroyed) { continue }
		window.destroy()
	}
}

const audio_devices = new Map()
const closeAllAudioDevices = () => {
	for (const device of audio_devices.values()) {
		if (device.closed) { continue }
		device.close()
	}
}

const joysticks = new Map()
const closeAllJoysticks = () => {
	for (const joystick of joysticks.values()) {
		if (joystick.closed) { continue }
		joystick.close()
	}
}

const controllers = new Map()
const closeAllControllers = () => {
	for (const controller of controllers.values()) {
		if (controller.closed) { continue }
		controller.close()
	}
}

let focused_window = null
let hovered_window = null


// Init

process.on('exit', () => {
	closeAllWindows()
	closeAllAudioDevices()
	closeAllJoysticks()
	closeAllControllers()

	Bindings.cleanup()
})

const sdl = {}

sdl.info = Bindings.initialize()

const enums = Bindings.getEnums()

for (const [ key, obj ] of Object.entries(enums)) {
	const names = {}
	for (const [ name, value ] of Object.entries(obj)) {
		names[value] = name
	}
	enums[`${key}_names`] = names
}


// Video

class Window {
	constructor (options = {}) {
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
			const displays = sdl.video.displays
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

		windows.set(this._id, this)
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
		Bindings.window_setSize(this._id, x, y)
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
		if (hovered_window === this) { hovered_window = null }
		if (focused_window === this) { focused_window = null }
		this._destroyed = true
		Bindings.window_destroy(this._id)
		windows.delete(this._id)
	}
}

sdl.video = {
	get FORMAT () { return enums.pixel_format },
	get FORMAT_NAME () { return enums.pixel_format_names },

	get displays () { return Bindings.video_getDisplays() },

	get windows () { return [ ...windows.values() ] },
	get focused () { return focused_window },
	get hovered () { return hovered_window },

	createWindow: (options) => new Window(options),
}


// Audio

class AudioDevice {
	constructor (device, options) {
		const { name, recording } = device

		const {
			buffered = 4096,
			channels = 1,
			format = sdl.AudioFormat.S16,
			frequency = 48000,
		} = options

		if (!Number.isFinite(buffered)) { throw new Error("buffered must be a number") }
		if (!Number.isFinite(channels)) { throw new Error("channels must be a number") }
		if (!Number.isFinite(format)) { throw new Error("format must be a number") }
		if (!Number.isFinite(frequency)) { throw new Error("frequency must be a number") }

		this._id = Bindings.audio_openDevice(name, recording, frequency, format, channels, buffered)

		this._name = name
		this._buffered = buffered
		this._channels = channels
		this._format = format
		this._frequency = frequency

		this._playing = true
		this._closed = false

		audio_devices.set(this._id, this)
	}

	get id () { return this._id }
	get name () { return this._name }

	get channels () { return this._channels }
	get frequency () { return this._frequency }
	get format () { return this._format }
	get buffered () { return this._buffered }

	get playing () { return this._playing }
	play (play) {
		if (typeof play !== 'boolean') { throw new Error("play must be a boolean") }
		this._playing = play
		Bindings.audio_pause(this._id, play ? 0 : 1)
	}

	pause () {
		this.play(false)
	}


	get queued () { return Bindings.audio_getQueuedSize() }
	clearQueued () { Bindings.audio_clearQueued(this._id) }

	get closed () { return this._closed }
	close () {
		this._closed = true
		Bindings.audio_close(this._id)
		audio_devices.delete(this._id)
	}
}

class AudioPlaybackDevice extends AudioDevice {
	queue (buffer, num_bytes = buffer.length) {
		if (!(buffer instanceof Buffer)) { throw new Error("buffer must be a Buffer") }
		if (!Number.isFinite(num_bytes)) { throw new Error("num_bytes must be a number") }

		Bindings.audio_queue(buffer, num_bytes)
	}
}

class AudioRecordingDevice extends AudioDevice {
	dequeue (buffer, num_bytes = buffer.length) {
		if (!(buffer instanceof Buffer)) { throw new Error("buffer must be a Buffer") }
		if (!Number.isFinite(num_bytes)) { throw new Error("num_bytes must be a number") }

		Bindings.audio_dequeue(buffer, num_bytes)
	}
}

let playback_devices = Bindings.audio_getDevices(false)
let recording_devices = Bindings.audio_getDevices(true)

sdl.audio = {
	get FORMAT () { return enums.audio_format },
	get FORMAT_NAME () { return enums.audio_format_names },

	get devices () { return [ ...playback_devices, ...recording_devices ] },

	openDevice (device, options) {
		return device.recording
			? new AudioPlaybackDevice(device, options)
			: new AudioRecordingDevice(device, options)
	},
}


// Events

const _processEvent = (event) => {
	if (event.window) {
		const window = windows.get(event.window)
		if (!window) { return false }

		switch (event.type) {
			case 'window-moved': {
				window._x = event.x
				window._y = event.y
				break
			}
			case 'window-resized': {
				window._width = event.width
				window._height = event.height
				break
			}
			case 'window-shown': {
				window._visible = true
				break
			}
			case 'window-hidden': {
				window._visible = false
				break
			}
			case 'window-minimized': {
				window._minimized = true
				window._maximized = false
				break
			}
			case 'window-maximized': {
				window._minimized = false
				window._maximized = true
				break
			}
			case 'window-restored': {
				window._minimized = false
				window._maximized = false
				break
			}
			case 'window-focus-gained': {
				window._focused = true
				focused_window = window
				break
			}
			case 'window-focus-lost': {
				window._focused = false
				focused_window = null
				break
			}
			case 'window-enter': {
				window._hovered = true
				hovered_window = window
				break
			}
			case 'window-leave': {
				window._hovered = false
				hovered_window = null
				break
			}
			// No default
		}

		// event.window = window
	} else if (event.joystick) {
		const joystick = joysticks.get(event.joystick)
		if (!joystick) { return false }

		switch (event.type) {
			case 'joystick-axis-motion': {
				joystick.axes[event.axis] = event.value
				break
			}
			case 'joystick-ball-motion': {
				const ball = joystick.balls[event.ball]
				ball.x = event.x
				ball.x = event.y
				break
			}
			case 'joystick-hat-motion': {
				joystick.hats[event.hat] = event.value
				break
			}
			case 'joystick-button-up': {
				joystick.buttons[event.button] = 0
				break
			}
			case 'joystick-button-down': {
				joystick.buttons[event.button] = 0
				break
			}
			case 'joystick-device-removed': {
				joystick.close()
				break
			}
			// No default
		}

		event.joystick = joystick
	} else if (event.type.startsWith('drop-')) {
		const window = windows.get(event.window)
		if (!window) { return false }
		event.window = window
	} else if (event.startsWith('audio-device-')) {
		const { index, recording } = event
		const outdated = recording ? recording_devices : playback_devices
		const updated = Bindings.audio_getDevices(recording)
		if (recording) {
			recording_devices = updated
		} else {
			playback_devices = updated
		}
		event.device = (event.endsWith('added') ? updated : outdated)[index]
		delete event.index
		delete event.recording
	}

	return true
}

sdl.events = {
	poll: () => {
		const event = Bindings.events_poll()
		if (!event?.type) { return null }

		const valid = _processEvent(event)
		if (!valid) { return null }

		return event
	},
	wait: (_timeout = 1e3) => {
		const timeout = Math.max(0, _timeout)
		if (!Number.isFinite(timeout)) { throw new Error("timeout must be a number") }

		const event = Bindings.events_wait(timeout)
		if (!event?.type) { return null }

		const valid = _processEvent(event)
		if (!valid) { return null }

		return event
	},
}


// Keyboard

sdl.keyboard = {
	get SCANCODE () { return enums.keycode },
	get SCANCODE_NAME () { return enums.keycode_names },
	get KEYCODE () { return enums.scancode },
	get KEYCODE_NAME () { return enums.scancode_names },

	getKeycode (scancode) { return Bindings.keyboard_getKeycode(scancode) },
	getScancode (keycode) { return Bindings.keyboard_getScancode(keycode) },

	getState () { return Bindings.keyboard_getState() },
}


// Mouse

sdl.mouse = {
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

	setCursor: (cursor) => {
		if (!Number.isFinite(cursor)) { throw new Error("cursor must be a number") }

		Bindings.mouse_setCursor(cursor)
	},

	setCursorImage: (width, height, stride, format, buffer, x, y) => {
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

	showCursor: (show = true) => {
		if (typeof show !== 'boolean') { throw new Error("show must be a boolean") }
		Bindings.mouse_showCursor(show)
	},
	hideCursor: () => { sdl.mouse.showCursor(false) },

	capture: (capture = true) => {
		if (typeof fullscreen !== 'boolean') { throw new Error("capture must be a boolean") }
		Bindings.mouse_capture(capture)
	},
	uncapture: () => { sdl.mouse.capture(false) },
}


// Joystick

class Joystick {
	constructor (device) {
		const { name, index } = device

		const { id, guid, axes, balls, buttons, hats } = Bindings.joystick_open(index)

		this._id = id
		this._name = name
		this._guid = guid
		this._axes = axes
		this._balls = balls
		this._buttons = buttons
		this._hats = hats

		this._closed = false

		joysticks.set(this._id, this)
	}

	get id () { return this._id }
	get name () { return this._name }
	get guid () { return this._guid }

	get axes () { return this._axes }
	get balls () { return this._balls }
	get buttons () { return this._buttons }
	get hats () { return this._hats }

	get power () { return Bindings.joystick_getPower() }

	get closed () { return this._closed }
	close () {
		this._closed = true
		Bindings.joystick_close(this._id)
		joysticks.delete(this._id)
	}
}

sdl.joystick = {
	get devices () { return Bindings.joystick_getDevices() },

	open (device) { return new Joystick(device) },
}


// Controller

class Controller {
	constructor (device) {
		const { name, index } = device

		const { id, guid, sticks, triggers, shoulders, dpad, buttons } = Bindings.controller_open(index)

		this._id = id
		this._name = name
		this._guid = guid

		this._sticks = sticks
		this._triggers = triggers
		this._shoulders = shoulders
		this._dpad = dpad
		this._buttons = buttons

		this._closed = false

		controllers.set(this._id, this)
	}

	get id () { return this._id }
	get name () { return this._name }
	get guid () { return this._guid }

	get sticks () { return this._sticks }
	get triggers () { return this._triggers }
	get shoulders () { return this._shoulders }
	get dpad () { return this._dpad }
	get buttons () { return this._buttons }

	get closed () { return this._closed }
	close () {
		this._closed = true
		Bindings.controller_close(this._id)
		controllers.delete(this._id)
	}
}

sdl.controller = {
	get devices () { return sdl.joystick.devices.filter(({ controller }) => controller) },

	open: (device) => new Controller(device),
}


// Clipboard

sdl.clipboard = {
	get text () { return Bindings.clipboard_getText() },
	setText (text) {
		if (typeof text !== 'string') { throw new Error("text must be a string") }
		Bindings.clipboard_setText(text)
	},
}

module.exports = sdl
