const Globals = require('../globals')

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

	for (const instance of Globals.audioInstances.values()) {
		if (instance.device.type === 'recording') { continue }

		const { queued, playing } = instance
		if (!playing) { continue }

		if (queued) {
			const { channels, frequency, buffered, bytesPerSample } = instance
			const bytesPerSecond = channels * frequency * bytesPerSample
			const bufferedBytes = buffered * channels * bytesPerSample
			duration = Math.max(duration, (queued + bufferedBytes) / bytesPerSecond)
		}
		else {
			// The queue empties while the device buffer is still sounding
			const remaining = instance._drainedAt - Date.now()
			if (remaining > 0) { duration = Math.max(duration, remaining / 1e3) }
		}
	}

	if (duration) {
		resetTimeout()
		// Deliberately ref'd: keeps the process alive until playback finishes
		timeout = setTimeout(() => { timeout = null }, duration * 1e3)
	}
})

module.exports = { resetTimeout }
