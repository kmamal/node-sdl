import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import VideoEvents from '../../src/javascript/video/events.js'
import Globals from '../../src/javascript/globals.js'
import { sleep } from '../helpers/wait.mjs'

const { handleWindowEvent, handleDisplayEvent } = VideoEvents

const withWindow = async (options, callback) => {
	const window = sdl.video.createWindow({ visible: false, ...options })
	const events = []
	const listener = (type, event) => { events.push({ ...event, type }) }
	window.on('*', listener)
	try { return await callback(window, events) }
	finally {
		if (!window.destroyed) {
			window.off('*', listener)
			window.destroy()
		}
	}
}

T.test("sdl::window initial events", async (t) => {
	const window = sdl.video.createWindow({ width: 200, height: 150 })
	const events = []
	const listener = (type, event) => { events.push({ ...event, type }) }
	window.on('*', listener)
	try {
		await sleep(0)
		const types = events.map((e) => e.type)
		t.ok(types.includes('move'))
		t.ok(types.includes('resize'))
		t.ok(types.includes('expose'))
		const resize = events.find((e) => e.type === 'resize')
		t.equal(resize.width, 200)
		t.equal(resize.height, 150)
	}
	finally {
		window.off('*', listener)
		window.destroy()
	}

	const hidden = sdl.video.createWindow({ visible: false })
	const hiddenEvents = []
	const hiddenListener = (type) => { hiddenEvents.push(type) }
	hidden.on('*', hiddenListener)
	try {
		await sleep(0)
		t.ok(hiddenEvents.includes('move'))
		t.ok(!hiddenEvents.includes('expose'))
	}
	finally {
		hidden.off('*', hiddenListener)
		hidden.destroy()
	}

	const destroyedEarly = sdl.video.createWindow({ visible: false })
	const earlyEvents = []
	destroyedEarly.on('*', (type) => { earlyEvents.push(type) })
	destroyedEarly.destroy()
	await sleep(0)
	t.equal(earlyEvents, [ 'close' ])
})

T.test("sdl::window state events", async (t) => {
	await withWindow({}, (window, events) => {
		const id = window.id

		handleWindowEvent({ type: 'move', x: 7, y: 8 }, id)
		t.equal([ window.x, window.y ], [ 7, 8 ])
		t.equal(events.at(-1), { type: 'move', x: 7, y: 8 })

		const size = { width: 101, height: 102, pixelWidth: 203, pixelHeight: 204 }
		handleWindowEvent({ type: 'resize', ...size }, id)
		t.equal([ window.width, window.height, window.pixelWidth, window.pixelHeight ], [ 101, 102, 203, 204 ])
		t.equal(events.at(-1), { type: 'resize', ...size })
		const count = events.length
		handleWindowEvent({ type: 'resize', ...size }, id)
		t.equal(events.length, count)
		handleWindowEvent({ type: 'resize', ...size, pixelWidth: 202 }, id)
		t.equal(events.length, count + 1)
		t.equal(window.pixelWidth, 202)

		handleWindowEvent({ type: 'show' }, id)
		t.equal(window._visible, true)
		handleWindowEvent({ type: 'hide' }, id)
		t.equal(window._visible, false)
		handleWindowEvent({ type: 'expose' }, id)
		t.equal(events.at(-1).type, 'expose')

		handleWindowEvent({ type: 'maximize' }, id)
		t.equal([ window._minimized, window._maximized ], [ false, true ])
		handleWindowEvent({ type: 'minimize' }, id)
		t.equal([ window._minimized, window._maximized ], [ true, false ])
		handleWindowEvent({ type: 'restore' }, id)
		t.equal([ window._minimized, window._maximized ], [ false, false ])

		const before = events.length
		handleWindowEvent({ type: 'enterFullscreen' }, id)
		t.equal(window._fullscreen, true)
		handleWindowEvent({ type: 'leaveFullscreen' }, id)
		t.equal(window._fullscreen, false)
		t.equal(events.length, before)

		const display = sdl.video.displays[0] ?? null
		handleWindowEvent({ type: 'displayChange', displayId: display?.id ?? -1 }, id)
		t.equal(events.at(-1), { type: 'displayChange', display })
		handleWindowEvent({ type: 'displayChange', displayId: -1 }, id)
		t.equal(events.at(-1).display, null)
		t.equal(window.display, null)
	})
})

