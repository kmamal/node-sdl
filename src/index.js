const Bindings = require('bindings')('test.node')
const EventEmitter = require('events')

// Windows

const windows = new Map()

class Window extends EventEmitter {
	constructor (options = {}) {
		super()

		let { title, x, y, width, height, fullscreen, resizable, borderless } = options

		const typeof_title = typeof title
		if (typeof_title === 'undefined') {
			title = ""
		} else if (typeof_title !== 'string') {
			throw new Error("title must be a string")
		}

		const typeof_x = typeof x
		if (typeof_x === 'undefined') {
			x = -1
		} else if (typeof_x !== 'number') {
			throw new Error("x must be a number")
		}

		const typeof_y = typeof y
		if (typeof_y === 'undefined') {
			y = -1
		} else if (typeof_y !== 'number') {
			throw new Error("y must be a number")
		}

		const typeof_width = typeof width
		if (typeof_width === 'undefined') {
			width = -1
		} else if (typeof_width !== 'number') {
			throw new Error("width must be a number")
		}

		const typeof_height = typeof height
		if (typeof_height === 'undefined') {
			height = -1
		} else if (typeof_height !== 'number') {
			throw new Error("height must be a number")
		}

		const typeof_fullscreen = typeof fullscreen
		if (typeof_fullscreen === 'undefined') {
			fullscreen = false
		} else if (typeof_fullscreen !== 'boolean') {
			throw new Error("fullscreen must be a boolean")
		}

		const typeof_resizable = typeof resizable
		const typeof_borderless = typeof borderless

		if (typeof_resizable === 'undefined') {
			resizable = true
		} else if (typeof_resizable !== 'boolean') {
			throw new Error("resizable must be a boolean")
		}

		if (typeof_borderless === 'undefined') {
			borderless = false
		} else if (typeof_borderless !== 'boolean') {
			throw new Error("borderless must be a boolean")
		}

		if (true
			&& typeof_resizable !== 'undefined'
			&& typeof_borderless !== 'undefined'
			&& resizable && borderless
		) {
			throw new Error("resizable and borderless are mutually exclusive")
		}

		if (borderless) { resizable = false }

		const result = Bindings.window_create(
			title,
			x,
			y,
			width,
			height,
			fullscreen,
			resizable,
			borderless,
		)

		this._id = result.id
		this._x = result.x
		this._y = result.y
		this._width = result.width
		this._height = result.height

		this._title = title
		this._fullscreen = fullscreen
		this._resizable = resizable
		this._borderless = borderless
		this._destroyed = false

		windows.set(this._id, this)
	}

	get title () { return this._title }
	set title (title) {
		if (typeof title !== 'string') {
			throw new Error("title must be a string")
		}

		this._title = title
		Bindings.window_setTitle(this._id, title)
	}

	get width () { return this._width }
	set width (width) {
		if (typeof width !== 'number') {
			throw new Error("width must be a number")
		}

		this._width = width
		Bindings.window_setSize(this._id, width, this._height)
	}

	get height () { return this._height }
	set height (height) {
		if (typeof height !== 'number') {
			throw new Error("height must be a number")
		}

		this._height = height
		Bindings.window_setSize(this._id, this._width, height)
	}

	get fullscreen () { return this._fullscreen }
	set fullscreen (fullscreen) {
		if (typeof fullscreen !== 'boolean') {
			throw new Error("fullscreen must be a boolean")
		}

		this._fullscreen = fullscreen
		Bindings.window_setFullscreen(this._id, fullscreen)
	}

	get resizable () { return this._resizable }
	set resizable (resizable) {
		if (typeof resizable !== 'boolean') {
			throw new Error("resizable must be a boolean")
		}

		this._resizable = resizable
		Bindings.window_setResizable(this._id, resizable)
	}

	focus () {
		Bindings.window_focus(this._id)
	}

	show () {
		Bindings.window_show(this._id)
	}

	hide () {
		Bindings.window_hide(this._id)
	}

	maximize () {
		Bindings.window_maximize(this._id)
	}

	minimize () {
		Bindings.window_minimize(this._id)
	}

	restore () {
		Bindings.window_restore(this._id)
	}

	setIcon (width, height, stride, format, buffer) {
		if (this._destroyed) {
			const error = new Error("window is destroyed")
			error.window = this._id
			throw error
		}

		if (typeof width !== 'number') {
			throw new Error("width must be a number")
		}

		if (typeof height !== 'number') {
			throw new Error("height must be a number")
		}

		if (typeof stride !== 'number') {
			throw new Error("stride must be a number")
		}

		if (typeof format !== 'number') {
			throw new Error("format must be a number")
		}

		if (!(buffer instanceof Buffer)) {
			throw new Error("buffer must be a Buffer")
		}

		if (buffer.length < stride * height) {
			throw new Error("buffer is smaller than expected")
		}

		Bindings.window_setIcon(this._id, width, height, stride, format, buffer)
	}

