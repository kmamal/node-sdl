import sdl from '@kmamal/sdl'
import Canvas from '@napi-rs/canvas'

const window = sdl.video.createWindow({ resizable: true })

let canvas
let ctx

const resize = (event) => {
	if (window.destroyed) { return }

	canvas = Canvas.createCanvas(event.pixelWidth, event.pixelHeight)
	ctx = canvas.getContext('2d')

	render()
}

const render = () => {
	if (window.destroyed) { return }

	const { pixelWidth: width, pixelHeight: height } = window

	ctx.font = `${Math.floor(height / 5)}px Arial, Helvetica, "DejaVu Sans", "Noto Sans"`
	ctx.fillStyle = 'red'
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillText("Hello, World!", width / 2, height / 2)

	window.render(width, height, width * 4, 'rgba32', canvas.data())
}

window
	.on('resize', resize)
	.on('expose', render)