T.test("sdl::window focus and hover events", async (t) => {
	await withWindow({}, async (window1, events1) => {
		await withWindow({}, (window2) => {
			const prevFocused = Globals.windows.focused
			const prevHovered = Globals.windows.hovered
			try {
				handleWindowEvent({ type: 'focus' }, window1.id)
				t.equal(Globals.windows.focused, window1)
				t.equal(events1.at(-1).type, 'focus')
				handleWindowEvent({ type: 'blur' }, window2.id)
				t.equal(Globals.windows.focused, window1)
				handleWindowEvent({ type: 'focus' }, window2.id)
				t.equal(Globals.windows.focused, window2)
				handleWindowEvent({ type: 'blur' }, window1.id)
				t.equal(Globals.windows.focused, window2)
				handleWindowEvent({ type: 'blur' }, window2.id)
				t.equal(Globals.windows.focused, null)

				handleWindowEvent({ type: 'hover' }, window1.id)
				t.equal(Globals.windows.hovered, window1)
				t.equal(window1.hovered, true)
				t.equal(sdl.video.hovered, window1)
				handleWindowEvent({ type: 'leave' }, window2.id)
				t.equal(Globals.windows.hovered, window1)
				handleWindowEvent({ type: 'leave' }, window1.id)
				t.equal(Globals.windows.hovered, null)
				t.equal(events1.at(-1).type, 'leave')

				handleWindowEvent({ type: 'hover' }, window2.id)
				handleWindowEvent({ type: 'focus' }, window2.id)
				window2.destroy()
				t.equal(Globals.windows.hovered, null)
				t.equal(Globals.windows.focused, null)
			}
			finally {
				Globals.windows.focused = prevFocused
				Globals.windows.hovered = prevHovered
			}
		})
	})
})

T.test("sdl::window close events", async (t) => {
	await withWindow({}, (window, events) => {
		let prevented = 0
		const prevent = (event) => {
			prevented++
			event.prevent()
		}
		window.on('beforeClose', prevent)
		handleWindowEvent({ type: 'close' }, window.id)
		t.equal(prevented, 1)
		t.equal(window.destroyed, false)
		t.ok(events.some((e) => e.type === 'beforeClose'))
		window.off('beforeClose', prevent)

		handleWindowEvent({ type: 'close' }, window.id)
		t.equal(window.destroyed, true)
		t.equal(events.at(-1).type, 'close')
		t.ok(!sdl.video.windows.includes(window))

		const count = events.length
		handleWindowEvent({ type: 'close' }, window.id)
		handleWindowEvent({ type: 'move', x: 1, y: 2 }, window.id)
		t.equal(events.length, count)
	})

	await withWindow({}, (window, events) => {
		window.on('beforeClose', () => { window.destroy() })
		window.destroyGently()
		t.equal(window.destroyed, true)
		t.equal(events.filter((e) => e.type === 'close').length, 1)
	})

	await withWindow({}, (window) => {
		const errors = []
		window.on('beforeClose', () => { throw new Error("boom") })
		window.on('error', (error) => { errors.push(error.message) })
		window.destroyGently()
		t.equal(errors, [ "boom" ])
		t.equal(window.destroyed, true)
	})
})

T.test("sdl::window close event listener can't keep the window", async (t) => {
	await withWindow({}, async (window) => {
		const closes = []
		window.on('close', () => { closes.push(window.destroyed) })
		window.destroy()
		t.equal(closes, [ true ])
		t.throws(() => { window.destroy() })
		await sleep(0)
		t.throws(() => { window.on('move', () => {}) })
	})
})

T.test("sdl::window renderDeviceLost restores the renderer", async (t) => {
	await withWindow({}, (window, events) => {
		const count = events.length
		handleWindowEvent({ type: 'renderDeviceLost' }, window.id)
		t.equal(events.length, count)
		t.equal(window.accelerated, true)
		t.equal(window.vsync, 1)
		t.throwsNot(() => {
			const buffer = Buffer.alloc(4 * 4 * 4)
			window.render(4, 4, 16, 'rgba32', buffer)
		})
	})
})

