import { workerData, parentPort } from 'worker_threads'

const TWO_PI = 2 * Math.PI

const {
	channels,
	frequency,
	buffered,
	bytesPerSample,
	minSampleValue,
	maxSampleValue,
	zeroSampleValue,
	writerName,
} = workerData

const writeSample = Buffer.prototype[writerName]

const range = maxSampleValue - minSampleValue
const amplitude = range / 2

const sineAmplitude = 0.3 * amplitude
const sineNote = 440
const sinePeriod = 1 / sineNote
let index = 0

const startTime = Date.now()
const leadTime = (buffered / frequency) * 1e3
let lastTime = startTime - leadTime

setInterval(() => {
	const now = Date.now()
	const ellapsed = now - lastTime
	if (ellapsed === 0) { return }
	const numFrames = Math.floor(ellapsed / 1e3 * frequency)
	if (numFrames === 0) { return }
	lastTime = now

	const numSamples = numFrames * channels
	const numBytes = numSamples * bytesPerSample
	const buffer = Buffer.alloc(numBytes)

	let offset = 0
	for (let i = 0; i < numFrames; i++) {
		const time = index++ / frequency
		const angle = time / sinePeriod * TWO_PI
		const sample = zeroSampleValue + Math.sin(angle) * sineAmplitude
		for (let j = 0; j < channels; j++) {
			offset = writeSample.call(buffer, sample, offset)
		}
	}

	const arrayBuffer = buffer.buffer
	parentPort.postMessage(arrayBuffer, [ arrayBuffer ])
}, 0)
