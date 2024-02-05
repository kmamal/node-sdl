import sdl from '../../src/javascript/index.js'

const window = sdl.video.createWindow({ resizable: true })

const redraw = () => {
	const { pixelWidth: width, pixelHeight: height } = window
	const stride = width * 4
	const buffer = Buffer.alloc(stride * height)

	let offset = 0
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			buffer[offset++] = Math.floor(256 * i / height) // R
			buffer[offset++] = Math.floor(256 * j / width)  // G
			buffer[offset++] = 0                            // B
			buffer[offset++] = 255                          // A
		}
	}

	window.render(width, height, stride, 'rgba32', buffer)
}

window
	.on('resize', redraw)
	.on('expose', redraw)