T.test("sdl::window key events", async (t) => {
	await withWindow({}, (window, events) => {
		handleWindowEvent({ type: 'keyDown', key: 'A', scancode: 4 }, window.id)
		t.equal(events.at(-1).key, 'a')
		handleWindowEvent({ type: 'keyUp', key: 'AC Back', scancode: 0 }, window.id)
		t.equal(events.at(-1).key, 'back')
		handleWindowEvent({ type: 'keyDown', key: 'é', scancode: 0 }, window.id)
		t.equal(events.at(-1).key, 'é')
		handleWindowEvent({ type: 'keyDown', key: 'NotAKey', scancode: 0 }, window.id)
		t.equal(events.at(-1).key, null)
		handleWindowEvent({ type: 'keyDown', key: null, scancode: 0 }, window.id)
		t.equal(events.at(-1).key, null)
	})
})

T.test("sdl::window finger events", async (t) => {
	await withWindow({}, (window, events) => {
		for (const type of [ 'fingerDown', 'fingerMove', 'fingerUp', 'fingerCancel' ]) {
			handleWindowEvent({ type, touchId: 0, mouse: true, pen: false, x: 1, y: 2 }, window.id)
			t.equal(events.at(-1), { type, mouse: true, pen: false, x: 1, y: 2, device: null })
		}

		handleWindowEvent({ type: 'fingerDown', touchId: 0, mouse: false, pen: true }, window.id)
		t.equal(events.at(-1).device, null)

		const count = events.length
		handleWindowEvent({ type: 'fingerDown', touchId: -12345, mouse: false, pen: false }, window.id)
		t.equal(events.length, count)

		const fake = { id: -12345, name: 'fake', type: 'direct' }
		const prev = Globals.touchDevices
		Globals.touchDevices = [ ...prev, fake ]
		try {
			handleWindowEvent({ type: 'fingerDown', touchId: -12345, mouse: false, pen: false }, window.id)
			t.equal(events.at(-1).device, fake)
			t.ok(!('touchId' in events.at(-1)))
		}
		finally { Globals.touchDevices = prev }
	})
})

T.test("sdl::window pass-through events", async (t) => {
	await withWindow({}, (window, events) => {
		const passThrough = [
			{ type: 'textInput', text: 'x' },
			{ type: 'mouseButtonDown', button: 1, x: 0, y: 0 },
			{ type: 'mouseButtonUp', button: 1, x: 0, y: 0 },
			{ type: 'mouseMove', x: 3, y: 4 },
			{ type: 'mouseWheel', dx: 0, dy: 1 },
			{ type: 'dropBegin' },
			{ type: 'dropText', text: 'y' },
			{ type: 'dropFile', file: '/tmp/z' },
			{ type: 'dropComplete' },
		]
		for (const event of passThrough) {
			handleWindowEvent({ ...event }, window.id)
			t.equal(events.at(-1), event)
		}
	})
})

T.test("sdl::window listener errors go to the error event", async (t) => {
	await withWindow({}, (window) => {
		const errors = []
		const failing = () => { throw new Error("boom") }
		const onError = (error) => { errors.push(error.message) }
		window.on('mouseMove', failing)
		window.on('error', onError)
		try {
			handleWindowEvent({ type: 'mouseMove', x: 0, y: 0 }, window.id)
			t.equal(errors, [ "boom" ])
		}
		finally {
			window.off('mouseMove', failing)
			window.off('error', onError)
		}
	})
})

