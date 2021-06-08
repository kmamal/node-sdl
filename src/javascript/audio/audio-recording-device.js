const Bindings = require('../bindings')
const { AudioDevice } = require('./audio-device')

class AudioRecordingDevice extends AudioDevice {
	dequeue (buffer, num_bytes = buffer.length) {
		if (!(buffer instanceof Buffer)) { throw new Error("buffer must be a Buffer") }
		if (!Number.isFinite(num_bytes)) { throw new Error("num_bytes must be a number") }

		return Bindings.audio_dequeue(this._id, buffer, num_bytes)
	}
}

module.exports = { AudioRecordingDevice }
