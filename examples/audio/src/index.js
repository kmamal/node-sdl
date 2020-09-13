const SDL = require('../../..')

SDL.setLogger((x) => console.log('SDL>', x))

const spec = {
	freq: 48000,
	format: SDL.AudioFormat.F32LSB,
	channels: 2,
	samples: 4096,
}

const sine_freq = 440
const sine_period = Math.floor(spec.freq / sine_freq)
const sine_amplitude = 0.3

const bytes_per_sample = 4
const bytes_per_frame = bytes_per_sample * spec.channels
const buffer_ideal_sample_frames = Math.floor(spec.samples / 2)
const buffer_sample_frames = buffer_ideal_sample_frames - (buffer_ideal_sample_frames % sine_period)
const buffer_size = buffer_sample_frames * bytes_per_frame
const buffer = Buffer.alloc(buffer_size)
const buffer_duration = buffer_sample_frames / spec.freq

let offset = 0
for (let i = 0; i < buffer_sample_frames; i++) {
	const phase = (i % sine_period) / sine_period
	const sample = sine_amplitude * Math.sin(2 * Math.PI * phase)
	for (let j = 0; j < spec.channels; j++) {
		buffer.writeFloatLE(sample, offset++ * bytes_per_sample)
	}
}

SDL.Audio.start(spec)

setInterval(() => {
	SDL.Audio.queue(buffer, buffer_size)
}, buffer_duration)
