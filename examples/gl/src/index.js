const SDL = require('../../..')
const createContext = require('gl')

SDL.setLogger((x) => console.log('SDL>', x))

const window = new SDL.Window({
	title: "JavaScript",
	resizable: false,
	borderless: true,
})

const { width: w, height: h } = window
const gl = createContext(w, h)

gl.clearColor(1, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)

const buffer = new Uint8Array(w * h * 4)
gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buffer)
window.render(w, h, w * 4, SDL.PixelFormat.RGBA32, Buffer.from(buffer))

setTimeout(() => {}, 3e3)
