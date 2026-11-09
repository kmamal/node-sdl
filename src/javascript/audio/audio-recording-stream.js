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

	getData (buffer, _bytes) {
		this._assertOpen()

		validateBuffer('buffer', buffer)
		const bytes = _bytes === undefined ? buffer.length : _bytes
		validateBytes(buffer, bytes)
		// Unlike putData(), a partial frame isn't rejected: SDL rounds the read down to whole frames and the return value reports what was read.

		if (bytes === 0) { return 0 }

		return Bindings.audio_getData(this._id, buffer, bytes)
	}
}

module.exports = { AudioRecordingStream }
