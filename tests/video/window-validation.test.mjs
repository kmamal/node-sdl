import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'

const create = (options) => sdl.video.createWindow({ visible: false, ...options })

T.test("sdl::video.createWindow validates options", (t) => {
	t.throws(() => { sdl.video.createWindow(null) })
	t.throws(() => { sdl.video.createWindow('foo') })
	t.throws(() => { create({ title: 1 }) })
	t.throws(() => { create({ x: 1.5 }) })
	t.throws(() => { create({ y: 2 ** 31 }) })
	t.throws(() => { create({ width: 0 }) })
	t.throws(() => { create({ height: -1 }) })
	t.throws(() => { create({ display: null }) })
	t.throws(() => { create({ x: null }) })
	t.throws(() => { create({ y: null }) })
	t.throws(() => { create({ width: null }) })
	t.throws(() => { create({ height: null }) })
	t.throws(() => { create({ visible: 1 }) })
	t.throws(() => { create({ fullscreen: 'yes' }) })
	t.throws(() => { create({ resizable: 1 }) })
	t.throws(() => { create({ borderless: 1 }) })
	t.throws(() => { create({ alwaysOnTop: 1 }) })
	t.throws(() => { create({ accelerated: 1 }) })
	t.throws(() => { create({ vsync: 2 ** 31 }) })
	t.throws(() => { create({ opengl: 1 }) })
	t.throws(() => { create({ webgpu: 1 }) })
	t.throws(() => { create({ resizable: true, borderless: true }) })
	t.throws(() => { create({ opengl: true, webgpu: true }) })
	t.throws(() => { create({ opengl: true, accelerated: true }) })
	t.throws(() => { create({ opengl: true, vsync: 1 }) })
	t.throws(() => { create({ webgpu: true, accelerated: false }) })
	t.throws(() => { create({ webgpu: true, vsync: 0 }) })
})

T.test("sdl::window validates arguments", (t) => {
	const window = create()
	try {
		t.throws(() => { window.on('foo', () => {}) })
		t.throws(() => { window.setTitle(1) })
		t.throws(() => { window.setPosition(1.5, 0) })
		t.throws(() => { window.setPosition(0, 2 ** 31) })
		t.throws(() => { window.setSize(0, 1) })
		t.throws(() => { window.setSize(1, 1.5) })
		t.throws(() => { window.setSizeInPixels(0, 1) })
		t.throws(() => { window.setSizeInPixels(1, -1) })
		t.throws(() => { window.show(1) })
		t.throws(() => { window.setFullscreen(1) })
		t.throws(() => { window.setResizable(1) })
		t.throws(() => { window.setBorderless(1) })
		t.throws(() => { window.setAccelerated(1) })
		t.throws(() => { window.setVsync(2 ** 31) })
		t.throws(() => { window.maximize() })
		t.throws(() => { window.setRelativeMouseMode(1) })
		t.throws(() => { window.flash(1) })

		const buffer = Buffer.alloc(4 * 4 * 4)
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, null) })
		t.throws(() => { window.render(0, 4, 16, 'rgba32', buffer) })
		t.throws(() => { window.render(4, 0, 16, 'rgba32', buffer) })
		t.throws(() => { window.render(4, 4, 1.5, 'rgba32', buffer) })
		t.throws(() => { window.render(4, 4, 15, 'rgba32', buffer) })
		t.throws(() => { window.render(4, 4, 2 ** 31, 'rgba32', buffer) })
		t.throws(() => { window.render(4, 4, 16, 1, buffer) })
		t.throws(() => { window.render(4, 4, 16, 'foo', buffer) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', new Uint8Array(64)) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', Buffer.alloc(63)) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, { scaling: 1 }) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, { scaling: 'foo' }) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, { dstRect: 1 }) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, { dstRect: null }) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, { dstRect: { x: NaN, y: 0, width: 1, height: 1 } }) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, { dstRect: { x: 0, y: '0', width: 1, height: 1 } }) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, { dstRect: { x: 0, y: 0, width: Infinity, height: 1 } }) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, { dstRect: { x: 0, y: 0, width: 0, height: 1 } }) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, { dstRect: { x: 0, y: 0, width: 1 } }) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, { dstRect: { x: 0, y: 0, width: 1, height: -1 } }) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, { dstRect: { x: 1e300, y: 0, width: 1, height: 1 } }) })
		t.throws(() => { window.render(4, 4, 16, 'rgba32', buffer, { dstRect: { x: 0, y: 0, width: 1e300, height: 1 } }) })

		t.throws(() => { window.render(4, 4, 16, 'p010', Buffer.alloc(1024)) })

		t.throws(() => { window.setIcon(4, 4, 16, 'rgba32', Buffer.alloc(8)) })
		t.throws(() => { window.setIcon(4, 4, 4, 'nv12', Buffer.alloc(24)) })
	}
	finally { window.destroy() }
})

