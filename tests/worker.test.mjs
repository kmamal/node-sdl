import T from '@kmamal/testing'
import Path from 'node:path'
import { Worker } from 'node:worker_threads'
import { execFile } from 'node:child_process'
import sdl from '../src/javascript/index.js'
import Bindings from '../src/javascript/bindings.js'

const indexPath = Path.join(import.meta.dirname, '../src/javascript/index.js')
const workerPath = Path.join(import.meta.dirname, '../src/javascript/worker.js')

const runWorker = (body, workerData) => new Promise((resolve, reject) => {
	const worker = new Worker(`
		const sdl = require(${JSON.stringify(workerPath)})
		const { parentPort, workerData } = require('node:worker_threads')
		const send = (x) => parentPort.postMessage(x)
		const attempt = (fn) => { try { fn(); return null } catch (error) { return error.message } }
		;(async () => { ${body} })().catch((error) => { send({ error: error.message }) })
	`, { eval: true, workerData })
	const messages = []
	worker.on('message', (message) => { messages.push(message) })
	worker.on('error', reject)
	worker.on('exit', () => { resolve(messages) })
})

const runProcess = (code) => new Promise((resolve) => {
	const child = execFile(process.execPath, [ '--input-type=module', '-e', code ], { timeout: 10e3 }, (_, stdout) => {
		resolve({ stdout, status: child.exitCode, signal: child.signalCode })
	})
})

const hasPlayback = sdl.info.initialized.audio && sdl.audio.playback.devices.length > 1

T.test("sdl::worker module", async (t) => {
	const [ result ] = await runWorker(`
		send({
			keys: Object.keys(sdl),
			audioKeys: Object.keys(sdl.audio),
			bytesPerSample: sdl.audio.bytesPerSample('s16'),
			numScancodes: Object.keys(sdl.keyboard.SCANCODE).length,
			mainImport: attempt(() => require(${JSON.stringify(indexPath)})),
		})
	`)

	t.equal(result.keys, [ 'video', 'keyboard', 'mouse', 'sensor', 'audio' ])
	t.equal(result.audioKeys, [ 'bytesPerSample', 'minSampleValue', 'maxSampleValue', 'zeroSampleValue', 'readSample', 'writeSample', 'convert', 'playback', 'recording' ])
	t.equal(result.bytesPerSample, 2)
	t.equal(result.numScancodes, Object.keys(sdl.keyboard.SCANCODE).length)
	t.equal(result.mainImport, "@kmamal/sdl can only be used in the main thread, import @kmamal/sdl/worker in workers")
})

T.test("sdl::worker module throws in the main thread", async (t) => {
	await t.throwsAsync(() => import('../src/javascript/worker.js'))
})

T.test("sdl::worker validates devices", async (t) => {
	const [ result ] = await runWorker(`
		send({
			notObject: attempt(() => sdl.audio.playback.openDevice('a')),
			badId: attempt(() => sdl.audio.playback.openDevice({ id: 1.5 })),
			negativeId: attempt(() => sdl.audio.playback.openDevice({ id: -1 })),
		})
	`)

	t.equal(result.notObject, "device must be an object")
	t.equal(result.badId, "device.id must be an integer")
	t.equal(result.negativeId, "device.id must be an unsigned 32-bit integer")
})

T.test("sdl::worker audio playback", async (t) => {
	if (!hasPlayback) {
		console.warn("NO AUDIO PLAYBACK FOUND")
		return
	}

	const [ result ] = await runWorker(`
		const results = []
		for (const device of [ null, workerData.device ]) {
			const stream = sdl.audio.playback.openDevice(device, { channels: 1, frequency: 48000, format: 'f32' })
			stream.putData(Buffer.alloc(4800 * 4))
			const queued = stream.queued
			stream.play()
			const opened = { format: stream.device.format, frequency: stream.device.frequency }
			stream.close()
			results.push({ id: stream.id, queued, opened, closedFormat: stream.device.format, sameDevice: device === null || stream.device === device })
		}
		send(results)
	`, { device: sdl.audio.playback.devices[1] })

	for (const stream of result) {
		t.equal(typeof stream.id, 'number')
		t.equal(stream.queued, 4800 * 4)
		t.equal(typeof stream.opened.format, 'string')
		t.ok(stream.opened.frequency > 0)
		t.equal(typeof stream.closedFormat, 'string')
		t.ok(stream.sameDevice)
	}
})

