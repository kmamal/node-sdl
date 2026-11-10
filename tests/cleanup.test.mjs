import T from '@kmamal/testing'
import { indexPath, runProcess } from './helpers/worker.mjs'

const bindingsPath = indexPath.replace(/index\.js$/u, 'bindings.js')

const openEverything = `
	import sdl from ${JSON.stringify(indexPath)}
	import Bindings from ${JSON.stringify(bindingsPath)}
	const opened = []
	if (sdl.video.isAvailable()) {
		const window = sdl.video.createWindow({ visible: false })
		window.on('close', () => { console.log('window closed') })
		opened.push('window')
	}
	sdl.gamepad.devices
	const id = Bindings.testing_attachVirtualJoystick(true)
	const joystick = sdl.joystick.openDevice(sdl.joystick.devices.find((d) => d.id === id))
	joystick.on('close', () => { console.log('joystick closed') })
	const gamepad = sdl.gamepad.openDevice(sdl.gamepad.devices.find((d) => d.id === id))
	gamepad.on('close', () => { console.log('gamepad closed') })
	opened.push('joystick', 'gamepad')
	if (sdl.audio.isAvailable() && sdl.audio.playback.devices.length > 0) {
		const stream = sdl.audio.playback.openDevice()
		stream.on('close', () => { console.log('stream closed') })
		opened.push('stream')
	}
	console.log(JSON.stringify(opened))
`

const parse = (stdout) => {
	const [ first, ...rest ] = stdout.trim().split('\n')
	return { opened: JSON.parse(first), closed: rest.map((line) => line.replace(/ closed$/u, '')) }
}

T.test("sdl::cleanup closes everything on a clean exit", async (t) => {
	t.timeout(10e3)

	const { stdout, stderr, status } = await runProcess(`
		${openEverything}
		process.exit(0)
	`)
	t.equal(status, 0)
	t.equal(stderr, '')
	const { opened, closed } = parse(stdout)
	t.equal(closed.sort(), opened.sort())
})

T.test("sdl::cleanup shuts down without closing on a non-zero exit", async (t) => {
	t.timeout(10e3)

	const { stdout, stderr, status } = await runProcess(`
		${openEverything}
		process.exit(3)
	`)
	t.equal(status, 3)
	t.equal(stderr, '')
	const { closed } = parse(stdout)
	t.equal(closed, [])
})

T.test("sdl::cleanup lets the process exit once everything is closed", async (t) => {
	t.timeout(10e3)

	const { stdout, status, signal } = await runProcess(`
		import sdl from ${JSON.stringify(indexPath)}
		import Bindings from ${JSON.stringify(bindingsPath)}
		sdl.gamepad.devices
		const id = Bindings.testing_attachVirtualJoystick(true)
		const gamepad = sdl.gamepad.openDevice(sdl.gamepad.devices.find((d) => d.id === id))
		gamepad.on('buttonDown', () => {})
		const window = sdl.video.isAvailable() ? sdl.video.createWindow({ visible: false }) : null
		sdl.joystick.on('deviceRemove', () => {})
		setTimeout(() => {
			window?.destroy()
			gamepad.close()
			sdl.joystick.removeAllListeners('deviceRemove')
			Bindings.testing_detachVirtualJoystick(id)
			console.log('done')
		}, 100)
	`)
	t.equal(signal, null)
	t.equal(status, 0)
	t.equal(stdout.trim(), 'done')
})
