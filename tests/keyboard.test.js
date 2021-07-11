const sdl = require('..')

const window = sdl.video.createWindow()

window.on('keyDown', ({ scancode, key }) => {
	console.log({
		scancode,
		key,
		_scancode: key && sdl.keyboard.getScancode(key),
		_key: sdl.keyboard.getKey(scancode),
	})
})
