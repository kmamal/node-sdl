const Globals = require('../globals')
const Bindings = require('../bindings')
const { AudioStream } = require('./audio-stream')
const { validateBytes } = require('./validate')
const { validateBuffer } = require('../validate')
const { resetTimeout } = require('./prevent-exit')

class AudioPlaybackStream extends AudioStream {
	constructor (device, options) {
		super(false, device, options)
	}

	get queued () {
		Globals.events.poll()
		this._assertOpen()

		return Bindings.audio_getQueued(this._id)
	}

	putData (buffer, _bytes) {
		this._assertOpen()

		validateBuffer('buffer', buffer)
		const bytes = _bytes === undefined ? buffer.length : _bytes
		validateBytes(buffer, bytes)
		if (bytes % this._frameSize !== 0) { throw Object.assign(new Error(`bytes must be a multiple of ${this._frameSize}`), { bytes }) }

		if (bytes === 0) { return }

		Bindings.audio_putData(this._id, buffer, bytes)
	}

	clear () {
		super.clear()
		resetTimeout()
	}

	play (play = true) {
		super.play(play)
		if (!play) { resetTimeout() }
	}

	close () {
		try { super.close() }
		finally { resetTimeout() }
	}
}

module.exports = { AudioPlaybackStream }
