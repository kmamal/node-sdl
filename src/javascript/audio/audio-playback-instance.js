const Bindings = require('../bindings')
const { AudioInstance } = require('./audio-instance')
const { resetTimeout } = require('./prevent-exit')

class AudioPlaybackInstance extends AudioInstance {
	enqueue (buffer, numBytes = buffer.length) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._id }) }

		if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
		if (!Number.isInteger(numBytes)) { throw Object.assign(new Error("numBytes must be an integer"), { numBytes }) }
		if (numBytes <= 0 || numBytes > 2 ** 31 - 1) { throw Object.assign(new Error("invalid numBytes"), { numBytes }) }
		if (buffer.length < numBytes) { throw Object.assign(new Error("buffer is smaller than expected"), { buffer, numBytes }) }

		Bindings.audio_enqueue(this._id, buffer, numBytes)
	}

	clearQueue () {
		super.clearQueue()
		resetTimeout()
	}

	// Cancelling the drain timeout is safe even with other instances still
	// playing: emptying the event loop reruns the 'beforeExit' handler, which
	// recomputes the remaining drain duration from scratch
	play (play = true) {
		super.play(play)
		if (!play) { resetTimeout() }
	}

	close () {
		super.close()
		resetTimeout()
	}
}

module.exports = { AudioPlaybackInstance }
