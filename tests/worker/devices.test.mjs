import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import { pollEvents, withVirtual } from '../helpers/virtual.mjs'
import { sleep } from '../helpers/wait.mjs'
import { runWorker, startWorker } from '../helpers/worker.mjs'

T.test("sdl::worker looks up joysticks, gamepads, and sensors by id", async (t) => {
	t.timeout(10e3)

	await withVirtual(true, async (virtual) => {
		const { id } = virtual

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

		virtual.detach()

		t.ok(result.joystick[2] !== -1)
		t.equal(result.joystick, new Array(3).fill(result.joystick[2]))
		t.ok(result.gamepad[2] !== -1)
		t.equal(result.gamepad, new Array(3).fill(result.gamepad[2]))
		t.equal(result.errors, [ 'joystick', 'gamepad', 'sensor' ].map((name) => [
			"device must be an object",
			`device must be from sdl.${name}.devices`,
		]))
	})
})

T.test("sdl::worker joystick events", async (t) => {
	t.timeout(10e3)

	await withVirtual(false, async (virtual) => {
		const { id } = virtual

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
		virtual.setAxis(1, 32767)

		t.equal(await nextMessage(), {
			event: { type: 'axisMotion', axis: 1, value: 1 },
			axes: [ 0, 1 ],
		})
		await exited
	})
})

T.test("sdl::worker gamepad events", async (t) => {
	t.timeout(10e3)

	await withVirtual(true, async (virtual) => {
		const { id } = virtual

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

		virtual.setAxis(0, 32767)
		virtual.setButton(0, true)

		t.equal(await nextMessage(), {
			event: { type: 'buttonDown', button: 'south' },
			leftStickX: 1,
			south: true,
		})

		virtual.detach()

		t.equal(await nextMessage(), 'close')
		t.equal(await nextMessage(), { removed: true, devices: sdl.gamepad.devices.length })
		await exited
	})
})

T.test("sdl::worker getters make the main thread poll fast", async (t) => {
	t.timeout(10e3)

	await withVirtual(false, async (virtual) => {
		const { id } = virtual

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
		virtual.setAxis(0, 32767)
		worker.postMessage('go')

		t.ok(await nextMessage() < 100)
		await exited
	})
})

T.test("sdl::worker player changes reach other threads", async (t) => {
	t.timeout(10e3)

	await withVirtual(false, async (virtual) => {
		const { id } = virtual
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
		await sleep(50)
		pollEvents()
		t.equal(device.player, 5)

		await worker.terminate()
		await exited
		joystick.close()
	})
})

T.test("sdl::worker instances are released on terminate", async (t) => {
	t.timeout(10e3)

	await withVirtual(false, async (virtual) => {
		const { id } = virtual

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
	})
})
