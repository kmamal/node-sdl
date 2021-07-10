import sdl from '@kmamal/sdl'
import { setTimeout } from 'timers/promises'

const recordingDevice = sdl.audio.devices.find(({ recording }) => recording)
const playbackDevice = sdl.audio.devices.find(({ recording }) => !recording)

const buffered = 128
const options = { buffered }

const recordingInstance = sdl.audio.openDevice(recordingDevice, options)
const playbackInstance = sdl.audio.openDevice(playbackDevice, options)

const { frequency, bytesPerSample } = playbackInstance

const duration = 0.25
const numSamples = duration * frequency
const numBytes = numSamples * bytesPerSample
const buffer = Buffer.alloc(numBytes, 0)

recordingInstance.play()
playbackInstance.play()

for (;;) {
	const { queued } = recordingInstance

	if (queued === 0) {
		await setTimeout(1)
		continue
	}

	// Copy new samples
	const discarded = buffer.slice(0, queued)
	playbackInstance.enqueue(discarded)
	buffer.copy(buffer, 0, queued)
	recordingInstance.dequeue(buffer.slice(-queued))

	// Apply effect
	const offset = buffer.length - discarded.length
	for (let i = 0; i < discarded.length; i += bytesPerSample) {
		const a = recordingInstance.readSample(buffer, offset + i)
		const b = recordingInstance.readSample(discarded, i)
		recordingInstance.writeSample(buffer, a + b * 0.5, offset + i)
	}
}
