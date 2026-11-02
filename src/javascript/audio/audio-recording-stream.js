const Globals = require('../globals')
const Bindings = require('../bindings')
const { AudioStream } = require('./audio-stream')
const { validateBytes } = require('./validate')
const { validateBuffer } = require('../validate')

class AudioRecordingStream extends AudioStream {
	constructor (device, options) {
		super(true, device, options)
	}

	get available () {
		Globals.events.poll()
		if (this._closed) { throw Object.assign(new Error("stream is closed"), { id: this._id }) }

		return Bindings.audio_getAvailable(this._id)
	}

	getData (buffer, _bytes = null) {
		if (this._closed) { throw Object.assign(new Error("stream is closed"), { id: this._id }) }

		validateBuffer('buffer', buffer)
		const bytes = _bytes ?? buffer.length
		validateBytes(buffer, bytes)

		if (bytes === 0) { return 0 }

		return Bindings.audio_getData(this._id, buffer, bytes)
	}
}

module.exports = { AudioRecordingStream }
