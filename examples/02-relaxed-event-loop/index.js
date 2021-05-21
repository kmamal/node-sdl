const sdl = require('@kmamal/sdl')

const window = sdl.video.createWindow()

const interval = setInterval(() => {
	// Handle events
	{
		let event
		while ((event = sdl.events.poll())) {
			if (event.type === 'quit') { clearInterval(interval) }
		}
	}

	window.setTitle(new Date().toISOString())
}, 100)
