const sdl = require('..')

const screen_width = sdl.video.displays[0].usable.width
const base_width = screen_width / 5

sdl.video.createWindow({ x: base_width, width: base_width })
sdl.video.createWindow({ x: 3 * base_width, width: base_width })

for (;;) {
	const event = sdl.events.wait()

	switch (event?.type) {
		case 'window-close': {
			event.window.destroy()
			break
		}

		case 'quit': { process.exit() }
		// No default
	}

	const { windows, focused, hovered } = sdl.video
	if (focused) {
		if (!focused.focused) { throw new Error('window.focused not set') }
		if (!windows.includes(focused)) { throw new Error('focused window is gone') }
	}
	if (hovered) {
		if (!hovered.hovered) { throw new Error('window.hovered not set') }
		if (!windows.includes(hovered)) { throw new Error('hovered window is gone') }
	}
	for (const window of windows) {
		if (window.focused && !focused) { Error('sdl.video.focused not set') }
		if (window.hovered && !hovered) { Error('sdl.video.hovered not set') }
	}
}
