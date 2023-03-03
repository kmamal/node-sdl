import * as Globals from '../globals.js'

import { AudioPlaybackInstance } from './audio-playback-instance.js'

let timeout

export const resetTimeout = () => {
	if (timeout) {
		clearTimeout(timeout)
		timeout = null
	}
}

process.on('beforeExit', (code) => {
	if (code !== 0) { return }

	let duration = 0

	for (const instance of Globals.audioInstances.values()) {
		if (!(instance instanceof AudioPlaybackInstance)) { continue }
		const { queued, playing, buffered } = instance
		if (!queued || !playing) { continue }

		const { channels, frequency, bytesPerSample } = instance
		const bytesPerSecond = channels * frequency * bytesPerSample
		duration = Math.max(duration, (queued + buffered) / bytesPerSecond)
	}

	if (duration) {
		resetTimeout()
		timeout = setTimeout(() => { timeout = null }, duration * 1e3)
	}
})

