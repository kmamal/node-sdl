const sdl = require('../../..')

console.log(sdl.audio.devices)

sdl.video.createWindow({ title: "Hello, World!" })

for (;;) {
	const event = sdl.events.wait()
	if (event?.type === 'quit') { break }
	console.log(event)
}
