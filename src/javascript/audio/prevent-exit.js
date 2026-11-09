const Globals = require('../globals')
const Bindings = require('../bindings')
const { INT32_MAX } = require('../validate')

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
		// Skipping empty queues misses the device buffer's tail, so if something else kept the loop alive while the queue drained, up to one device buffer gets cut off at exit. Accepted.
		if (!queued) { continue }

		const { device, channels, frequency, bytesPerSample, frequencyRatio } = stream
		const bytesPerSecond = channels * frequency * bytesPerSample * frequencyRatio
		const tail = device.frequency ? device.buffered / device.frequency : 0
		duration = Math.max(duration, queued / bytesPerSecond + tail)
	}

	if (duration) {
		// Keeps Node.js alive while audio is playing
		resetTimeout()
		timeout = setTimeout(() => { timeout = null }, Math.min(duration * 1e3, INT32_MAX))
	}
})

module.exports = { resetTimeout }
