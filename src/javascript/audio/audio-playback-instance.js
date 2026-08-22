const Bindings = require('../bindings')
const { AudioInstance } = require('./audio-instance')
const { resetTimeout } = require('./prevent-exit')

class AudioPlaybackInstance extends AudioInstance {
	constructor (device, options) {
		super(device, options)

		this._bytesPerSecond = this._channels * this._frequency * this._bytesPerSample
		this._bufferedBytes = this._buffered * this._channels * this._bytesPerSample

		// The queue drains into a device buffer that keeps sounding after
		// `queued` reaches 0; this tracks when the last byte actually finishes
		this._drainedAt = 0

		// Devices start paused
		this._pausedAt = Date.now()
	}

	enqueue (buffer, numBytes = null) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._id }) }

		if (!(buffer instanceof Buffer)) { throw Object.assign(new Error("buffer must be a Buffer"), { buffer }) }
		numBytes ??= buffer.length
		if (!Number.isInteger(numBytes)) { throw Object.assign(new Error("numBytes must be an integer"), { numBytes }) }
		if (numBytes < 0 || numBytes > 2 ** 31 - 1) { throw Object.assign(new Error("invalid numBytes"), { numBytes }) }
		if (buffer.length < numBytes) { throw Object.assign(new Error("buffer is smaller than expected"), { buffer, numBytes }) }

		Bindings.audio_enqueue(this._id, buffer, numBytes)

		const queued = Bindings.audio_getQueueSize(this._id)
		this._drainedAt = Date.now() + ((queued + this._bufferedBytes) / this._bytesPerSecond) * 1e3
	}

	clearQueue () {
		super.clearQueue()
		// Only the device buffer's tail is left sounding now
		const tail = (this._bufferedBytes / this._bytesPerSecond) * 1e3
		this._drainedAt = Math.min(this._drainedAt, Date.now() + tail)
		resetTimeout()
	}

	// Cancelling the drain timeout is safe even with other instances still
	// playing: emptying the event loop reruns the 'beforeExit' handler, which
	// recomputes the remaining drain duration from scratch
	play (play = true) {
		const wasPlaying = this._playing
		super.play(play)
		if (!play) {
			if (wasPlaying) { this._pausedAt = Date.now() }
			resetTimeout()
		}
		else if (!wasPlaying && this._pausedAt !== null) {
			// Nothing drained while paused, so the deadline shifts with it
			this._drainedAt += Date.now() - this._pausedAt
			this._pausedAt = null
		}
	}

	close () {
		super.close()
		resetTimeout()
	}
}

module.exports = { AudioPlaybackInstance }
