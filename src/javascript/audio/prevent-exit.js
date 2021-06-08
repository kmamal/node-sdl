const Globals = require('../globals')

let timeout

const resetTimeout = () => {
	if (timeout) { clearTimeout(timeout) }
}

process.on('beforeExit', (code) => {
	if (code !== 0) { return }

	let duration = 0

	for (const device of Globals.audio_devices.all.values()) {
		const { queue, queued, buffered, playing } = device
		if (!queue || !queued || !playing) { continue }

		const { channels, frequency, bytesPerSample } = device
		const bytes_per_second = channels * frequency * bytesPerSample
		duration = Math.max(duration, (queued + buffered) / bytes_per_second)
	}

	if (duration) {
		resetTimeout()
		timeout = setTimeout(() => { timeout = null }, duration * 1e3)
	}
})

module.exports = { resetTimeout }
