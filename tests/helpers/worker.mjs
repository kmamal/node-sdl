import Path from 'node:path'
import { Worker } from 'node:worker_threads'
import { execFile } from 'node:child_process'

export const indexPath = Path.join(import.meta.dirname, '../../src/javascript/index.js')

export const globalsPath = Path.join(import.meta.dirname, '../../src/javascript/globals.js')

export const MAIN_THREAD_ONLY = "the video subsystem is only available on the main thread"

export const NOT_STARTED = "@kmamal/sdl must be imported on the main thread before it can be used in a worker"

export const prelude = `
	const sdl = require(${JSON.stringify(indexPath)})
	const { parentPort, workerData } = require('node:worker_threads')
	const send = (x) => parentPort.postMessage(x)
	const attempt = (fn) => { try { fn(); return null } catch (error) { return error.message } }
`

const spawnWorker = (body, workerData) => new Worker(`
	${prelude}
	;(async () => { ${body} })().catch((error) => { send({ error: error.message }) })
`, { eval: true, workerData })

export const runWorker = (body, workerData) => new Promise((resolve, reject) => {
	const worker = spawnWorker(body, workerData)
	const messages = []
	worker.on('message', (message) => { messages.push(message) })
	worker.on('error', reject)
	worker.on('exit', () => { resolve(messages) })
})

export const startWorker = (body, workerData) => {
	const worker = spawnWorker(body, workerData)
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

export const runProcess = (code) => new Promise((resolve) => {
	const child = execFile(process.execPath, [ '--input-type=module', '-e', code ], { timeout: 10e3 }, (_, stdout, stderr) => {
		resolve({ stdout, stderr, status: child.exitCode, signal: child.signalCode })
	})
})