T.test("sdl::video display events", (t) => {
	const template = sdl.video.displays[0] ?? {
		name: 'none',
		format: 'xrgb8888',
		frequency: 60,
		geometry: { x: 0, y: 0, width: 1, height: 1 },
		usable: { x: 0, y: 0, width: 1, height: 1 },
		scale: 1,
		orientation: null,
	}
	const makeDisplay = (overrides) => ({
		...structuredClone(template),
		id: -777,
		name: 'fake',
		...overrides,
	})

	const events = []
	const listener = (type, event) => { events.push({ ...event, type }) }
	sdl.video.on('*', listener)
	const before = [ ...Globals.displays ]
	try {
		const fresh = makeDisplay()
		handleDisplayEvent({ type: 'displayAdd', display: fresh })
		const display = sdl.video.displays.find((d) => d.id === -777)
		t.equal(display, fresh)
		t.equal(events.at(-1), { type: 'displayAdd', device: display })

		const count = events.length
		handleDisplayEvent({ type: 'displayAdd', display: makeDisplay() })
		t.equal(events.length, count)
		t.equal(sdl.video.displays.filter((d) => d.id === -777).length, 1)

		handleDisplayEvent({ type: 'displayOrient', displayId: -777, orientation: 'portrait' })
		t.equal(display.orientation, 'portrait')
		t.equal(events.at(-1), { type: 'displayOrient', orientation: 'portrait', device: display })

		const moved = makeDisplay({
			geometry: { x: 11, y: 12, width: 1, height: 1 },
			usable: { x: 13, y: 14, width: 1, height: 1 },
		})
		handleDisplayEvent({ type: 'displayMove', displayId: -777, display: moved })
		t.equal(sdl.video.displays.find((d) => d.id === -777), display)
		t.equal([ display.geometry.x, display.geometry.y, display.usable.x, display.usable.y ], [ 11, 12, 13, 14 ])
		t.equal(events.at(-1), { type: 'displayMove', device: display })

		handleDisplayEvent({ type: 'displayScaleChange', displayId: -777, display: makeDisplay({ scale: 2.5 }) })
		t.equal(sdl.video.displays.find((d) => d.id === -777), display)
		t.equal(display.scale, 2.5)
		t.equal(events.at(-1), { type: 'displayScaleChange', device: display, scale: 2.5 })

		const geometry = { x: 0, y: 0, width: 123, height: 456 }
		handleDisplayEvent({ type: 'displayModeChange', displayId: -777, display: makeDisplay({ frequency: 144, geometry }) })
		t.equal(display.frequency, 144)
		t.equal(events.at(-1), {
			type: 'displayModeChange',
			device: display,
			format: display.format,
			frequency: 144,
			geometry,
		})

		const usable = { x: 1, y: 2, width: 3, height: 4 }
		handleDisplayEvent({ type: 'displayUsableChange', displayId: -777, display: makeDisplay({ usable }) })
		t.equal(display.usable, usable)
		t.equal(events.at(-1), { type: 'displayUsableChange', device: display })

		const count2 = events.length
		handleDisplayEvent({ type: 'displayOrient', displayId: -888, orientation: 'landscape' })
		handleDisplayEvent({ type: 'displayMove', displayId: -888, display: makeDisplay() })
		handleDisplayEvent({ type: 'displayScaleChange', displayId: -888, display: makeDisplay() })
		handleDisplayEvent({ type: 'displayRemove', displayId: -888 })
		t.equal(events.length, count2)

		handleDisplayEvent({ type: 'displayRemove', displayId: -777 })
		t.equal(events.at(-1), { type: 'displayRemove', device: display })
		t.ok(!sdl.video.displays.includes(display))

		const partial = makeDisplay({ format: null, frequency: null, geometry: null, usable: null })
		handleDisplayEvent({ type: 'displayAdd', display: partial })
		t.equal(sdl.video.displays.find((d) => d.id === -777), partial)
		const recovered = makeDisplay({
			geometry: { x: 1, y: 2, width: 5, height: 6 },
			usable: { x: 3, y: 4, width: 5, height: 6 },
		})
		handleDisplayEvent({ type: 'displayMove', displayId: -777, display: recovered })
		t.equal(partial.geometry, { x: 1, y: 2, width: 5, height: 6 })
		t.equal(partial.usable, { x: 3, y: 4, width: 5, height: 6 })
		handleDisplayEvent({ type: 'displayMove', displayId: -777, display: makeDisplay({ geometry: null, usable: null }) })
		t.equal([ partial.geometry, partial.usable ], [ null, null ])
		t.equal(events.at(-1), { type: 'displayMove', device: partial })
		handleDisplayEvent({ type: 'displayModeChange', displayId: -777, display: makeDisplay({ geometry: null }) })
		t.equal(events.at(-1).geometry, null)
		handleDisplayEvent({ type: 'displayRemove', displayId: -777 })
	}
	finally {
		sdl.video.off('*', listener)
		Globals.displays.splice(0, Globals.displays.length, ...before)
	}
})

T.test("sdl::video.createWindow with a display", (t) => {
	const [ display ] = sdl.video.displays
	if (!display) { return }

	const window = sdl.video.createWindow({ display, visible: false })
	try {
		t.equal(window.display, display)
	}
	finally { window.destroy() }

	t.throws(() => { sdl.video.createWindow({ display: { ...display }, visible: false }) })
	t.throws(() => { sdl.video.createWindow({ display, x: 0, visible: false }) })
	t.throws(() => { sdl.video.createWindow({ display, y: 0, visible: false }) })
	t.throws(() => { sdl.video.createWindow({ display: 1, visible: false }) })
})
