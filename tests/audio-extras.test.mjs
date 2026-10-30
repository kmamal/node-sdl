import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

const hasPlayback = sdl.info.initialized.audio && sdl.audio.playback.devices.length > 1

const sine = (frames, frequency, rate) => Float32Array.from({ length: frames }, (_, i) => Math.sin(2 * Math.PI * frequency * i / rate))

const checkFormat = (t, device) => {
	t.ok(device.format === null || typeof device.format === 'string')
	t.ok(Number.isInteger(device.channels) && device.channels > 0)
	t.ok(Number.isInteger(device.frequency) && device.frequency > 0)
	t.ok(Number.isInteger(device.buffered) && device.buffered >= 0)
}

T.test("sdl::audio::convert", (t) => {
	const input = Buffer.from(sine(4800, 1000, 48000).buffer)
	const f32Mono = { format: 'f32', channels: 1, frequency: 48000 }
	const s16Stereo = { format: 's16', channels: 2, frequency: 24000 }
	const size = 2400 * 2 * 2
	const allocated = sdl.audio.convert(f32Mono, input, s16Stereo)
	t.ok(Buffer.isBuffer(allocated))
	t.equal(allocated.length, size)

	const output = Buffer.alloc(size)
	t.equal(sdl.audio.convert(f32Mono, input, s16Stereo, output), size)

	const samples = new Int16Array(output.buffer, output.byteOffset, output.length / 2)
	let peak = 0
	for (let i = 400; i < 2000; i++) {
		t.equal(samples[2 * i], samples[2 * i + 1])
		peak = Math.max(peak, Math.abs(samples[2 * i]))
	}
	t.ok(peak > 30000 && peak <= 32768)

	const big = Buffer.alloc(size + 16)
	t.equal(sdl.audio.convert(f32Mono, input, s16Stereo, big), size)
	t.ok(big.subarray(0, size).equals(output))
	t.ok(allocated.equals(output))
	t.throws(() => sdl.audio.convert(f32Mono, input, s16Stereo, Buffer.alloc(size - 1)), /dstData must hold at least/u)
	t.throws(() => sdl.audio.convert(f32Mono, input, s16Stereo, new Uint8Array(size)), /dstData must be a Buffer/u)

	for (const [ srcRate, dstRate, frames ] of [ [ 44100, 48000, 1000 ], [ 48000, 44100, 1001 ], [ 8000, 96000, 333 ], [ 22050, 48000, 7 ] ]) {
		const src = { format: 'f32', channels: 2, frequency: srcRate }
		const dst = { format: 'f32', channels: 1, frequency: dstRate }
		const data = Buffer.alloc(frames * 8)
		const result = sdl.audio.convert(src, data, dst)
		t.equal(result.length % 4, 0)
		t.ok(Math.abs(result.length / 4 - frames * dstRate / srcRate) <= 1)
	}

	const shared = Buffer.from(new SharedArrayBuffer(input.length))
	input.copy(shared)
	const same = Buffer.alloc(input.length)
	t.equal(sdl.audio.convert({ channels: 1 }, shared, { channels: 1 }, same), input.length)
	t.ok(same.equals(input))

	t.equal(sdl.audio.convert({}, Buffer.alloc(0), {}, Buffer.alloc(0)), 0)
	t.equal(sdl.audio.convert({}, Buffer.alloc(0), {}).length, 0)
	t.throws(() => sdl.audio.convert({}, new Uint8Array(8), {}, Buffer.alloc(8)), /srcData must be a Buffer/u)
	t.throws(() => sdl.audio.convert({}, Buffer.alloc(6), {}, Buffer.alloc(8)), /multiple of 4/u)
	t.throws(() => sdl.audio.convert({ format: 'x' }, Buffer.alloc(8), {}, Buffer.alloc(8)), /invalid srcSpec.format/u)
	t.throws(() => sdl.audio.convert({}, Buffer.alloc(8), { channels: 9 }, Buffer.alloc(8)), /dstSpec.channels must be between 1 and 8/u)
	t.throws(() => sdl.audio.convert({ frequency: 0 }, Buffer.alloc(8), {}, Buffer.alloc(8)), /srcSpec.frequency must be between/u)
})

