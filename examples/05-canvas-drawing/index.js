import sdl from '@kmamal/sdl'
import Canvas from '@napi-rs/canvas'

const window = sdl.video.createWindow({ resizable: true })

let canvas
let ctx

const render = () => {
	const { pixelWidth: width, pixelHeight: height } = window

	ctx.font = `${Math.floor(height / 5)}px "Times New Roman"`
	ctx.fillStyle = 'red'
	ctx.textAlign = 'center'
	ctx.fillText("Hello, World!", width / 2, height / 2)

	window.render(width, height, width * 4, 'rgba32', canvas.data())
}

window.on('expose', render)

window.on('resize', (event) => {
	canvas = Canvas.createCanvas(event.pixelWidth, event.pixelHeight)
	ctx = canvas.getContext('2d')
	render()
})
