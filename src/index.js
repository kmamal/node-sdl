const Bindings = require('bindings')('test.node')
const EventEmitter = require('events')

// Windows

const windows = new Map()

class Window extends EventEmitter {
	constructor (options = {}) {
		super()

		let { title, x, y, w, h, resizable } = options

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

		const typeof_w = typeof w
		if (typeof_w === 'undefined') {
			w = -1
		} else if (typeof_w !== 'number') {
			throw new Error("w must be a number")
		}

		const typeof_h = typeof h
		if (typeof_h === 'undefined') {
			h = -1
		} else if (typeof_h !== 'number') {
			throw new Error("h must be a number")
		}

		const typeof_resizable = typeof resizable
		if (typeof_resizable === 'undefined') {
			resizable = true
		} else if (typeof_resizable !== 'boolean') {
			throw new Error("resizable must be a boolean")
		}

		const result = Bindings.createWindow(title, x, y, w, h, resizable)

		this._handle = result.handle
		this._w = result.width
		this._h = result.height

		this._destroyed = false
		windows.set(this._handle, this)
	}

	get w () { return this._w }
	get h () { return this._h }

	render (w, h, stride, format, buffer) {
		if (this._destroyed) {
			const error = new Error("window is destroyed")
			error.window = this._handle
			throw error
		}

		if (typeof w !== 'number') {
			throw new Error("w must be a number")
		}

		if (typeof h !== 'number') {
			throw new Error("h must be a number")
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

		if (buffer.length < stride * h) {
			throw new Error("buffer is smaller than expected")
		}

		Bindings.renderWindow(this._handle, w, h, stride, format, buffer)
	}

	destroy () {
		if (this._destroyed) {
			const error = new Error("window is destroyed")
			error.window = this._handle
			throw error
		}

		Bindings.destroyWindow(this._handle)

		this._destroyed = true
		windows.delete(this._handle)
	}
}

// Audio

const startAudio = (callback, { channels = 1, buffer_size = 4096 } = {}) => {
	Bindings.startAudio(callback, channels, buffer_size)
}

const stopAudio = () => {
	Bindings.stopAudio()
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
			window._w = event.width
			window._h = event.height
		}

		event.window = window
	}
}

// Global setup

const { 'pixel-formats': PixelFormat } = Bindings.initialize(handleLogging)

process.on('exit', () => {
	for (const window of windows.values()) {
		window.destroy()
	}
	stopAudio()
	Bindings.cleanup()
})

module.exports = {
	PixelFormat,
	Window,
	pollEvent,
	waitEvent,
	startAudio,
	stopAudio,
	setLogger,
}
