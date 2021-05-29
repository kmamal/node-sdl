const sdl = require('@kmamal/sdl')

const TWO_PI = 2 * Math.PI

const device = sdl.audio.devices.find(({ recording }) => !recording)
const format = sdl.audio.FORMAT.F32
const audioDevice = sdl.audio.openDevice(device, { format })
const { channels, frequency } = audioDevice
const bytesPerSample = 4

const sineAmplitude = 0.3
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
	const sample = Math.sin(angle) * sineAmplitude
	for (let j = 0; j < channels; j++) {
		offset = buffer.writeFloatLE(sample, offset)
	}
}

audioDevice.queue(buffer)
audioDevice.play()

setTimeout(() => {}, duration * 1e3)
