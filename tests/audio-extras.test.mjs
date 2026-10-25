import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

const hasPlayback = sdl.info.initialized.audio && sdl.audio.playback.devices.length > 1

T.test("sdl::audio::gain and frequencyRatio", (t) => {
	if (!hasPlayback) { return }
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
