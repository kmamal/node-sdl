import T from '@kmamal/testing'
import Os from 'node:os'
import sdl from '../../src/javascript/index.js'
import { hasPlayback, skip } from '../helpers/env.mjs'

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

T.test("sdl::audio::playback", (t) => {
	if (!hasPlayback()) {
		skip("no audio playback")
		return
	}

	const [ defaultPlaybackDevice, ...playbackDevices ] = sdl.audio.playback.devices

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

	t.equal(stream1.device, defaultPlaybackDevice)
	t.equal(playbackDevices[0], stream2.device)
	checkOpenFormat(t, defaultPlaybackDevice)
	checkOpenFormat(t, playbackDevices[0])

	t.equal(stream1.channels, 1)
	t.equal(stream2.channels, 2)

	t.equal(stream1.frequency, 48e3)
	t.equal(stream2.frequency, 44100)

	t.equal(stream1.format, native('f32'))
	t.equal(stream2.format, native('s16'))

	t.equal(stream1.bytesPerSample, 4)
	t.equal(stream2.bytesPerSample, 2)

	t.equal(stream1.minSampleValue, -1)
	t.equal(stream2.minSampleValue, -32768)

	t.equal(stream1.maxSampleValue, 1)
	t.equal(stream2.maxSampleValue, 32767)

	t.equal(stream1.zeroSampleValue, 0)
	t.equal(stream2.zeroSampleValue, 0)


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
	checkClosedFormat(t, defaultPlaybackDevice)
	checkOpenFormat(t, playbackDevices[0])
	stream2.close()
	checkClosedFormat(t, playbackDevices[0])
})

T.test("sdl::audio::gain and frequencyRatio", (t) => {
	if (!hasPlayback()) {
		skip("no audio playback")
		return
	}
	const stream = sdl.audio.playback.openDevice(null, { channels: 1 })
	t.equal(stream.gain, 1)
	t.equal(stream.frequencyRatio, 1)
	stream.setGain(0.5)
	stream.setFrequencyRatio(2)
	t.equal(stream.gain, 0.5)
	t.equal(stream.frequencyRatio, 2)
	t.throws(() => stream.setGain(-1), /gain must be non-negative/u)
	t.throws(() => stream.setGain(NaN), /gain must be a finite number/u)
	t.throws(() => stream.setFrequencyRatio(0), /frequencyRatio must be between/u)
	t.throws(() => stream.setFrequencyRatio(101), /frequencyRatio must be between/u)
	stream.close()
	t.throws(() => stream.setGain(1), /stream is closed/u)

	const options = sdl.audio.playback.openDevice(null, { channels: 1, gain: 0.25, frequencyRatio: 0.5 })
	t.equal(options.gain, 0.25)
	t.equal(options.frequencyRatio, 0.5)
	options.close()
	t.throws(() => sdl.audio.playback.openDevice(null, { gain: -1 }), /gain must be non-negative/u)
	t.throws(() => sdl.audio.playback.openDevice(null, { frequencyRatio: 0 }), /frequencyRatio must be between/u)
})
