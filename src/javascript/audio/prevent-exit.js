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
	if (Globals.audioStreams.size === 0) { return }

	let duration = 0

	Globals.events.poll()
	for (const stream of Globals.audioStreams.values()) {
		if (stream._recording) { continue }
		if (!stream.playing) { continue }

		let queued = null
		try {
			Bindings.audio_flush(stream.id)
			queued = Bindings.audio_getQueued(stream.id)
		}
		catch { }
		if (!queued) { continue }

		const { device, channels, frequency, bytesPerSample, frequencyRatio } = stream
		const bytesPerSecond = channels * frequency * bytesPerSample * frequencyRatio
		const tail = device.frequency ? device.buffered / device.frequency : 0
		duration = Math.max(duration, queued / bytesPerSecond + tail)
	}

	if (duration) {
		// Keeps Node.js alive while audio is playing
		resetTimeout()
		timeout = setTimeout(() => { timeout = null }, Math.min(duration * 1e3, 2 ** 31 - 1))
	}
})

module.exports = { resetTimeout }