T.test("sdl::audio::device formats", (t) => {
	if (!sdl.info.initialized.audio) { return }
	for (const device of sdl.audio.playback.devices) { checkFormat(t, device) }
	for (const device of sdl.audio.recording.devices) { checkFormat(t, device) }
})

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

const hasRecording = sdl.info.initialized.audio && sdl.audio.recording.devices.length > 1

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms) })

T.test("sdl::audio::drain refills without underruns", async (t) => {
	t.timeout(5e3)
	if (!hasPlayback) { return }
	const frames = 4096
	const chunk = Buffer.from(sine(frames, 440, 48000).map((x) => x * 0.01).buffer)
	const stream = sdl.audio.playback.openDevice(null, { channels: 1, frequency: 48000, buffered: 1024 })
	let drains = 0
	let underruns = 0
	let missing = 0
	stream.on('drain', (event) => {
		t.equal(event.type, 'drain')
		drains++
		underruns += event.underruns
		missing += event.missing
		if (stream.queued <= frames * 4) { stream.putData(chunk) }
	})
	stream.putData(chunk)
	stream.putData(chunk)
	stream.play()
	await sleep(500)
	t.ok(drains > 0)
	t.equal(underruns, 0)
	t.equal(missing, 0)
	stream.close()
})

T.test("sdl::audio::starving counts underruns", async (t) => {
	t.timeout(5e3)
	if (!hasPlayback) { return }
	const stream = sdl.audio.playback.openDevice(null, { channels: 2, frequency: 48000, buffered: 1024 })
	let underruns = 0
	let missing = 0
	stream.on('drain', (event) => {
		underruns += event.underruns
		missing += event.missing
		t.equal(event.missing % 8, 0)
	})
	stream.putData(Buffer.alloc(480 * 2 * 4))
	stream.play()
	await sleep(200)
	t.ok(underruns > 0)
	t.ok(missing > 0)
	stream.pause()
	await sleep(100)
	const paused = underruns
	await sleep(100)
	t.equal(underruns, paused)
	stream.close()
})

T.test("sdl::audio::no events after close", async (t) => {
	t.timeout(5e3)
	if (!hasPlayback) { return }
	const stream = sdl.audio.playback.openDevice(null, { channels: 1, buffered: 1024 })
	let drains = 0
	const listener = () => { drains++ }
	stream.on('drain', listener)
	stream.off('drain', listener)
	stream.on('drain', listener)
	stream.play()
	await sleep(100)
	t.ok(drains > 0)
	stream.close()
	const count = drains
	await sleep(100)
	t.equal(drains, count)
	t.throws(() => stream.on('drain', listener), /stream is closed/u)
})

T.test("sdl::audio::wildcard listener enables drain", async (t) => {
	t.timeout(5e3)
	if (!hasPlayback) { return }
	const stream = sdl.audio.playback.openDevice(null, { channels: 1, buffered: 1024 })
	let drains = 0
	const listener = (type) => {
		if (type === 'drain') { drains++ }
	}
	stream.on('*', listener)
	stream.play()
	await sleep(100)
	t.ok(drains > 0)
	stream.off('*', listener)
	await sleep(50)
	const count = drains
	await sleep(100)
	t.equal(drains, count)
	stream.close()
})

T.test("sdl::audio::recording readable", async (t) => {
	t.timeout(5e3)
	if (!hasRecording) { return }
	const stream = sdl.audio.recording.openDevice(null, { channels: 1, buffered: 1024 })
	t.throws(() => stream.on('drain', () => {}), /invalid event/u)
	let readable = 0
	stream.on('readable', (event) => {
		t.equal(event.type, 'readable')
		readable++
	})
	stream.play()
	await sleep(300)
	t.ok(readable > 0)
	t.ok(stream.available > 0)
	stream.close()
})
