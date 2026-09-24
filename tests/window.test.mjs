import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

const waitFor = async (predicate, timeout = 1000) => {
	const deadline = Date.now() + timeout
	while (!predicate()) {
		if (Date.now() > deadline) { return false }
		await new Promise((resolve) => { setTimeout(resolve, 20) })
	}
	return true
}

T.test("sdl::window", async (t) => {
	t.timeout(10e3)

	t.ok(Array.isArray(sdl.video.windows))
	t.equal(sdl.video.windows.length, 0)
	t.equal(sdl.video.focused, null)
	t.equal(sdl.video.hovered, null)

	t.equal(typeof sdl.video.createWindow, 'function')

	const window1 = sdl.video.createWindow()

	t.equal(sdl.video.windows.length, 1)
	t.equal(sdl.video.windows[0], window1)

	const window2 = sdl.video.createWindow({
		title: 'test2',
		x: 12,
		y: 23,
		width: 67,
		height: 78,
		visible: false,
		resizable: true,
		alwaysOnTop: true,
		accelerated: false,
		vsync: false,
	})

	t.equal(sdl.video.windows.length, 2)
	t.equal(sdl.video.windows[0], window1)
	t.equal(sdl.video.windows[1], window2)

	t.equal(typeof window1.id, 'number')
	t.equal(typeof window2.id, 'number')
	t.notEqual(window1.id, window2.id)

	t.equal(window1.title, '')
	t.equal(window2.title, 'test2')
	window1.setTitle('test1')
	t.equal(window1.title, 'test1')

	t.equal(typeof window1.x, 'number')
	t.equal(typeof window1.y, 'number')
	t.equal(window2.x, 12)
	t.equal(window2.y, 23)
	window1.setPosition(34, 56)
	t.equal(window1.x, 34)
	t.equal(window1.y, 56)

	t.equal(typeof window1.width, 'number')
	t.equal(typeof window1.height, 'number')
	t.equal(window2.width, 67)
	t.equal(window2.height, 78)
	window1.setSize(89, 90)
	t.equal(window1.width, 89)
	t.equal(window1.height, 90)

	t.equal(typeof window1.pixelWidth, 'number')
	t.equal(typeof window1.pixelHeight, 'number')

	t.equal(window1.visible, true)
	t.equal(window2.visible, false)
	window1.hide()
	t.equal(window1.visible, false)
	window1.show()
	t.equal(window1.visible, true)
	window1.show(false)
	t.equal(window1.visible, false)
	window1.show(true)
	t.equal(window1.visible, true)

	t.equal(window1.fullscreen, false)
	{
		const window3 = sdl.video.createWindow({ fullscreen: true })
		t.equal(window3.fullscreen, true)
		window3.destroy()
	}
	window1.setFullscreen(true)
	t.ok(await waitFor(() => window1.fullscreen))
	window1.setFullscreen(false)
	t.ok(await waitFor(() => !window1.fullscreen))

	t.equal(window1.resizable, false)
	t.equal(window2.resizable, true)
	window1.setResizable(true)
	t.equal(window1.resizable, true)
	window1.setResizable(false)
	t.equal(window1.resizable, false)

	t.equal(window1.borderless, false)
	{
		const window3 = sdl.video.createWindow({ borderless: true })
		t.equal(window3.borderless, true)
		window3.destroy()
	}
	window1.setBorderless(true)
	t.equal(window1.borderless, true)
	t.throws(() => { window1.setResizable(true) })
	t.throwsNot(() => { window1.setResizable(false) })
	window1.setBorderless(false)
	t.equal(window1.borderless, false)
	t.throws(() => { window2.setBorderless(true) })
	t.throwsNot(() => { window2.setBorderless(false) })
	t.equal(window2.resizable, true)
	t.equal(window2.borderless, false)

	t.equal(window1.alwaysOnTop, false)
	t.equal(window2.alwaysOnTop, true)

	t.equal(window1.accelerated, true)
	t.equal(window2.accelerated, false)
	window1.setAccelerated(false)
	t.equal(window1.accelerated, false)
	window1.setAccelerated(true)
	t.equal(window1.accelerated, true)

	t.equal(window1.vsync, true)
	// t.equal(window2.vsync, false) // TODO: set automatically to true
	window1.setVsync(false)
	t.equal(window1.vsync, false)
	window1.setVsync(true)
	t.equal(window1.vsync, true)

	t.equal(window1.opengl, false)
	t.equal(window1.webgpu, false)
	t.ok(Buffer.isBuffer(window1.native.handle))
	if (process.platform === 'linux') {
		t.ok([ 'x11', 'wayland' ].includes(window1.native.subsystem))
		t.equal(window1.native.handle.length, 24)
	}

	t.equal(window1.maximized, false)
	t.equal(window1.minimized, false)
	window1.setResizable(true)
	window1.maximize()
	if (await waitFor(() => window1.maximized)) {
		t.equal(window1.minimized, false)
		window1.restore()
		t.ok(await waitFor(() => !window1.maximized))
		t.equal(window1.minimized, false)
	} else {
		console.warn("WINDOW MANAGER IGNORED MAXIMIZE")
	}
	window1.setResizable(false)
	window1.minimize()
	if (await waitFor(() => window1.minimized)) {
		t.equal(window1.maximized, false)
		window1.restore()
		t.ok(await waitFor(() => !window1.minimized))
		t.equal(window1.maximized, false)
	} else {
		console.warn("WINDOW MANAGER IGNORED MINIMIZE")
	}

	// t.equal(window1.focused, false)
	t.equal(window2.focused, false)
	window1.focus()
	t.equal(window1.focused, true)
	t.equal(window2.focused, false)
	t.equal(sdl.video.focused, window1)
	window2.focus()
	t.equal(window1.focused, false)
	t.equal(window2.focused, true)
	t.equal(sdl.video.focused, window2)
	window1.focus()

	t.equal(typeof window1.hovered, 'boolean')

	t.equal(typeof window1.render, 'function')

	t.equal(typeof window1.setIcon, 'function')

	t.equal(typeof window1.flash, 'function')
	t.equal(typeof window1.stopFlashing, 'function')

	t.equal(window1.display, sdl.video.displays[0])
	t.equal(window2.display, sdl.video.displays[0])

	t.equal(window1.destroyed, false)
	t.equal(window2.destroyed, false)
	window1.destroy()
	t.equal(window1.destroyed, true)
	t.equal(window2.destroyed, false)

	t.equal(sdl.video.windows.length, 1)
	t.equal(sdl.video.windows[0], window2)
	t.equal(window2.focused, false)
	t.equal(sdl.video.focused, null)

	window2.destroy()
	t.equal(window1.destroyed, true)
	t.equal(window2.destroyed, true)

	t.equal(sdl.video.windows.length, 0)
})
