import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import { hasPlayback, hasRecording, skip } from '../helpers/env.mjs'
import { sleep } from '../helpers/wait.mjs'

const sine = (frames, frequency, rate) => Float32Array.from({ length: frames }, (_, i) => Math.sin(2 * Math.PI * frequency * i / rate))

T.test("sdl::audio::drain refills without underruns", async (t) => {
	t.timeout(5e3)
	if (!hasPlayback()) {
		skip("no audio playback")
		return
	}
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
	if (!hasPlayback()) {
		skip("no audio playback")
		return
	}
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
	if (!hasPlayback()) {
		skip("no audio playback")
		return
	}
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
	if (!hasPlayback()) {
		skip("no audio playback")
		return
	}
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
	if (!hasRecording()) {
		skip("no audio recording")
		return
	}
	const stream = sdl.audio.recording.openDevice(null, { channels: 1, buffered: 1024 })
	t.throws(() => stream.on('drain', () => {}), /invalid event/u)
	let readable = 0
	let available = 0
	stream.on('readable', (event) => {
		t.equal(event.type, 'readable')
		t.ok(Number.isInteger(event.available) && event.available >= 0)
		readable++
		available = event.available
	})
	stream.play()
	await sleep(300)
	t.ok(readable > 0)
	t.ok(available > 0)
	t.ok(stream.available >= available)
	stream.close()
})

T.test("sdl::audio::readable reports backlog", async (t) => {
	t.timeout(5e3)
	if (!hasRecording()) {
		skip("no audio recording")
		return
	}
	const stream = sdl.audio.recording.openDevice(null, { channels: 1, buffered: 1024 })
	const seen = []
	stream.on('readable', (event) => { seen.push(event.available) })
	stream.play()
	await sleep(300)
	t.ok(seen.length > 1)
	t.ok(seen.at(-1) > seen[0])
	stream.getData(Buffer.alloc(stream.available))
	seen.length = 0
	await sleep(100)
	t.ok(seen.length > 0)
	t.ok(seen[0] <= stream.available)
	stream.close()
})
