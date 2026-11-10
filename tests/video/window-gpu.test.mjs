import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'

T.test("sdl::window opengl/webgpu have no renderer", (t) => {
	const before = sdl.video.windows.length

	t.throws(() => { sdl.video.createWindow({ opengl: true, accelerated: true }) })
	t.throws(() => { sdl.video.createWindow({ opengl: true, vsync: 0 }) })
	t.throws(() => { sdl.video.createWindow({ webgpu: true, accelerated: false }) })
	t.throws(() => { sdl.video.createWindow({ webgpu: true, vsync: 1 }) })
	t.equal(sdl.video.windows.length, before)

	const window = sdl.video.createWindow({ opengl: true, visible: false })
	try {
		t.equal(window.accelerated, null)
		t.equal(window.vsync, null)
		t.throws(() => { window.setAccelerated(true) })
		t.throws(() => { window.setVsync(1) })
	}
	finally { window.destroy() }

	t.equal(sdl.video.windows.length, before)
})
