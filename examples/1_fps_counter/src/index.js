const SDL = require('@kmamal/sdl')

const window = new SDL.Window()

let tic = Date.now()
let toc
let frames = 0

main_loop:
for (;;) {
	let event
	while ((event = SDL.pollEvent())) {
		if (event.type === 'quit') {
			window.destroy()
			break main_loop
		}
	}

	// Do some drawing here

	frames++
	toc = Date.now()
	const ellapsed = (toc - tic) / 1e3
	if (ellapsed >= 1) {
		const fps = Math.round(frames / ellapsed)

		window.title = `FPS: ${fps}`

		tic = toc
		frames = 0
	}
}
