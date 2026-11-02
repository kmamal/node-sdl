import T from '@kmamal/testing'
import Path from 'node:path'
import { Worker } from 'node:worker_threads'
import { execFile } from 'node:child_process'
import sdl from '../src/javascript/index.js'
import Bindings from '../src/javascript/bindings.js'

const indexPath = Path.join(import.meta.dirname, '../src/javascript/index.js')
const globalsPath = Path.join(import.meta.dirname, '../src/javascript/globals.js')
const EVENTS_POLL = 'events_poll'

const MAIN_THREAD_ONLY = "the video subsystem is only available on the main thread"
const NOT_STARTED = "@kmamal/sdl must be imported on the main thread before it can be used in a worker"

const prelude = `
	const sdl = require(${JSON.stringify(indexPath)})
	const { parentPort, workerData } = require('node:worker_threads')
	const send = (x) => parentPort.postMessage(x)
	const attempt = (fn) => { try { fn(); return null } catch (error) { return error.message } }
`

const runWorker = (body, workerData) => new Promise((resolve, reject) => {
	const worker = new Worker(`
		${prelude}
		;(async () => { ${body} })().catch((error) => { send({ error: error.message }) })
	`, { eval: true, workerData })
	const messages = []
	worker.on('message', (message) => { messages.push(message) })
	worker.on('error', reject)
	worker.on('exit', () => { resolve(messages) })
})

const startWorker = (body, workerData) => {
	const worker = new Worker(`
		${prelude}
		;(async () => { ${body} })().catch((error) => { send({ error: error.message }) })
	`, { eval: true, workerData })
	const messages = []
	const waiters = []
	worker.on('message', (message) => {
		messages.push(message)
		for (const waiter of waiters.splice(0)) { waiter() }
	})
	const nextMessage = async () => {
		while (messages.length === 0) {
			await new Promise((resolve) => { waiters.push(resolve) })
		}
		return messages.shift()
	}
	const exited = new Promise((resolve, reject) => {
		worker.on('error', reject)
		worker.on('exit', resolve)
	})
	return { worker, nextMessage, exited }
}

const runProcess = (code) => new Promise((resolve) => {
	const child = execFile(process.execPath, [ '--input-type=module', '-e', code ], { timeout: 10e3 }, (_, stdout, stderr) => {
		resolve({ stdout, stderr, status: child.exitCode, signal: child.signalCode })
	})
})

const hasAudio = sdl.audio.isAvailable()
const hasPlayback = hasAudio && sdl.audio.playback.devices.length > 1

T.test("sdl::worker module", async (t) => {
	const [ result ] = await runWorker(`
		send({
			keys: Object.keys(sdl),
			audioKeys: Object.keys(sdl.audio),
			initialized: require(${JSON.stringify(globalsPath)}).initialized,
			bytesPerSample: sdl.audio.bytesPerSample('s16'),
			bytesPerPixel: sdl.video.bytesPerPixel('rgba32'),
			numScancodes: Object.keys(sdl.keyboard.SCANCODE).length,
			power: Object.keys(sdl.power.info),
			video: [
				attempt(() => sdl.video.createWindow()),
				attempt(() => sdl.video.displays),
				attempt(() => sdl.video.drivers),
				attempt(() => sdl.video.on('displayAdd', () => {})),
				attempt(() => sdl.keyboard.getState()),
				attempt(() => sdl.mouse.position),
				attempt(() => sdl.touch.devices),
				attempt(() => sdl.clipboard.text),
			],
			windows: sdl.video.windows,
		})
	`)

	t.equal(result.keys, Object.keys(sdl))
	t.equal(result.audioKeys, Object.keys(sdl.audio))
	t.equal(result.initialized.video, null)
	t.equal(result.bytesPerSample, 2)
	t.equal(result.bytesPerPixel, 4)
	t.equal(result.numScancodes, Object.keys(sdl.keyboard.SCANCODE).length)
	t.equal(result.power, [ 'state', 'seconds', 'percent' ])
	t.equal(result.video, new Array(8).fill(MAIN_THREAD_ONLY))
	t.equal(result.windows, [])
})

