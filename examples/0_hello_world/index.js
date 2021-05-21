const sdl = require('@kmamal/sdl')

sdl.video.createWindow({ title: "Hello, World!" })

for (;;) {
	const event = sdl.events.wait()
	if (event?.type === 'quit') { break }
}
