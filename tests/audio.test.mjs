import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

T.test("sdl::audio", async (t) => {
	t.timeout(3e3)

	t.equal(sdl.audio.bytesPerSample('f32lsb'), 4)
	t.equal(sdl.audio.minSampleValue('f32lsb'), -1)
	t.equal(sdl.audio.maxSampleValue('f32lsb'), 1)
	t.equal(sdl.audio.zeroSampleValue('f32lsb'), 0)

	t.ok(Array.isArray(sdl.audio.devices))

	for (const device of sdl.audio.devices) {
		t.ok([ 'playback', 'recording' ].includes(device.type))
		t.equal(typeof device.name, 'string')
		t.ok(device.name.length > 0)
	}

	const playbackDevices = sdl.audio.devices.filter(({ type }) => type === 'playback')
	const recordingDevices = sdl.audio.devices.filter(({ type }) => type === 'recording')

	if (playbackDevices.length === 0) {
		console.warn("NO AUDIO PLAYBACK FOUND")
	}
	else {
		const device = { type: 'playback' }

		const instance1 = sdl.audio.openDevice(device)
		const instance2 = sdl.audio.openDevice(playbackDevices[0], {
			channels: 2,
			frequency: 44100,
			format: 'u16',
			buffered: 1024,
		})

		t.equal(typeof instance1.id, 'number')
		t.equal(typeof instance2.id, 'number')
		t.notEqual(instance1.id, instance2.id)

		t.equal(instance1.device, device)
		t.equal(playbackDevices[0], instance2.device)

		t.equal(instance1.channels, 1)
		t.equal(instance2.channels, 2)

		t.equal(instance1.frequency, 48e3)
		t.equal(instance2.frequency, 44100)

		t.equal(instance1.format, 'f32')
		t.equal(instance2.format, 'u16')

		t.equal(instance1.bytesPerSample, 4)
		t.equal(instance2.bytesPerSample, 2)

		t.equal(instance1.minSampleValue, -1)
		t.equal(instance2.minSampleValue, 0)

		t.equal(instance1.maxSampleValue, 1)
		t.equal(instance2.maxSampleValue, 65535)

		t.equal(instance1.zeroSampleValue, 0)
		t.equal(instance2.zeroSampleValue, 32767)

		t.equal(instance1.buffered, 4096)
		t.equal(instance2.buffered, 1024)

		t.equal(instance1.playing, false)
		t.equal(instance2.playing, false)

		instance1.play()
		t.equal(instance1.playing, true)
		t.equal(instance2.playing, false)

		instance2.play(true)
		t.equal(instance1.playing, true)
		t.equal(instance2.playing, true)

		instance1.pause()
		t.equal(instance1.playing, false)
		t.equal(instance2.playing, true)

		instance2.play(false)
		t.equal(instance1.playing, false)
		t.equal(instance2.playing, false)

		t.equal(instance1.queued, 0)
		t.equal(instance2.queued, 0)

		const buffer = Buffer.alloc(256)

		instance1.enqueue(buffer)
		t.equal(instance1.queued, 256)
		t.equal(instance2.queued, 0)

		instance2.enqueue(buffer)
		t.equal(instance1.queued, 256)
		t.equal(instance2.queued, 256)

		instance1.clearQueue()
		t.equal(instance1.queued, 0)
		t.equal(instance2.queued, 256)

		instance2.clearQueue()
		t.equal(instance1.queued, 0)
		t.equal(instance2.queued, 0)

		instance1.close()
		instance2.close()
	}

	if (recordingDevices.length === 0) {
		console.warn("NO AUDIO RECORDING FOUND")
	}
	else {
		const device = { type: 'recording' }

		const instance1 = sdl.audio.openDevice(device)
		const instance2 = sdl.audio.openDevice(recordingDevices[0], {
			channels: 2,
			frequency: 44100,
			format: 'u16',
			buffered: 1024,
		})

		t.equal(typeof instance1.id, 'number')
		t.equal(typeof instance2.id, 'number')
		t.notEqual(instance1.id, instance2.id)

		t.equal(instance1.device, device)
		t.equal(recordingDevices[0], instance2.device)

		t.equal(instance1.channels, 1)
		t.equal(instance2.channels, 2)

		t.equal(instance1.frequency, 48e3)
		t.equal(instance2.frequency, 44100)

		t.equal(instance1.format, 'f32')
		t.equal(instance2.format, 'u16')

		t.equal(instance1.bytesPerSample, 4)
		t.equal(instance2.bytesPerSample, 2)

		t.equal(instance1.minSampleValue, -1)
		t.equal(instance2.minSampleValue, 0)

		t.equal(instance1.maxSampleValue, 1)
		t.equal(instance2.maxSampleValue, 65535)

		t.equal(instance1.zeroSampleValue, 0)
		t.equal(instance2.zeroSampleValue, 32767)

		t.equal(instance1.buffered, 4096)
		t.equal(instance2.buffered, 1024)

		t.equal(instance1.playing, false)
		t.equal(instance2.playing, false)

		t.equal(instance1.queued, 0)
		t.equal(instance2.queued, 0)

		instance1.play()
		t.equal(instance1.playing, true)
		t.equal(instance2.playing, false)

		instance2.play(true)
		t.equal(instance1.playing, true)
		t.equal(instance2.playing, true)

		await new Promise((resolve) => { setTimeout(resolve, 1e3) })

		t.ok(instance1.queued > 0)
		t.ok(instance2.queued > 0)

		const buffer = Buffer.alloc(256)

		const num1 = instance1.dequeue(buffer)
		t.ok(0 < num1 && num1 <= 256)

		const num2 = instance2.dequeue(buffer)
		t.ok(0 < num2 && num2 <= 256)

		instance1.pause()
		t.equal(instance1.playing, false)
		t.equal(instance2.playing, true)

		instance2.play(false)
		t.equal(instance1.playing, false)
		t.equal(instance2.playing, false)

		instance1.clearQueue()
		t.equal(instance1.queued, 0)
		t.ok(instance2.queued > 0)

		instance2.clearQueue()
		t.equal(instance1.queued, 0)
		t.equal(instance2.queued, 0)

		instance1.close()
		instance2.close()
	}
})
