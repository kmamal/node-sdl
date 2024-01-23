const { test } = require('@kmamal/testing')
const sdl = require('../src/javascript/index.js')

test("sdl::keyboard", (t) => {
	const scancodes1 = Object.entries(sdl.keyboard.SCANCODE).map(([ , v ]) => v)
	t.ok(scancodes1.length > 200)
	const scancodeSet1 = new Set(scancodes1)
	t.equal(scancodeSet1.size, scancodes1.length)

	const keys = []
	for (const code of scancodes1) {
		t.equal(typeof code, 'number')
		t.ok(code > 0)

		const key = sdl.keyboard.getKey(code)
		if (key === null) {
			keys.push(null)
			continue
		}

		t.equal(typeof key, 'string')
		t.ok(key.length >= 1)
		keys.push(key)
	}

	t.ok(new Set(keys).size > 100)

	const scancodes2 = new Array(scancodes1.length)
	for (let i = 0; i < scancodes1.length; i++) {
		const key = keys[i]
		if (key === null) {
			scancodes2[i] = null
			continue
		}

		const code = sdl.keyboard.getScancode(key)
		scancodes2[i] = code

		if (code === null) { continue }
		t.equal(typeof code, 'number')
		t.ok(code > 0)
	}
	const scancodeSet2 = new Set(scancodes2)
	t.ok(scancodeSet1.size - scancodeSet2.size < 80)


	// //
	// const entries = Object.entries(sdl.keyboard.SCANCODE)
	// for (let i = 0; i < entries.length; i++) {
	// 	console.log(entries[i], keys[i], scancodes2[i])
	// }
	// //


	const state = sdl.keyboard.getState()

	let numPressed = 0
	for (const isPressed of state) {
		t.equal(typeof isPressed, 'boolean')
		if (isPressed) { numPressed++ }
	}
	t.ok(numPressed <= 3)

	for (const scancode of Object.values(sdl.keyboard.SCANCODE)) {
		t.equal(typeof state[scancode], 'boolean')
	}
})
