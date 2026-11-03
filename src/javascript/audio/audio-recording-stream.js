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
		this._assertOpen()

		return Bindings.audio_getAvailable(this._id)
	}

	getData (buffer, _bytes = null) {
		this._assertOpen()

		validateBuffer('buffer', buffer)
		const bytes = _bytes ?? buffer.length
		validateBytes(buffer, bytes)

		if (bytes === 0) { return 0 }

		return Bindings.audio_getData(this._id, buffer, bytes)
	}
}

module.exports = { AudioRecordingStream }
