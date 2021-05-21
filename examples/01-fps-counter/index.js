const sdl = require('@kmamal/sdl')

const window = sdl.video.createWindow()

const { width, height } = window
const stride = width * 4
const numBytes = stride * height
const buffer = Buffer.alloc(numBytes, 0)

let tic = Date.now()
let toc
let frames = 0

main_loop:
for (;;) {
	// Handle events
	{
		let event
		while ((event = sdl.events.poll())) {
			if (event.type === 'quit') { break main_loop }
		}
	}

	// Draw to the screen
	window.render(width, height, stride, sdl.video.FORMAT.RGBA32, buffer)

	// Count frames
	{
		frames++
		toc = Date.now()
		const ellapsed = (toc - tic) / 1e3
		if (ellapsed >= 1) {
			const fps = Math.round(frames / ellapsed)

			window.setTitle(`FPS: ${fps}`)

			tic = toc
			frames = 0
		}
	}
}
