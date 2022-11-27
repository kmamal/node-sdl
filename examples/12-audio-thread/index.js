import sdl from '@kmamal/sdl'
import { Worker } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import Path from 'node:path'

const playbackInstance = sdl.audio.openDevice({ type: 'playback' })
const {
	channels,
	frequency,
	buffered,
	bytesPerSample,
	minSampleValue,
	maxSampleValue,
	zeroSampleValue,
	writerName,
} = playbackInstance

const __dirname = Path.dirname(fileURLToPath(import.meta.url))
const workerPath = Path.join(__dirname, 'audio-worker.js')

const worker = new Worker(workerPath, {
	workerData: {
		channels,
		frequency,
		buffered,
		bytesPerSample,
		minSampleValue,
		maxSampleValue,
		zeroSampleValue,
		writerName,
	},
})

worker
	.on('error', (error) => {
		console.error("Worker Error:", error)
		process.exit(1)
	})
	.on('message', (arrayBuffer) => {
		playbackInstance.enqueue(Buffer.from(arrayBuffer))
	})
	.once('message', () => { playbackInstance.play() })
