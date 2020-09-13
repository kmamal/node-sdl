const SDL = require('../../..')

SDL.setLogger((x) => console.log('SDL>', x))

const window = new SDL.Window({
	title: "JavaScript",
	resizable: false,
	borderless: true,
})

const { width: w, height: h } = window
const buffer = Buffer.alloc(w * h * 4)

const R = 0
const G = 1
const B = 2
const A = 3

let offset = 0
for (let j = 0; j < h; j++) {
	for (let i = 0; i < w; i++) {
		const u = Math.floor((i / w) * 255)
		const v = Math.floor((j / h) * 255)
		buffer[offset * 4 + R] = u
		buffer[offset * 4 + G] = v
		buffer[offset * 4 + B] = 255
		buffer[offset * 4 + A] = 255
		offset += 1
	}
}

window.render(w, h, w * 4, SDL.PixelFormat.RGBA32, buffer)

setTimeout(() => {}, 3e3)
