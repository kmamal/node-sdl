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
		if (this._closed) { throw Object.assign(new Error("stream is closed"), { id: this._id }) }

		return Bindings.audio_getQueued(this._id)
	}

	putData (buffer, bytes = null) {
		if (this._closed) { throw Object.assign(new Error("stream is closed"), { id: this._id }) }

		validateBuffer('buffer', buffer)
		bytes ??= buffer.length
		validateBytes(buffer, bytes)
		const frameSize = this._channels * this._bytesPerSample
		if (bytes % frameSize !== 0) { throw Object.assign(new Error(`bytes must be a multiple of ${frameSize}`), { bytes }) }

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
