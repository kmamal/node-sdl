import sdl from '@kmamal/sdl'
import Canvas from 'canvas'

const window = sdl.video.createWindow({ resizable: true })

window.on('resize', () => {
	const { width, height } = window
	const canvas = Canvas.createCanvas(width, height)
	const ctx = canvas.getContext('2d')

	ctx.font = `${Math.floor(height / 5)}px serif`
	ctx.fillStyle = 'red'
	ctx.textAlign = 'center'
	ctx.fillText("Hello, World!", width / 2, height / 2)

	const buffer = canvas.toBuffer('raw')
	window.render(width, height, width * 4, 'bgra32', buffer)
})
