import sdl from '@kmamal/sdl'

const window = sdl.video.createWindow({ resizable: true })
const width = 2
const height = 2
const stride = width * 3
const buffer = Buffer.alloc(stride * height)

let offset = 0
// Top left pixel red
buffer[offset++] = 255 // R
buffer[offset++] = 0   // G
buffer[offset++] = 0   // B
// Top right pixel green
buffer[offset++] = 0   // R
buffer[offset++] = 255 // G
buffer[offset++] = 0   // B
// Bottom left pixel blue
buffer[offset++] = 0   // R
buffer[offset++] = 0   // G
buffer[offset++] = 255 // B
// Bottom right pixel black
buffer[offset++] = 0   // R
buffer[offset++] = 0   // G
buffer[offset++] = 0   // B

const render = () => {
	if (window.destroyed) { return }

	window.render(width, height, stride, 'rgb24', buffer, { scaling: 'linear' })
}

window
	.on('resize', render)
	.on('expose', render)
