import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'
import SensorEvents from '../src/javascript/sensor/events.js'
import { hasPlayback, hasRecording, skip } from './helpers/env.mjs'

T.test("sdl::mouse validates arguments", (t) => {
	t.throws(() => { sdl.mouse.getButton(0) })
	t.throws(() => { sdl.mouse.getButton(33) })
	t.throws(() => { sdl.mouse.getButton(1.5) })
	t.throws(() => { sdl.mouse.setPosition(NaN, 0) })
	t.throws(() => { sdl.mouse.setPosition(0, '0') })
	t.throws(() => { sdl.mouse.setPosition(1e300, 0) })
	t.throws(() => { sdl.mouse.setPosition(0, -1e300) })
	t.throws(() => { sdl.mouse.setCursor(1) })
	t.throws(() => { sdl.mouse.setCursor('foo') })
	t.throws(() => { sdl.mouse.showCursor(1) })
	t.throws(() => { sdl.mouse.capture(1) })
	t.equal(sdl.mouse.captured, false)

	const buffer = Buffer.alloc(4 * 4 * 4)
	t.throws(() => { sdl.mouse.setCursorImage(4, 4, 16, 'rgba32', buffer, 1.5, 0) })
	t.throws(() => { sdl.mouse.setCursorImage(4, 4, 16, 'rgba32', buffer, -1, 0) })
	t.throws(() => { sdl.mouse.setCursorImage(4, 4, 16, 'rgba32', buffer, 4, 0) })
	t.throws(() => { sdl.mouse.setCursorImage(4, 4, 16, 'rgba32', buffer, 0, 1.5) })
	t.throws(() => { sdl.mouse.setCursorImage(4, 4, 16, 'rgba32', buffer, 0, -1) })
	t.throws(() => { sdl.mouse.setCursorImage(4, 4, 16, 'rgba32', buffer, 0, 4) })
	t.throws(() => { sdl.mouse.setCursorImage(4, 4, 4, 'nv12', Buffer.alloc(24), 0, 0) })
	t.throws(() => { sdl.mouse.setCursorImage(4, 4, 16, 'rgba32', Buffer.alloc(8), 0, 0) })

	try {
		t.throwsNot(() => { sdl.mouse.setCursorImage(4, 4, 16, 'rgba32', buffer, 3, 3) })
	}
	finally { sdl.mouse.resetCursor() }
})

T.test("sdl::keyboard validates arguments", (t) => {
	t.throws(() => { sdl.keyboard.getKey(-1) })
	t.throws(() => { sdl.keyboard.getKey(512) })
	t.throws(() => { sdl.keyboard.getKey(1.5) })
	t.throws(() => { sdl.keyboard.getScancode(1) })
	t.throws(() => { sdl.keyboard.getScancode('notakey') })
	t.throws(() => { sdl.keyboard.on('foo', () => {}) })

	t.equal(sdl.keyboard.getScancode('a'), sdl.keyboard.SCANCODE.A)
	t.equal(sdl.keyboard.getKey(sdl.keyboard.SCANCODE.A), 'a')
})

T.test("sdl::clipboard validates arguments", (t) => {
	t.throws(() => { sdl.clipboard.setText(1) })
	t.throws(() => { sdl.clipboard.on('foo', () => {}) })
})

T.test("sdl::video helpers validate arguments", (t) => {
	t.throws(() => { sdl.video.bytesPerPixel(1) })
	t.throws(() => { sdl.video.bytesPerPixel('foo') })
	t.throws(() => { sdl.video.minStride('rgba32', -1) })
	t.throws(() => { sdl.video.minBufferSize('rgba32', 1.5, 1) })
	t.throws(() => { sdl.video.minBufferSize('rgba32', 1, -1) })
	t.throws(() => { sdl.video.on('foo', () => {}) })
	t.equal(sdl.video.minStride('rgba32', 3), 12)
	t.equal(sdl.video.minBufferSize('rgba32', 12, 2), 24)
})

