import '@kmamal/sdl'
import { Worker } from 'node:worker_threads'
import Path from 'node:path'

const workerPath = Path.join(import.meta.dirname, 'audio-worker.js')

new Worker(workerPath)
	.on('error', (error) => {
		console.error("Worker Error:", error)
		process.exit(1)
	})
