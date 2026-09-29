import sdl from '@kmamal/sdl'
import { Worker } from 'node:worker_threads'
import Path from 'node:path'

const playbackStream = sdl.audio.playback.openDevice()
const {
	channels,
	frequency,
	format,
} = playbackStream
const { buffered, frequency: deviceFrequency } = playbackStream.device
const leadTime = (buffered / deviceFrequency) * 1e3

const workerPath = Path.join(import.meta.dirname, 'audio-worker.js')

const worker = new Worker(workerPath, {
	workerData: {
		channels,
		frequency,
		leadTime,
		format,
	},
})

worker
	.on('error', (error) => {
		console.error("Worker Error:", error)
		process.exit(1)
	})
	.on('message', (arrayBuffer) => {
		playbackStream.putData(Buffer.from(arrayBuffer))
	})
	.once('message', () => { playbackStream.play() })
