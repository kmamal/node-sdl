const Bindings = require('../bindings')
const { AudioInstance } = require('./audio-instance')

class AudioRecordingInstance extends AudioInstance {
	dequeue (buffer, numBytes = buffer.length) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._id }) }

		if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
		if (!Number.isFinite(numBytes)) { throw Object.assign(new Error("numBytes must be a number"), { numBytes }) }
		if (buffer.length < numBytes) { throw Object.assign(new Error("buffer is smaller than expected"), { buffer, numBytes }) }

		return Bindings.audio_dequeue(this._id, buffer, numBytes)
	}
}

module.exports = { AudioRecordingInstance }
