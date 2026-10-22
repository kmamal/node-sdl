import sdl from '@kmamal/sdl/worker'

const TWO_PI = 2 * Math.PI

const playbackStream = sdl.audio.playback.openDevice()
const {
	channels,
	frequency,
	bytesPerSample,
	minSampleValue,
	maxSampleValue,
	zeroSampleValue,
} = playbackStream
const { buffered, frequency: deviceFrequency } = playbackStream.device

const range = maxSampleValue - minSampleValue
const amplitude = range / 2

const sineAmplitude = 0.3 * amplitude
const sineNote = 440
const sinePeriod = 1 / sineNote
let index = 0

const leadFrames = Math.ceil(2 * buffered / deviceFrequency * frequency)
const frameSize = channels * bytesPerSample
const leadBytes = leadFrames * frameSize

const render = () => {
	const numBytes = leadBytes - playbackStream.queued
	if (numBytes <= 0) { return }
	const numFrames = Math.floor(numBytes / frameSize)
	const buffer = Buffer.alloc(numFrames * frameSize)

	let offset = 0
	for (let i = 0; i < numFrames; i++) {
		const time = index++ / frequency
		const angle = time / sinePeriod * TWO_PI
		const sample = zeroSampleValue + Math.sin(angle) * sineAmplitude
		for (let j = 0; j < channels; j++) {
			offset = playbackStream.writeSample(buffer, sample, offset)
		}
	}

	playbackStream.putData(buffer)
}

render()
playbackStream.play()
setInterval(render, 1)
