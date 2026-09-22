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
	for (const instance of Globals.audioInstances.values()) {
		if (instance.device.type !== 'playback') { continue }
		if (!instance.playing) { continue }

		const queued = Bindings.audio_getQueueSize(instance.id)
		if (!queued) { continue }

		const { channels, frequency, buffered, bytesPerSample } = instance
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
