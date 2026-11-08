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
	if (factor === 0) { return }

	const pixelViewportWidth = factor * image.width
	const pixelViewportHeight = factor * image.height
	const pixelViewportX = Math.floor((window.pixelWidth - pixelViewportWidth) / 2)
	const pixelViewportY = Math.floor((window.pixelHeight - pixelViewportHeight) / 2)

	const pointsPerPixel = window.width / window.pixelWidth
	viewport.x = pixelViewportX * pointsPerPixel
	viewport.y = pixelViewportY * pointsPerPixel
	viewport.width = pixelViewportWidth * pointsPerPixel
	viewport.height = pixelViewportHeight * pointsPerPixel

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
