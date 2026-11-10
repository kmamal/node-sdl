import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import Bindings from '../../src/javascript/bindings.js'
import { hasAudio, hasPlayback, skip } from '../helpers/env.mjs'
import { runWorker, startWorker } from '../helpers/worker.mjs'

T.test("sdl::worker devices", async (t) => {
	if (!hasAudio()) {
		skip("no audio")
		return
	}

	const [ result ] = await runWorker(`
		const playback = sdl.audio.playback.devices
		const recording = sdl.audio.recording.devices
		send({
			playback: playback.map(({ id, name, frequency }) => ({ id, name, frequency })),
			recording: recording.map(({ id, name }) => ({ id, name })),
			sameDefault: sdl.audio.playback.devices[0] === playback[0],
		})
	`)

	t.equal(result.playback.map((d) => d.id), sdl.audio.playback.devices.map((d) => d.id))
	t.equal(result.recording.map((d) => d.id), sdl.audio.recording.devices.map((d) => d.id))
	t.equal(result.playback[0].name, null)
	t.equal(result.playback[0].frequency, sdl.audio.playback.devices[0].frequency)
	t.ok(result.sameDefault)
})

T.test("sdl::worker looks up devices by id", async (t) => {
	if (!hasAudio()) {
		skip("no audio")
		return
	}

	const [ result ] = await runWorker(`
		const local = sdl.audio.playback.devices
		const bindsTo = (device) => {
			const stream = sdl.audio.playback.openDevice(device)
			const index = local.indexOf(stream.device)
			stream.close()
			return index
		}
		send({
			notObject: attempt(() => sdl.audio.playback.openDevice('a')),
			unknown: attempt(() => sdl.audio.playback.openDevice({ id: -1 })),
			copy: bindsTo({ ...local[local.length - 1] }),
			fromMain: bindsTo(workerData.device),
		})
	`, { device: sdl.audio.playback.devices.at(-1) })

	const last = sdl.audio.playback.devices.length - 1
	t.equal(result.notObject, "device must be an object")
	t.equal(result.unknown, "device must be from sdl.audio.playback.devices")
	t.equal(result.copy, last)
	t.equal(result.fromMain, last)
})

T.test("sdl::worker audio playback", async (t) => {
	if (!hasPlayback()) {
		skip("no audio playback")
		return
	}

	const [ result ] = await runWorker(`
		const results = []
		for (const device of [ null, sdl.audio.playback.devices[1] ]) {
			const stream = sdl.audio.playback.openDevice(device, { channels: 1, frequency: 48000, format: 'f32' })
			stream.putData(Buffer.alloc(4800 * 4))
			const queued = stream.queued
			stream.play()
			const opened = { format: stream.device.format, frequency: stream.device.frequency }
			stream.close()
			results.push({ id: stream.id, queued, opened, closedFormat: stream.device.format, sameDevice: device === null || stream.device === device })
		}
		send(results)
	`)

	for (const stream of result) {
		t.equal(typeof stream.id, 'number')
		t.equal(stream.queued, 4800 * 4)
		t.equal(typeof stream.opened.format, 'string')
		t.ok(stream.opened.frequency > 0)
		t.equal(typeof stream.closedFormat, 'string')
		t.ok(stream.sameDevice)
	}
})

T.test("sdl::worker drain", async (t) => {
	t.timeout(5e3)

	if (!hasPlayback()) {
		skip("no audio playback")
		return
	}

	const [ result ] = await runWorker(`
		const stream = sdl.audio.playback.openDevice(null, { channels: 1, frequency: 48000, buffered: 1024 })
		const chunk = Buffer.alloc(4096 * 4)
		let drains = 0
		let underruns = 0
		stream.on('drain', (event) => {
			drains++
			underruns += event.underruns
			if (stream.queued <= chunk.length) { stream.putData(chunk) }
		})
		stream.putData(chunk)
		stream.putData(chunk)
		stream.play()
		await new Promise((resolve) => { setTimeout(resolve, 300) })
		stream.close()
		send({ drains, underruns })
	`)

	t.ok(result.drains > 0)
	t.equal(result.underruns, 0)
})

T.test("sdl::worker audio device events", async (t) => {
	t.timeout(5e3)

	if (!hasPlayback()) {
		skip("no audio playback")
		return
	}

	const real = sdl.audio.playback.devices[1]

	const { nextMessage, exited } = startWorker(`
		const events = []
		const stream = sdl.audio.playback.openDevice(sdl.audio.playback.devices[1])
		stream.on('close', () => { events.push('close') })
		sdl.audio.playback.on('*', (type, event) => {
			events.push({ type, id: event.device.id, listed: sdl.audio.playback.devices.includes(event.device) })
			if (events.length < 3) { return }
			sdl.audio.playback.removeAllListeners('*')
			send({ events, streamClosed: stream.closed })
		})
		send('ready')
	`)

	t.equal(await nextMessage(), 'ready')
	Bindings.testing_pushAudioDeviceEvent('remove', real.id, false)
	Bindings.testing_pushAudioDeviceEvent('add', real.id, false)

	const result = await nextMessage()
	await exited

	t.equal(result.events, [
		'close',
		{ type: 'deviceRemove', id: real.id, listed: false },
		{ type: 'deviceAdd', id: real.id, listed: true },
	])
	t.ok(result.streamClosed)
	t.equal(sdl.audio.playback.devices.at(-1).id, real.id)
})

T.test("sdl::worker streams are released on terminate", async (t) => {
	if (!hasPlayback()) {
		skip("no audio playback")
		return
	}

	const { worker, nextMessage } = startWorker(`
		const stream = sdl.audio.playback.openDevice()
		stream.putData(Buffer.alloc(48000 * 4 * 10))
		stream.play()
		send(stream.id)
		setInterval(() => {}, 1e3)
	`)
	const id = await nextMessage()

	t.throwsNot(() => Bindings.audio_getQueued(id))

	await worker.terminate()

	t.throws(() => Bindings.audio_getQueued(id))

	const stream = sdl.audio.playback.openDevice()
	t.equal(stream.queued, 0)
	stream.close()
})
