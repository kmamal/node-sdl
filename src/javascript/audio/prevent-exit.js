const Globals = require('../globals')
const Bindings = require('../bindings')

let timeout

const resetTimeout = () => {
	if (timeout) {
		clearTimeout(timeout)
		timeout = null
	}
}

process.on('beforeExit', (code) => {
	if (code !== 0) { return }

	let duration = 0

	Globals.events.poll()
	for (const stream of Globals.audioStreams.values()) {
		if (stream._recording) { continue }
		if (!stream.playing) { continue }

		let queued = null
		try { queued = Bindings.audio_getQueued(stream.id) }
		catch (_) { }
		if (!queued) { continue }

		const { channels, frequency, buffered, bytesPerSample } = stream
		const bytesPerSecond = channels * frequency * bytesPerSample
		const bufferedBytes = buffered * channels * bytesPerSample
		duration = Math.max(duration, (queued + bufferedBytes) / bytesPerSecond)
	}

	if (duration) {
		// Keeps Node.js alive while audio is playing
		resetTimeout()
		timeout = setTimeout(() => { timeout = null }, duration * 1e3)
	}
})

module.exports = { resetTimeout }
