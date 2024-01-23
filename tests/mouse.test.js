const { test } = require('@kmamal/testing')
const sdl = require('../src/javascript/index.js')

test("sdl::mouse", async (t) => {
	const buttons = Object.entries(sdl.mouse.BUTTON).map(([ , v ]) => v)
	t.ok(buttons.length > 1)
	const buttonSet = new Set(buttons)
	t.equal(buttonSet.size, buttons.length)

	let numPressed = 0
	for (const button of buttons) {
		const isPressed = sdl.mouse.getButton(button)
		t.equal(typeof isPressed, 'boolean')
		if (isPressed) { numPressed++ }
	}
	t.ok(numPressed <= 1)


	const { x, y } = sdl.mouse.position
	t.equal(typeof x, 'number')
	t.equal(typeof y, 'number')

	sdl.mouse.setPosition(200, 100)
	const { x: xx, y: yy } = sdl.mouse.position
	t.equal(xx, 200)
	t.equal(yy, 100)
	sdl.mouse.setPosition(x, y)


	sdl.mouse.setCursor('wait')
	sdl.mouse.resetCursor()


	sdl.mouse.hideCursor()
	sdl.mouse.showCursor()
	sdl.mouse.showCursor(false)
	sdl.mouse.showCursor(true)
	sdl.mouse.redrawCursor()


	const window = sdl.video.createWindow()
	window.focus()

	await new Promise((resolve) => { setTimeout(resolve, 0) })

	sdl.mouse.capture()
	sdl.mouse.uncapture()
	sdl.mouse.capture(true)
	sdl.mouse.capture(false)

	window.destroy()
})
