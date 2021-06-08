import sdl from '@kmamal/sdl'

const R = 0
const G = 1
const B = 2
const A = 3

const window = sdl.video.createWindow({ resizable: true })

window.on('resize', () => {
	const { width, height } = window
	const stride = width * 4
	const buffer = Buffer.alloc(stride * height)

	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			const offset = i * stride + j * 4
			buffer[offset + R] = Math.floor(256 * i / height)
			buffer[offset + G] = Math.floor(256 * j / width)
			buffer[offset + B] = 0
			buffer[offset + A] = 255
		}
	}

	window.render(width, height, stride, sdl.video.FORMAT.RGBA32, buffer)
})
