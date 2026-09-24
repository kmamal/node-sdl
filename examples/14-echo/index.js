import sdl from '@kmamal/sdl'
import { setTimeout } from 'node:timers/promises'

const buffered = 128
const options = { buffered }

const recordingStream = sdl.audio.recording.openDevice(null, options)
const playbackStream = sdl.audio.playback.openDevice(null, options)

const { frequency, bytesPerSample } = playbackStream

const duration = 0.25
const numSamples = duration * frequency
const numBytes = numSamples * bytesPerSample
const buffer = Buffer.alloc(numBytes, 0)

recordingStream.play()
playbackStream.play()

for (;;) {
	const { available } = recordingStream

	if (available === 0) {
		await setTimeout(1)
		continue
	}

	// Copy new samples
	const discarded = buffer.slice(0, available)
	playbackStream.putData(discarded)
	buffer.copy(buffer, 0, available)
	recordingStream.getData(buffer.slice(-available))

	// Apply effect
	const offset = buffer.length - discarded.length
	for (let i = 0; i < discarded.length; i += bytesPerSample) {
		const a = recordingStream.readSample(buffer, offset + i)
		const b = recordingStream.readSample(discarded, i)
		recordingStream.writeSample(buffer, a + b * 0.5, offset + i)
	}
}