	render (width, height, stride, format, buffer) {
		if (this._destroyed) {
			const error = new Error("window is destroyed")
			error.window = this._id
			throw error
		}

		if (typeof width !== 'number') {
			throw new Error("width must be a number")
		}

		if (typeof height !== 'number') {
			throw new Error("height must be a number")
		}

		if (typeof stride !== 'number') {
			throw new Error("stride must be a number")
		}

		if (typeof format !== 'number') {
			throw new Error("format must be a number")
		}

		if (!(buffer instanceof Buffer)) {
			throw new Error("buffer must be a Buffer")
		}

		if (buffer.length < stride * height) {
			throw new Error("buffer is smaller than expected")
		}

		Bindings.window_render(this._id, width, height, stride, format, buffer)
	}

	destroy () {
		if (this._destroyed) {
			const error = new Error("window is destroyed")
			error.window = this._id
			throw error
		}

		Bindings.window_destroy(this._id)

		this._destroyed = true
		windows.delete(this._id)
	}
}

// Audio

const Audio = {
	start (options = {}) {
		let { freq, format, channels, samples } = options

		const typeof_freq = typeof freq
		if (typeof_freq === 'undefined') {
			freq = 48000
		} else if (typeof_freq !== 'number') {
			throw new Error("freq must be a number")
		}

		const typeof_format = typeof format
		if (typeof_format === 'undefined') {
			format = AudioFormat.S16
		} else if (typeof_format !== 'number') {
			throw new Error("format must be a number")
		}

		const typeof_channels = typeof channels
		if (typeof_channels === 'undefined') {
			channels = 1
		} else if (typeof_channels !== 'number') {
			throw new Error("channels must be a number")
		}

		const typeof_samples = typeof samples
		if (typeof_samples === 'undefined') {
			samples = 4096
		} else if (typeof_samples !== 'number') {
			throw new Error("samples must be a number")
		}

		Bindings.audio_start(freq, format, channels, samples)

		return { freq, format, channels, samples }
	},
	getQueuedSize () {
		return Bindings.audio_getQueuedSize()
	},
	queue (buffer, num_bytes) {
		if (!(buffer instanceof Buffer)) {
			throw new Error("buffer must be a Buffer")
		}

		if (typeof num_bytes !== 'number') {
			throw new Error("num_bytes must be a number")
		}

		Bindings.audio_queue(buffer, num_bytes)
	},
	stop () {
		Bindings.audio_stop()
	},
}

// Logging

let logger = null
let rest = ''

const setLogger = (_logger) => {
	if (!_logger) {
		logger = null
		rest = ''
		return
	}

	if (typeof _logger !== 'function') {
		throw new Error("logger must be a function")
	}

	logger = _logger
}

const handleLogging = (text) => {
	if (!logger) { return }

	const buffer = rest + text
	const lines = buffer.split('\n')
	rest = lines.pop()
	for (const line of lines) { logger(line) }
}

// Events

const pollEvent = () => {
	const event = Bindings.pollEvent()
	if (!event) { return null }

	processEvent(event)

	return event
}

const waitEvent = (_timeout) => {
	let timeout = _timeout
	const typeof_timeout = typeof timeout
	if (typeof_timeout === 'undefined') {
		timeout = 1e3
	} else if (typeof_timeout !== 'number') {
		throw new Error("timeout must be a number")
	}
	timeout = Math.max(0, timeout)

	const event = Bindings.waitEvent(timeout)
	if (!event) { return null }

	processEvent(event)

	return event
}

const processEvent = (event) => {
	if (event.window) {
		const window = windows.get(event.window)
		if (!window) { throw new Error("event for destroyed window") }

		if (event.type === 'window-resized') {
			window._width = event.width
			window._height = event.height
		}

		event.window = window
	}
}

// Global setup

const {
	'pixel-formats': PixelFormat,
	'audio-formats': AudioFormat,
} = Bindings.initialize(handleLogging)

process.on('exit', () => {
	for (const window of windows.values()) {
		window.destroy()
	}
	Audio.stop()
	Bindings.cleanup()
})

module.exports = {
	PixelFormat,
	AudioFormat,
	setLogger,
	Window,
	pollEvent,
	waitEvent,
	Audio,
}
