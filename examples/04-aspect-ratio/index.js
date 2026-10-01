import sdl from '@kmamal/sdl'
import { PNG } from 'pngjs'
import fs from 'node:fs'

const imageData = fs.readFileSync('./assets/megaman.png')
const image = PNG.sync.read(imageData)

const window = sdl.video.createWindow({ resizable: true })

const viewport = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
}

const resize = () => {
	if (window.destroyed) { return }

	const factorX = Math.floor(window.pixelWidth / image.width)
	const factorY = Math.floor(window.pixelHeight / image.height)
	const factor = Math.min(factorX, factorY)

	viewport.width = factor * image.width
	viewport.height = factor * image.height

	viewport.x = Math.floor((window.pixelWidth - viewport.width) / 2)
	viewport.y = Math.floor((window.pixelHeight - viewport.height) / 2)

	render()
}

const render = () => {
	if (window.destroyed) { return }

	window.render(
		image.width,
		image.height,
		image.width * 4,
		'rgba32',
		image.data,
		{ dstRect: viewport },
	)
}

window
	.on('resize', resize)
	.on('expose', render)
