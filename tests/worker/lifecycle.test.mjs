import T from '@kmamal/testing'
import { hasAudio, hasPlayback, skip } from '../helpers/env.mjs'
import { indexPath, prelude, runProcess, runWorker } from '../helpers/worker.mjs'

T.test("sdl::worker stays alive while audio plays", async (t) => {
	t.timeout(5e3)

	if (!hasPlayback()) {
		skip("no audio playback")
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

T.test("sdl::worker device listeners keep the worker alive", async (t) => {
	t.timeout(5e3)

	if (!hasAudio()) {
		skip("no audio")
		return
	}

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