T.test("sdl::worker streams are released on terminate", async (t) => {
	if (!hasPlayback) {
		console.warn("NO AUDIO PLAYBACK FOUND")
		return
	}

	const worker = new Worker(`
		const sdl = require(${JSON.stringify(workerPath)})
		const { parentPort } = require('node:worker_threads')
		const stream = sdl.audio.playback.openDevice()
		stream.putData(Buffer.alloc(48000 * 4 * 10))
		stream.play()
		parentPort.postMessage(stream.id)
		setInterval(() => {}, 1e3)
	`, { eval: true })
	const id = await new Promise((resolve) => { worker.once('message', resolve) })

	t.throwsNot(() => Bindings.audio_getQueued(id))

	await worker.terminate()

	t.throws(() => Bindings.audio_getQueued(id))

	const stream = sdl.audio.playback.openDevice()
	t.equal(stream.queued, 0)
	stream.close()
})

T.test("sdl::worker devices", async (t) => {
	if (!sdl.info.initialized.audio) { return }

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

T.test("sdl::worker drain", async (t) => {
	t.timeout(5e3)

	if (!hasPlayback) {
		console.warn("NO AUDIO PLAYBACK FOUND")
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

T.test("sdl::worker terminated during drain", async (t) => {
	t.timeout(30e3)

	if (!hasPlayback) {
		console.warn("NO AUDIO PLAYBACK FOUND")
		return
	}

	for (let i = 0; i < 50; i++) {
		const worker = new Worker(`
			const sdl = require(${JSON.stringify(workerPath)})
			const { parentPort } = require('node:worker_threads')
			const stream = sdl.audio.playback.openDevice(null, { channels: 1, buffered: 256 })
			stream.on('drain', () => { stream.putData(Buffer.alloc(256 * 4)) })
			stream.play()
			parentPort.postMessage(stream.id)
			setInterval(() => {}, 1e3)
		`, { eval: true })
		const id = await new Promise((resolve) => { worker.once('message', resolve) })
		await new Promise((resolve) => { setTimeout(resolve, i % 5) })
		await worker.terminate()
		t.throws(() => Bindings.audio_getQueued(id))
	}
})

T.test("sdl::worker stays alive while audio plays", async (t) => {
	t.timeout(5e3)

	if (!hasPlayback) {
		console.warn("NO AUDIO PLAYBACK FOUND")
		return
	}

	const start = Date.now()
	await runWorker(`
		const stream = sdl.audio.playback.openDevice(null, { channels: 1, frequency: 48000, format: 'f32' })
		stream.putData(Buffer.alloc(48000 * 4 / 2))
		stream.play()
	`)
	t.ok(Date.now() - start >= 500)
})

T.test("sdl::worker before main import throws on open", async (t) => {
	t.timeout(10e3)

	const { stdout, status } = await runProcess(`
		import { Worker } from 'node:worker_threads'
		const worker = new Worker(${JSON.stringify(`
			const sdl = require(${JSON.stringify(workerPath)})
			try { sdl.audio.playback.openDevice() }
			catch (error) { console.log(error.message) }
		`)}, { eval: true, execArgv: [] })
	`)
	t.equal(status, 0)
	t.equal(stdout.trim(), "SDL is not initialized, import @kmamal/sdl in the main thread first")
})

T.test("sdl::worker survives main thread exit", async (t) => {
	t.timeout(30e3)

	for (let i = 0; i < 3; i++) {
		const { status, signal } = await runProcess(`
			import sdl from ${JSON.stringify(indexPath)}
			import { Worker } from 'node:worker_threads'
			new Worker(${JSON.stringify(`
				const sdl = require(${JSON.stringify(workerPath)})
				const { parentPort } = require('node:worker_threads')
				const stream = sdl.audio.playback.openDevice()
				stream.play()
				const buffer = Buffer.alloc(4800 * 4)
				const loop = () => {
					try { stream.putData(buffer) }
					catch (_) {}
					setImmediate(loop)
				}
				loop()
				parentPort.postMessage('running')
			`)}, { eval: true, execArgv: [] }).once('message', () => { setTimeout(() => { process.exit(0) }, 50) })
		`)
		t.equal(signal, null)
		t.equal(status, 0)
	}
})