T.test("sdl::worker looks up devices by id", async (t) => {
	if (!hasAudio) { return }

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
	if (!hasPlayback) {
		console.warn("NO AUDIO PLAYBACK FOUND")
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

T.test("sdl::worker streams are released on terminate", async (t) => {
	if (!hasPlayback) {
		console.warn("NO AUDIO PLAYBACK FOUND")
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

T.test("sdl::worker devices", async (t) => {
	if (!hasAudio) { return }

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
		const { worker, nextMessage } = startWorker(`
			const stream = sdl.audio.playback.openDevice(null, { channels: 1, buffered: 256 })
			stream.on('drain', () => { stream.putData(Buffer.alloc(256 * 4)) })
			stream.play()
			send(stream.id)
			setInterval(() => {}, 1e3)
		`)
		const id = await nextMessage()
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

T.test("sdl::worker can import first", async (t) => {
	t.timeout(10e3)

	const { stdout, status } = await runProcess(`
		import { Worker } from 'node:worker_threads'
		import { createRequire } from 'node:module'
		const require = createRequire(import.meta.url)
		const attempt = (fn) => { try { fn(); return null } catch (error) { return error.message } }
		const worker = new Worker(${JSON.stringify(`
			${prelude}
			const open = () => { sdl.audio.playback.openDevice().close() }
			send({ before: attempt(open), video: attempt(() => sdl.video.createWindow()) })
			parentPort.once('message', () => {
				send({ after: attempt(open), audio: sdl.audio.isAvailable() })
			})
		`)}, { eval: true, execArgv: [] })
		worker.once('message', (beforeMain) => {
			const sdl = require(${JSON.stringify(indexPath)})
			const onMain = attempt(() => sdl.video.displays)
			worker.postMessage('go')
			worker.once('message', (afterMain) => {
				console.log(JSON.stringify({ beforeMain, onMain, afterMain, audio: require(${JSON.stringify(globalsPath)}).initialized.audio }))
			})
		})
	`)

	t.equal(status, 0)
	t.equal(JSON.parse(stdout), {
		beforeMain: { before: NOT_STARTED, video: MAIN_THREAD_ONLY },
		onMain: null,
		afterMain: { after: null, audio: true },
		audio: null,
	})
})

T.test("sdl::worker needs the main thread", async (t) => {
	t.timeout(10e3)

	const { stdout, status } = await runProcess(`
		import { Worker } from 'node:worker_threads'
		const run = () => new Promise((resolve) => {
			const worker = new Worker(${JSON.stringify(`
				${prelude}
				send([
					attempt(() => sdl.audio.playback.devices),
					attempt(() => sdl.joystick.devices),
					attempt(() => sdl.power.info),
					sdl.audio.bytesPerSample('s16'),
				])
			`)}, { eval: true, execArgv: [] })
			worker.once('message', resolve)
		})
		console.log(JSON.stringify([ await run(), await run(), await run() ]))
	`)

	t.equal(status, 0)
	const results = JSON.parse(stdout)
	t.equal(results, new Array(3).fill([ NOT_STARTED, NOT_STARTED, null, 2 ]))
})

T.test("sdl::worker survives main thread exit", async (t) => {
	t.timeout(30e3)

	for (let i = 0; i < 3; i++) {
		const { status, signal } = await runProcess(`
			import sdl from ${JSON.stringify(indexPath)}
			import { Worker } from 'node:worker_threads'
			new Worker(${JSON.stringify(`
				${prelude}
				const stream = sdl.audio.playback.openDevice()
				stream.play()
				const buffer = Buffer.alloc(4800 * 4)
				const loop = () => {
					try { stream.putData(buffer) }
					catch (_) {}
					setImmediate(loop)
				}
				loop()
				send('running')
			`)}, { eval: true, execArgv: [] }).once('message', () => { setTimeout(() => { process.exit(0) }, 50) })
		`)
		t.equal(signal, null)
		t.equal(status, 0)
	}
})

T.test("sdl::worker audio device events", async (t) => {
	t.timeout(5e3)

	if (!hasPlayback) {
		console.warn("NO AUDIO PLAYBACK FOUND")
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

T.test("sdl::worker drains device events synchronously", async (t) => {
	t.timeout(5e3)

	if (!hasPlayback) {
		console.warn("NO AUDIO PLAYBACK FOUND")
		return
	}

	const real = sdl.audio.playback.devices[1]

	const { nextMessage, exited } = startWorker(`
		const before = sdl.audio.playback.devices.length
		send('ready')
		const start = Date.now()
		while (Date.now() - start < 500) {}
		send({ before, after: sdl.audio.playback.devices.length })
	`)

	t.equal(await nextMessage(), 'ready')
	Bindings.testing_pushAudioDeviceEvent('remove', real.id, false)
	t.ok(sdl.audio.playback.devices.length > 0)

	const result = await nextMessage()
	await exited

	t.equal(result.after, result.before - 1)

	Bindings.testing_pushAudioDeviceEvent('add', real.id, false)
	t.equal(sdl.audio.playback.devices.at(-1).id, real.id)
})

T.test("sdl::worker device listeners keep the worker alive", async (t) => {
	t.timeout(5e3)

	if (!hasAudio) { return }

	const start = Date.now()
	await runWorker(`
		const listener = () => {}
		sdl.audio.playback.on('deviceAdd', listener)
		setTimeout(() => { sdl.audio.playback.off('deviceAdd', listener) }, 300).unref()
	`)
	t.ok(Date.now() - start >= 300)
})

T.test("sdl::worker device listeners don't keep the main thread alive", async (t) => {
	t.timeout(10e3)

	const { status, stdout } = await runProcess(`
		import sdl from ${JSON.stringify(indexPath)}
		import { Worker } from 'node:worker_threads'
		new Worker(${JSON.stringify(`
			${prelude}
			const listener = () => {}
			sdl.audio.playback.on('deviceAdd', listener)
			setTimeout(() => { sdl.audio.playback.off('deviceAdd', listener) }, 300).unref()
		`)}, { eval: true, execArgv: [] }).on('exit', () => { console.log('worker exited') })
	`)
	t.equal(status, 0)
	t.equal(stdout.trim(), 'worker exited')
})

const countPolls = async (duration) => {
	const original = Bindings[EVENTS_POLL]
	let count = 0
	Bindings[EVENTS_POLL] = (...args) => {
		count++
		return original(...args)
	}
	await new Promise((resolve) => { setTimeout(resolve, duration) })
	Bindings[EVENTS_POLL] = original
	return count
}

T.test("sdl::worker makes the main thread poll fast while it runs", async (t) => {
	t.timeout(10e3)

	if (!hasAudio) { return }

	const { worker, nextMessage, exited } = startWorker(`
		const listener = () => {}
		sdl.audio.playback.on('deviceAdd', listener)
		send('listening')
		parentPort.once('message', () => {
			sdl.audio.playback.off('deviceAdd', listener)
		})
	`)

	t.equal(await nextMessage(), 'listening')
	await new Promise((resolve) => { setTimeout(resolve, 100) })
	const fast = await countPolls(300)

	worker.postMessage('stop')
	await exited
	await new Promise((resolve) => { setTimeout(resolve, 1.5e3) })
	const slow = await countPolls(300)

	t.ok(fast > 20)
	t.ok(slow <= 1)
})

T.test("sdl::worker initializes joystick, gamepad, and sensor through the main thread", async (t) => {
	t.timeout(10e3)

	const { stdout, status } = await runProcess(`
		import sdl from ${JSON.stringify(indexPath)}
		import { Worker } from 'node:worker_threads'
		import { createRequire } from 'node:module'
		const { initialized } = createRequire(import.meta.url)(${JSON.stringify(globalsPath)})
		const before = [ initialized.joystick, initialized.gamepad, initialized.sensor ]
		const worker = new Worker(${JSON.stringify(`
			${prelude}
			send([
				Array.isArray(sdl.joystick.devices),
				Array.isArray(sdl.gamepad.devices),
				Array.isArray(sdl.sensor.devices),
			])
		`)}, { eval: true, execArgv: [] })
		worker.once('message', (inWorker) => {
			const after = [ initialized.joystick, initialized.gamepad, initialized.sensor ]
			console.log(JSON.stringify({ before, inWorker, after }))
		})
	`)

	t.equal(status, 0)
	t.equal(JSON.parse(stdout), {
		before: [ null, null, null ],
		inWorker: [ true, true, true ],
		after: [ null, null, null ],
	})
})

const pollEvents = () => sdl.gamepad.devices

const attachVirtual = (isGamepad) => {
	pollEvents()
	const id = Bindings.testing_attachVirtualJoystick(isGamepad)
	pollEvents()
	return id
}

T.test("sdl::worker gamepad events", async (t) => {
	t.timeout(10e3)

	const id = attachVirtual(true)

	const { nextMessage, exited } = startWorker(`
		const device = sdl.gamepad.devices.find(({ id }) => id === workerData.id)
		const gamepad = sdl.gamepad.openDevice(device)
		gamepad.on('buttonDown', (event) => {
			send({ event, leftStickX: gamepad.axes.leftStickX, south: gamepad.buttons.south })
		})
		gamepad.on('close', () => { send('close') })
		sdl.gamepad.on('deviceRemove', (event) => {
			send({ removed: event.device === device, devices: sdl.gamepad.devices.length })
			sdl.gamepad.removeAllListeners()
		})
		send(gamepad.device === device)
	`, { id })

	t.equal(await nextMessage(), true)

	Bindings.testing_setVirtualJoystickAxis(id, 0, 32767)
	Bindings.testing_setVirtualJoystickButton(id, 0, true)

	t.equal(await nextMessage(), {
		event: { type: 'buttonDown', button: 'south' },
		leftStickX: 1,
		south: true,
	})

	Bindings.testing_detachVirtualJoystick(id)

	t.equal(await nextMessage(), 'close')
	t.equal(await nextMessage(), { removed: true, devices: sdl.gamepad.devices.length })
	await exited
})

T.test("sdl::worker looks up joysticks, gamepads, and sensors by id", async (t) => {
	t.timeout(10e3)

	const id = attachVirtual(true)

	const [ result ] = await runWorker(`
		const bindsTo = (module, device) => {
			const local = module.devices
			const instance = module.openDevice(device)
			const index = local.indexOf(instance.device)
			instance.close()
			return index
		}
		const errors = (module) => [
			attempt(() => module.openDevice('a')),
			attempt(() => module.openDevice({ id: -1 })),
		]
		const joystickIndex = sdl.joystick.devices.findIndex(({ id }) => id === workerData.id)
		const gamepadIndex = sdl.gamepad.devices.findIndex(({ id }) => id === workerData.id)
		send({
			joystick: [ bindsTo(sdl.joystick, { id: workerData.id }), bindsTo(sdl.joystick, workerData.joystick), joystickIndex ],
			gamepad: [ bindsTo(sdl.gamepad, { id: workerData.id }), bindsTo(sdl.gamepad, workerData.gamepad), gamepadIndex ],
			errors: [ errors(sdl.joystick), errors(sdl.gamepad), errors(sdl.sensor) ],
		})
	`, {
		id,
		joystick: sdl.joystick.devices.find((x) => x.id === id),
		gamepad: sdl.gamepad.devices.find((x) => x.id === id),
	})

	Bindings.testing_detachVirtualJoystick(id)

	t.ok(result.joystick[2] !== -1)
	t.equal(result.joystick, new Array(3).fill(result.joystick[2]))
	t.ok(result.gamepad[2] !== -1)
	t.equal(result.gamepad, new Array(3).fill(result.gamepad[2]))
	t.equal(result.errors, [ 'joystick', 'gamepad', 'sensor' ].map((name) => [
		"device must be an object",
		`device must be from sdl.${name}.devices`,
	]))
})

T.test("sdl::worker joystick events", async (t) => {
	t.timeout(10e3)

	const id = attachVirtual(false)

	const { nextMessage, exited } = startWorker(`
		const device = sdl.joystick.devices.find(({ id }) => id === workerData.id)
		const joystick = sdl.joystick.openDevice(device)
		joystick.on('axisMotion', (event) => {
			if (event.value !== 1) { return }
			send({ event, axes: joystick.axes })
			joystick.close()
		})
		send('open')
	`, { id })

	t.equal(await nextMessage(), 'open')
	Bindings.testing_setVirtualJoystickAxis(id, 1, 32767)

	t.equal(await nextMessage(), {
		event: { type: 'axisMotion', axis: 1, value: 1 },
		axes: [ 0, 1 ],
	})
	await exited

	Bindings.testing_detachVirtualJoystick(id)
})

T.test("sdl::worker instances are released on terminate", async (t) => {
	t.timeout(10e3)

	const id = attachVirtual(false)

	const { worker, nextMessage, exited } = startWorker(`
		const device = sdl.joystick.devices.find(({ id }) => id === workerData.id)
		sdl.joystick.openDevice(device)
		send('open')
		parentPort.once('message', () => {})
	`, { id })
	t.equal(await nextMessage(), 'open')

	await worker.terminate()
	await exited

	const device = sdl.joystick.devices.find((x) => x.id === id)
	const joystick = sdl.joystick.openDevice(device)
	joystick.close()

	Bindings.testing_detachVirtualJoystick(id)
})

T.test("sdl::worker player changes reach other threads", async (t) => {
	t.timeout(10e3)

	const id = attachVirtual(false)
	const device = sdl.joystick.devices.find((x) => x.id === id)
	const joystick = sdl.joystick.openDevice(device)

	const { worker, nextMessage, exited } = startWorker(`
		const device = sdl.joystick.devices.find(({ id }) => id === workerData.id)
		const joystick = sdl.joystick.openDevice(device)
		send(device.player)
		parentPort.on('message', (message) => {
			if (message === 'read') {
				send(sdl.joystick.devices.find(({ id }) => id === workerData.id).player)
				return
			}
			joystick.setPlayer(message)
			send('set')
		})
	`, { id })

	t.equal(await nextMessage(), device.player)

	joystick.setPlayer(3)
	worker.postMessage('read')
	t.equal(await nextMessage(), 3)

	worker.postMessage(5)
	t.equal(await nextMessage(), 'set')
	await new Promise((resolve) => { setTimeout(resolve, 50) })
	pollEvents()
	t.equal(device.player, 5)

	await worker.terminate()
	await exited
	joystick.close()
	Bindings.testing_detachVirtualJoystick(id)
})

T.test("sdl::worker getters make the main thread poll fast", async (t) => {
	t.timeout(10e3)

	const id = attachVirtual(false)

	const { worker, nextMessage, exited } = startWorker(`
		const device = sdl.joystick.devices.find(({ id }) => id === workerData.id)
		const joystick = sdl.joystick.openDevice(device)
		joystick.axes
		send('open')
		parentPort.once('message', () => {
			const start = Date.now()
			const interval = setInterval(() => {
				if (joystick.axes[0] !== 1 && Date.now() - start < 3e3) { return }
				clearInterval(interval)
				send(Date.now() - start)
				joystick.close()
			}, 5)
		})
	`, { id })

	t.equal(await nextMessage(), 'open')
	Bindings.testing_setVirtualJoystickAxis(id, 0, 32767)
	worker.postMessage('go')

	t.ok(await nextMessage() < 100)
	await exited

	Bindings.testing_detachVirtualJoystick(id)
})