T.test("sdl::sensor validates arguments", (t) => {
	if (!sdl.sensor.isAvailable()) {
		skip("no sensor subsystem")
		return
	}
	t.ok(Array.isArray(sdl.sensor.devices))
	t.throws(() => { sdl.sensor.openDevice(null) })
	t.throws(() => { sdl.sensor.openDevice(1) })
	t.throws(() => { sdl.sensor.openDevice({ id: -1 }) })
	t.throwsNot(() => { SensorEvents.handleEvent({ type: 'update', x: 0, y: 0, z: 0 }, -1) })
})

T.test("sdl::audio validates stream options", (t) => {
	if (!hasPlayback()) {
		skip("no audio playback")
		return
	}

	const open = (options) => sdl.audio.playback.openDevice(null, options)

	t.throws(() => { sdl.audio.playback.openDevice(1) })
	t.throws(() => { sdl.audio.playback.openDevice({ id: -1 }) })
	t.throws(() => { open(null) })
	t.throws(() => { open({ channels: 0 }) })
	t.throws(() => { open({ channels: 9 }) })
	t.throws(() => { open({ frequency: 0 }) })
	t.throws(() => { open({ format: 1 }) })
	t.throws(() => { open({ format: 'foo' }) })
	t.throws(() => { open({ buffered: 0 }) })
	t.throws(() => { open({ buffered: 2 ** 16 }) })
	t.throws(() => { open({ gain: 1e300 }) })
	t.throws(() => { open({ buffered: 1000 }) })
	t.throws(() => { open({ gain: -1 }) })
	t.throws(() => { open({ frequencyRatio: 0 }) })
	t.throws(() => { open({ frequencyRatio: 101 }) })
	t.throws(() => { sdl.audio.playback.on('foo', () => {}) })

	const stream = open({ gain: 0.5, frequencyRatio: 2 })
	try {
		t.equal(stream.gain, 0.5)
		t.equal(stream.frequencyRatio, 2)
		t.throws(() => { stream.on('foo', () => {}) })
		t.throws(() => { stream.setGain(-1) })
		t.throws(() => { stream.setGain(NaN) })
		t.throws(() => { stream.setFrequencyRatio(0.001) })
		t.throws(() => { stream.play(1) })
		t.throws(() => { stream.readSample(new Uint8Array(4), 0) })
		t.throws(() => { stream.writeSample(new Uint8Array(4), 0, 0) })
		t.throws(() => { stream.putData(new Uint8Array(4)) })
		stream.setGain(1)
		stream.setFrequencyRatio(1)
		t.equal(stream.gain, 1)
		t.equal(stream.frequencyRatio, 1)
	}
	finally { stream.close() }

	t.throws(() => { stream.close() })
	t.throws(() => { stream.setGain(1) })
	t.throws(() => { stream.setFrequencyRatio(1) })
	t.throws(() => { stream.play() })
	t.throws(() => { stream.pause() })
	t.throws(() => { stream.clear() })
	t.throws(() => { stream.putData(Buffer.alloc(4)) })
	t.throws(() => { stream.on('drain', () => {}) })
})

T.test("sdl::audio recording validates arguments", (t) => {
	if (!hasRecording()) {
		skip("no audio recording")
		return
	}

	t.throws(() => { sdl.audio.recording.openDevice({ id: -1 }) })

	const stream = sdl.audio.recording.openDevice()
	try {
		t.throws(() => { stream.getData(1) })
		t.throws(() => { stream.on('drain', () => {}) })
	}
	finally { stream.close() }

	t.throws(() => { stream.getData(Buffer.alloc(4)) })
})

T.test("sdl::audio helpers validate arguments", (t) => {
	t.throws(() => { sdl.audio.bytesPerSample('foo') })
	t.throws(() => { sdl.audio.bytesPerSample(1) })
	t.throws(() => { sdl.audio.readSample('s16', new Uint8Array(2), 0) })
	t.throws(() => { sdl.audio.writeSample('s16', new Uint8Array(2), 0, 0) })
	t.equal(sdl.audio.bytesPerSample('s16'), 2)
})
