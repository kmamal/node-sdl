const sdl = require('..')

const screenWidth = sdl.video.displays[0].usable.width
const baseWidth = screenWidth / 5

sdl.video.createWindow({ x: baseWidth, width: baseWidth })
sdl.video.createWindow({ x: 3 * baseWidth, width: baseWidth })

setInterval(() => {
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
}, 0)
