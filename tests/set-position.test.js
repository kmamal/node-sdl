const sdl = require('..')

const width = 100
const height = 100
const {
	width: screen_width,
	height: screen_height,
} = sdl.video.displays[0].usable
const window_max_x = screen_width - width
const window_max_y = screen_height - height

const window = sdl.video.createWindow({ width, height })

setInterval(() => {
	const window_x = Math.min(window_max_x, window.x + Math.round(Math.random() * 2 - 1))
	const window_y = Math.min(window_max_y, window.y + Math.round(Math.random() * 2 - 1))
	window.setPosition(window_x, window_y)

	const mouse_x = Math.min(screen_width, sdl.mouse.position.x + Math.round(Math.random() * 2 - 1))
	const mouse_y = Math.min(screen_height, sdl.mouse.position.y + Math.round(Math.random() * 2 - 1))
	sdl.mouse.setPosition(mouse_x, mouse_y)
}, 10)
