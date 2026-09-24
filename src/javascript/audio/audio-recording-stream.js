const Globals = require('../globals')
const Bindings = require('../bindings')
const { AudioStream } = require('./audio-stream')

class AudioRecordingStream extends AudioStream {
	constructor (device, options) {
		super(true, device, options)
	}

	get available () {
		Globals.events.poll()
		if (this._closed) { throw Object.assign(new Error("stream is closed"), { id: this._id }) }

		return Bindings.audio_getAvailable(this._id)
	}

	getData (buffer, bytes = null) {
		if (this._closed) { throw Object.assign(new Error("stream is closed"), { id: this._id }) }

		if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
		bytes ??= buffer.length
		if (!Number.isInteger(bytes)) { throw Object.assign(new Error("bytes must be an integer"), { bytes }) }
		if (bytes < 0 || bytes > 2 ** 31 - 1) { throw Object.assign(new Error("invalid bytes"), { bytes }) }
		if (buffer.length < bytes) { throw Object.assign(new Error("buffer is smaller than expected"), { buffer, bytes }) }

		if (bytes === 0) { return 0 }

		return Bindings.audio_getData(this._id, buffer, bytes)
	}
}

module.exports = { AudioRecordingStream }
