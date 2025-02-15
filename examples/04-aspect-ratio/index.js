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
	const factorX = Math.floor(window.width / image.width)
	const factorY = Math.floor(window.height / image.height)
	const factor = Math.min(factorX, factorY)

	viewport.width = factor * image.width
	viewport.height = factor * image.height

	viewport.x = Math.floor((window.width - viewport.width) / 2)
	viewport.y = Math.floor((window.height - viewport.height) / 2)

	render()
}

const render = () => {
	window.render(
		image.width,
		image.height,
		image.width * 4,
		'rgba32',
		image.data,
		{ dstRect: viewport },
	)
}

window.on('resize', resize)
window.on('expose', render)
