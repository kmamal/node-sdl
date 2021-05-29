const sdl = require('@kmamal/sdl')

const channels = 1
const frequency = 48e3
const format = sdl.audio.FORMAT.F32
const buffered = 128

const bytesPerSample = 4

const options = {
	channels,
	frequency,
	format,
	buffered,
}

const recording = sdl.audio.devices.find(({ recording }) => recording)
const playback = sdl.audio.devices.find(({ recording }) => !recording)

const recordingDevice = sdl.audio.openDevice(recording, options)
const playbackDevice = sdl.audio.openDevice(playback, options)

const duration = 0.25
const numSamples = duration * frequency
const numBytes = numSamples * bytesPerSample
const buffer = Buffer.alloc(numBytes, 0)

recordingDevice.play()
playbackDevice.play()

main_loop:
for (;;) {
	// Handle events
	{
		let event
		while ((event = sdl.events.poll())) {
			if (event.type === 'quit') { break main_loop }
		}
	}

	// Handle audio samples
	{
		const { queued } = recordingDevice
		if (queued === 0) { continue }

		// Copy new samples
		const discarded = buffer.slice(0, queued)
		buffer.copy(buffer, 0, queued)
		recordingDevice.dequeue(buffer.slice(-queued))

		// Apply effect
		const offset = buffer.length - discarded.length
		for (let i = 0; i < discarded.length; i += bytesPerSample) {
			const a = buffer.readFloatLE(offset + i)
			const b = discarded.readFloatLE(i)
			buffer.writeFloatLE(a + b * 0.5, offset + i)
		}

		playbackDevice.queue(discarded)
	}
}
