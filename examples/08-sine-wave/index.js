import sdl from '../../src/javascript/index.js'

const TWO_PI = 2 * Math.PI

const playbackInstance = sdl.audio.openDevice({ type: 'playback' })
const {
	channels,
	frequency,
	bytesPerSample,
	minSampleValue,
	maxSampleValue,
	zeroSampleValue,
} = playbackInstance
const range = maxSampleValue - minSampleValue
const amplitude = range / 2

const sineAmplitude = 0.3 * amplitude
const sineNote = 440
const sinePeriod = 1 / sineNote

const duration = 3
const numFrames = duration * frequency
const numSamples = numFrames * channels
const numBytes = numSamples * bytesPerSample
const buffer = Buffer.alloc(numBytes)

let offset = 0
for (let i = 0; i < numFrames; i++) {
	const time = i / frequency
	const angle = time / sinePeriod * TWO_PI
	const sample = zeroSampleValue + Math.sin(angle) * sineAmplitude
	for (let j = 0; j < channels; j++) {
		offset = playbackInstance.writeSample(buffer, sample, offset)
	}
}

playbackInstance.enqueue(buffer)
playbackInstance.play()
