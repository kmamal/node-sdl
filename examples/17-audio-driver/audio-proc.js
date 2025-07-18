import sdl from '@kmamal/sdl'
import { loadAudio } from './ffmpeg.js'
import path from 'node:path'

const channels = 1
const frequency = 48e3

const audioBuffer = await loadAudio(
	path.join(import.meta.dirname, 'assets/audio.wav'),
	{ channels, frequency },
)

let audioInstance
let startTime
let interval

const play = (time = 0) => {
	if (audioInstance) { return }
	audioInstance = sdl.audio.openDevice({ type: 'playback' }, {
		channels,
		frequency,
		format: 'f32lsb',
	})

	const skippedFrames = Math.round(frequency * time / 1e3)
	const skippedSamples = skippedFrames * channels
	const skippedBytes = skippedSamples * audioInstance.bytesPerSample
	audioInstance.enqueue(audioBuffer.slice(skippedBytes))
	audioInstance.play()

	startTime = Date.now() - time
	interval = setInterval(() => {
		if (audioInstance.queued === 0) {
			process.send({ type: 'end' })
			stop()
			return
		}

		process.send({ type: 'time', time: Date.now() - startTime })
	}, 100)
}

const stop = () => {
	if (!audioInstance) { return }
	audioInstance.pause()
	audioInstance.close()
	audioInstance = null
	clearInterval(interval)
	process.send({ type: 'time', time: 0 })
}

process
	.on('message', (message) => {
		switch (message.type) {
			case 'play': { play(message.time) } break
			case 'stop': { stop() } break
			// No default
		}
	})
	.send('started')
