import T from '@kmamal/testing'
import Os from 'node:os'
import sdl from '../../src/javascript/index.js'
import { hasRecording, skip } from '../helpers/env.mjs'
import { sleep } from '../helpers/wait.mjs'

const native = (format) => `${format}${Os.endianness().toLowerCase()}`

const checkClosedFormat = (t, device) => {
	t.equal(typeof device.format, 'string')
	t.ok(Number.isInteger(device.channels) && device.channels > 0)
	t.ok(Number.isInteger(device.frequency) && device.frequency > 0)
	t.ok(Number.isInteger(device.buffered) && device.buffered >= 0)
}

const checkOpenFormat = (t, device) => {
	t.equal(typeof device.format, 'string')
	t.ok(Number.isInteger(device.channels) && device.channels > 0)
	t.ok(Number.isInteger(device.frequency) && device.frequency > 0)
	t.ok(Number.isInteger(device.buffered) && device.buffered > 0)
}

T.test("sdl::audio::recording", async (t) => {
	t.timeout(3e3)
	if (!hasRecording()) {
		skip("no audio recording")
		return
	}

	const [ defaultRecordingDevice, ...recordingDevices ] = sdl.audio.recording.devices

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

	t.equal(stream1.device, defaultRecordingDevice)
	t.equal(recordingDevices[0], stream2.device)
	checkOpenFormat(t, defaultRecordingDevice)
	checkOpenFormat(t, recordingDevices[0])

	t.equal(stream1.channels, 1)
	t.equal(stream2.channels, 2)

	t.equal(stream1.frequency, 48e3)
	t.equal(stream2.frequency, 44100)

	t.equal(stream1.format, native('f32'))
	t.equal(stream2.format, native('s16'))


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

	await sleep(1e3)

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
	checkClosedFormat(t, defaultRecordingDevice)
	checkOpenFormat(t, recordingDevices[0])
	stream2.close()
	checkClosedFormat(t, recordingDevices[0])
})
