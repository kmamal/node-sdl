import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import { globalsPath, indexPath, prelude, runProcess, runWorker, MAIN_THREAD_ONLY, NOT_STARTED } from '../helpers/worker.mjs'

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
		console.log(JSON.stringify(await run()))
	`)

	t.equal(status, 0)
	t.equal(JSON.parse(stdout), [ NOT_STARTED, NOT_STARTED, null, 2 ])
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
