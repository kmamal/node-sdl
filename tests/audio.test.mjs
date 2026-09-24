import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

T.test("sdl::audio", async (t) => {
	t.timeout(3e3)

	t.equal(sdl.audio.bytesPerSample('f32le'), 4)
	t.equal(sdl.audio.minSampleValue('f32le'), -1)
	t.equal(sdl.audio.maxSampleValue('f32le'), 1)
	t.equal(sdl.audio.zeroSampleValue('f32le'), 0)

	for (const module of [ sdl.audio.playback, sdl.audio.recording ]) {
		t.ok(Array.isArray(module.devices))
		for (const device of module.devices) {
			t.equal(typeof device.id, 'number')
			t.equal(typeof device.name, 'string')
			t.ok(device.name.length > 0)
		}
	}

	const playbackDevices = sdl.audio.playback.devices
	const recordingDevices = sdl.audio.recording.devices

	if (playbackDevices.length === 0) {
		console.warn("NO AUDIO PLAYBACK FOUND")
	}
	else {
		const stream1 = sdl.audio.playback.openDevice()
		const stream2 = sdl.audio.playback.openDevice(playbackDevices[0], {
			channels: 2,
			frequency: 44100,
			format: 's16',
			buffered: 1024,
		})

		t.equal(typeof stream1.id, 'number')
		t.equal(typeof stream2.id, 'number')
		t.notEqual(stream1.id, stream2.id)

		t.equal(stream1.device, null)
		t.equal(playbackDevices[0], stream2.device)

		t.equal(stream1.channels, 1)
		t.equal(stream2.channels, 2)

		t.equal(stream1.frequency, 48e3)
		t.equal(stream2.frequency, 44100)

		t.equal(stream1.format, 'f32')
		t.equal(stream2.format, 's16')

		t.equal(stream1.bytesPerSample, 4)
		t.equal(stream2.bytesPerSample, 2)

		t.equal(stream1.minSampleValue, -1)
		t.equal(stream2.minSampleValue, -32768)

		t.equal(stream1.maxSampleValue, 1)
		t.equal(stream2.maxSampleValue, 32767)

		t.equal(stream1.zeroSampleValue, 0)
		t.equal(stream2.zeroSampleValue, 0)

		t.equal(stream1.buffered, 4096)
		t.equal(stream2.buffered, 1024)

		t.equal(stream1.playing, false)
		t.equal(stream2.playing, false)

		stream1.play()
		t.equal(stream1.playing, true)
		t.equal(stream2.playing, false)

		stream2.play(true)
		t.equal(stream1.playing, true)
		t.equal(stream2.playing, true)

		stream1.pause()
		t.equal(stream1.playing, false)
		t.equal(stream2.playing, true)

		stream2.play(false)
		t.equal(stream1.playing, false)
		t.equal(stream2.playing, false)

		t.equal(stream1.queued, 0)
		t.equal(stream2.queued, 0)

		const buffer = Buffer.alloc(256)

		stream1.putData(buffer)
		t.equal(stream1.queued, 256)
		t.equal(stream2.queued, 0)

		stream2.putData(buffer)
		t.equal(stream1.queued, 256)
		t.equal(stream2.queued, 256)

		stream1.clear()
		t.equal(stream1.queued, 0)
		t.equal(stream2.queued, 256)

		stream2.clear()
		t.equal(stream1.queued, 0)
		t.equal(stream2.queued, 0)

		stream1.close()
		stream2.close()
	}

	if (recordingDevices.length === 0) {
		console.warn("NO AUDIO RECORDING FOUND")
	}
	else {
		const stream1 = sdl.audio.recording.openDevice()
		const stream2 = sdl.audio.recording.openDevice(recordingDevices[0], {
			channels: 2,
			frequency: 44100,
			format: 's16',
			buffered: 1024,
		})

		t.equal(typeof stream1.id, 'number')
		t.equal(typeof stream2.id, 'number')
		t.notEqual(stream1.id, stream2.id)

		t.equal(stream1.device, null)
		t.equal(recordingDevices[0], stream2.device)

		t.equal(stream1.channels, 1)
		t.equal(stream2.channels, 2)

		t.equal(stream1.frequency, 48e3)
		t.equal(stream2.frequency, 44100)

		t.equal(stream1.format, 'f32')
		t.equal(stream2.format, 's16')

		t.equal(stream1.buffered, 4096)
		t.equal(stream2.buffered, 1024)

		t.equal(stream1.playing, false)
		t.equal(stream2.playing, false)

		t.equal(stream1.available, 0)
		t.equal(stream2.available, 0)

		stream1.play()
		t.equal(stream1.playing, true)
		t.equal(stream2.playing, false)

		stream2.play(true)
		t.equal(stream1.playing, true)
		t.equal(stream2.playing, true)

		await new Promise((resolve) => { setTimeout(resolve, 1e3) })

		t.ok(stream1.available > 0)
		t.ok(stream2.available > 0)

		const buffer = Buffer.alloc(256)

		const num1 = stream1.getData(buffer)
		t.ok(0 < num1 && num1 <= 256)

		const num2 = stream2.getData(buffer)
		t.ok(0 < num2 && num2 <= 256)

		stream1.pause()
		t.equal(stream1.playing, false)
		t.equal(stream2.playing, true)

		stream2.play(false)
		t.equal(stream1.playing, false)
		t.equal(stream2.playing, false)

		stream1.clear()
		t.equal(stream1.available, 0)
		t.ok(stream2.available > 0)

		stream2.clear()
		t.equal(stream1.available, 0)
		t.equal(stream2.available, 0)

		stream1.close()
		stream2.close()
	}
})
