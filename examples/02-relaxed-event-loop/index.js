const sdl = require('@kmamal/sdl')

const window = sdl.video.createWindow()

const interval1 = setInterval(() => {
	window.setTitle(new Date().toISOString())
}, 100)

const interval2 = setInterval(() => {
	let event
	while ((event = sdl.events.poll())) {
		if (event.type === 'quit') {
			clearInterval(interval1)
			clearInterval(interval2)
		}
	}
}, 100)