T.test("sdl::window render, icon, and misc calls", (t) => {
	const window = create({ resizable: true })
	try {
		const buffer = Buffer.alloc(4 * 4 * 4, 0xFF)
		t.throwsNot(() => { window.render(4, 4, 16, 'rgba32', buffer) })
		t.throwsNot(() => { window.render(4, 4, 16, 'rgba32', buffer, { scaling: 'linear' }) })
		t.throwsNot(() => { window.render(4, 4, 16, 'rgba32', buffer, { dstRect: { x: 1, y: 2, width: 3.5, height: 4.5 } }) })
		t.throwsNot(() => { window.render(4, 4, 20, 'rgba32', Buffer.alloc(80)) })
		t.throwsNot(() => { window.setIcon(4, 4, 16, 'rgba32', buffer) })
		t.throwsNot(() => { window.setIcon(4, 4, 12, 'rgb24', Buffer.alloc(48)) })

		t.throwsNot(() => { window.flash() })
		t.throwsNot(() => { window.flash(true) })
		t.throwsNot(() => { window.stopFlashing() })

		t.equal(window.relativeMouseMode, false)
		window.setRelativeMouseMode()
		t.equal(typeof window.relativeMouseMode, 'boolean')
		window.unsetRelativeMouseMode()
		t.equal(window.relativeMouseMode, false)

		t.throwsNot(() => { window.setSizeInPixels(120, 130) })
		t.equal(typeof window.alwaysOnTop, 'boolean')
	}
	finally { window.destroy() }
})

T.test("sdl::window opengl and webgpu modes reject renderer calls", (t) => {
	for (const mode of [ 'opengl', 'webgpu' ]) {
		let window
		try { window = create({ [mode]: true }) }
		catch { continue }
		try {
			t.equal(window[mode], true)
			t.throws(() => { window.setAccelerated(true) })
			t.throws(() => { window.setVsync(1) })
			t.throws(() => { window.render(1, 1, 4, 'rgba32', Buffer.alloc(4)) })
		}
		finally { window.destroy() }
	}
})

T.test("sdl::window methods throw after destroy", (t) => {
	const window = create()
	window.destroy()

	const buffer = Buffer.alloc(4)
	const calls = [
		() => window.x,
		() => window.y,
		() => window.width,
		() => window.height,
		() => window.pixelWidth,
		() => window.pixelHeight,
		() => window.display,
		() => window.visible,
		() => window.fullscreen,
		() => window.resizable,
		() => window.borderless,
		() => window.alwaysOnTop,
		() => window.accelerated,
		() => window.vsync,
		() => window.opengl,
		() => window.webgpu,
		() => window.native,
		() => window.maximized,
		() => window.minimized,
		() => window.focused,
		() => window.hovered,
		() => window.mouseCaptured,
		() => window.relativeMouseMode,
		() => { window.setTitle('x') },
		() => { window.setPosition(0, 0) },
		() => { window.setSize(1, 1) },
		() => { window.setSizeInPixels(1, 1) },
		() => { window.show() },
		() => { window.hide() },
		() => { window.setFullscreen(true) },
		() => { window.setResizable(true) },
		() => { window.setBorderless(true) },
		() => { window.setAccelerated(true) },
		() => { window.setVsync(1) },
		() => { window.maximize() },
		() => { window.minimize() },
		() => { window.restore() },
		() => { window.focus() },
		() => { window.setRelativeMouseMode(true) },
		() => { window.render(1, 1, 4, 'rgba32', buffer) },
		() => { window.setIcon(1, 1, 4, 'rgba32', buffer) },
		() => { window.flash() },
		() => { window.stopFlashing() },
		() => { window.destroy() },
		() => { window.destroyGently() },
	]
	for (const call of calls) { t.throws(call) }
	t.equal(window.destroyed, true)
	t.equal(typeof window.id, 'number')
})
