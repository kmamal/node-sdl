import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import Bindings from '../../src/javascript/bindings.js'
import Enums from '../../src/javascript/enums.js'

const create = () => sdl.video.createWindow({ visible: false, borderless: true })

T.test("sdl::window.setHitTest calls the function with the point", (t) => {
	const window = create()
	try {
		const calls = []
		window.setHitTest((x, y) => {
			calls.push([ x, y ])
			return 'draggable'
		})
		calls.length = 0

		t.equal(Bindings.testing_hitTest(window.id, 12, 34), Enums.hitTestResult.draggable)
		t.equal(calls, [ [ 12, 34 ] ])
	}
	finally { window.destroy() }
})

T.test("sdl::window.setHitTest maps every result", (t) => {
	const window = create()
	try {
		for (const [ name, value ] of Object.entries(Enums.hitTestResult)) {
			window.setHitTest(() => name)
			t.equal(Bindings.testing_hitTest(window.id, 0, 0), value)
		}

		window.setHitTest(() => undefined)
		t.equal(Bindings.testing_hitTest(window.id, 0, 0), Enums.hitTestResult.normal)
	}
	finally { window.destroy() }
})

T.test("sdl::window.setHitTest can be replaced and removed", (t) => {
	const window = create()
	try {
		window.setHitTest(() => 'draggable')
		window.setHitTest(() => 'resizeLeft')
		t.equal(Bindings.testing_hitTest(window.id, 0, 0), Enums.hitTestResult.resizeLeft)

		window.unsetHitTest()
		t.equal(Bindings.testing_hitTest(window.id, 0, 0), Enums.hitTestResult.normal)

		window.setHitTest(() => 'draggable')
		window.setHitTest(null)
		t.equal(Bindings.testing_hitTest(window.id, 0, 0), Enums.hitTestResult.normal)

		t.throwsNot(() => { window.unsetHitTest() })
	}
	finally { window.destroy() }
})

T.test("sdl::window.setHitTest emits errors and falls back to normal", (t) => {
	const window = create()
	try {
		const errors = []
		window.on('error', (error) => { errors.push(error) })

		const thrown = new Error("boom")
		window.setHitTest(() => { throw thrown })
		t.equal(Bindings.testing_hitTest(window.id, 0, 0), Enums.hitTestResult.normal)

		window.setHitTest(() => 'foo')
		t.equal(Bindings.testing_hitTest(window.id, 0, 0), Enums.hitTestResult.normal)

		window.setHitTest(() => null)
		t.equal(Bindings.testing_hitTest(window.id, 0, 0), Enums.hitTestResult.normal)

		t.equal(errors.length, 3)
		t.equal(errors[0], thrown)
		t.equal(errors[1].result, 'foo')
		t.equal(errors[2].result, null)
	}
	finally { window.destroy() }
})

T.test("sdl::window.setHitTest does not poll from inside the function", (t) => {
	const window = create()
	try {
		const key = 'events_poll'
		const originalPoll = Bindings[key]
		let polls = 0
		Bindings[key] = (...args) => {
			polls++
			return originalPoll(...args)
		}
		try {
			let width = null
			window.setHitTest(() => { width = window.width })
			polls = 0
			Bindings.testing_hitTest(window.id, 0, 0)
			t.equal(polls, 0)
			t.equal(typeof width, 'number')
		}
		finally { Bindings[key] = originalPoll }
	}
	finally { window.destroy() }
})

T.test("sdl::window.setHitTest keeps the previous function if enabling fails", (t) => {
	const window = create()
	try {
		const key = 'window_setHitTest'
		const original = Bindings[key]
		Bindings[key] = () => { throw new Error("unsupported") }
		try {
			t.throws(() => { window.setHitTest(() => 'draggable') })
			t.throws(() => { window.setHitTest(() => 'draggable') })
			t.throwsNot(() => { window.unsetHitTest() })
		}
		finally { Bindings[key] = original }
		t.equal(Bindings.testing_hitTest(window.id, 0, 0), Enums.hitTestResult.normal)
	}
	finally { window.destroy() }
})

T.test("sdl::window.destroy from inside the function defers native destruction", async (t) => {
	const window = create()
	const { id } = window
	try {
		window.setHitTest(() => { window.destroy() })
		Bindings.testing_hitTest(id, 0, 0)
		t.ok(window.destroyed)
		t.throwsNot(() => { Bindings.window_setHitTest(id, false) })
		await new Promise((resolve) => { process.nextTick(resolve) })
		t.throws(() => { Bindings.window_setHitTest(id, false) })
	}
	finally {
		if (!window.destroyed) { window.destroy() }
	}
})

T.test("sdl::window.destroy from an error listener of the function defers native destruction", async (t) => {
	const window = create()
	const { id } = window
	try {
		window.on('error', () => { window.destroy() })
		window.setHitTest(() => { throw new Error("boom") })
		Bindings.testing_hitTest(id, 0, 0)
		t.ok(window.destroyed)
		t.throwsNot(() => { Bindings.window_setHitTest(id, false) })
		await new Promise((resolve) => { process.nextTick(resolve) })
		t.throws(() => { Bindings.window_setHitTest(id, false) })
	}
	finally {
		if (!window.destroyed) { window.destroy() }
	}
})
