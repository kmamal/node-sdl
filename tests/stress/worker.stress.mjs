import T from '@kmamal/testing'
import Bindings from '../../src/javascript/bindings.js'
import { hasAudio, hasPlayback, skip } from '../helpers/env.mjs'
import { sleep } from '../helpers/wait.mjs'
import { indexPath, prelude, runProcess, startWorker } from '../helpers/worker.mjs'


const EVENTS_POLL = 'events_poll'

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

T.test("sdl::worker terminated during drain", async (t) => {
	t.timeout(30e3)

	if (!hasPlayback()) {
		skip("no audio playback")
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
		await sleep(i % 5)
		await worker.terminate()
		t.throws(() => Bindings.audio_getQueued(id))
	}
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
					catch {}
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

T.test("sdl::worker makes the main thread poll fast while it runs", async (t) => {
	t.timeout(10e3)

	if (!hasAudio()) {
		skip("no audio")
		return
	}

	const { worker, nextMessage, exited } = startWorker(`
		const listener = () => {}
		sdl.audio.playback.on('deviceAdd', listener)
		send('listening')
		parentPort.once('message', () => {
			sdl.audio.playback.off('deviceAdd', listener)
		})
	`)

	t.equal(await nextMessage(), 'listening')
	await sleep(100)
	const fast = await countPolls(300)

	worker.postMessage('stop')
	await exited
	await sleep(1.5e3)
	const slow = await countPolls(300)

	t.ok(fast > 20)
	t.ok(slow <= 1)
})
