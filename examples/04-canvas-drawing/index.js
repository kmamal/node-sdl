const sdl = require('@kmamal/sdl')
const { createCanvas } = require('canvas')

const window = sdl.video.createWindow({ resizable: true })

const redraw = () => {
	const { width, height } = window
	const canvas = createCanvas(width, height)
	const ctx = canvas.getContext('2d')

	ctx.font = `${Math.floor(height / 5)}px serif`
	ctx.fillStyle = 'red'
	ctx.textAlign = 'center'
	ctx.fillText("Hello, World!", width / 2, height / 2)

	const buffer = canvas.toBuffer('raw')
	window.render(width, height, width * 4, sdl.video.FORMAT.BGRA32, buffer)
}

redraw()

main_loop:
for (;;) {
	const event = sdl.events.wait()
	switch (event?.type) {
		case 'quit': { break main_loop }

		case 'window-resized': {
			redraw()
			break
		}

		// No default
	}
}
