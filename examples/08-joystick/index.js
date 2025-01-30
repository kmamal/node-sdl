import sdl from '@kmamal/sdl'
import Canvas from 'canvas'

const window = sdl.video.createWindow({ resizable: true })
let canvas
let ctx

const instances = new Set()

const doRender = () => {
	if (window.destroyed) { return }

	const {
		pixelWidth: W,
		pixelHeight: H,
	} = window

	let x = 0
	let y = 0
	let maxX = 0
	let maxY = 0

	ctx.font = '12px mono'
	ctx.textAlign = 'left'
	ctx.textBaseline = 'top'

	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, W, H)

	for (const instance of instances.values()) {
		const {
			device: {
				id,
				name,
			},
			axes,
			buttons,
			balls,
			hats,
		} = instance

		x += 20
		y += 20

		ctx.fillStyle = 'white'

		ctx.fillText(`[${id}] ${name}`, x, y)
		y += 20
		const topY = y

		{
			ctx.fillText("Axes", x, y)
			y += 20

			for (let i = 0; i < axes.length; i++) {
				ctx.fillText(`[${i}]: ${axes[i].toFixed(2)}`, x, y)
				y += 20
			}

			x += 120
			maxY = Math.max(maxY, y)
			y = topY
		}

		{
			ctx.fillText("Buttons", x, y)
			y += 20

			for (let i = 0; i < buttons.length; i++) {
				ctx.fillText(`[${i}]: ${buttons[i]}`, x, y)
				y += 20
			}

			x += 120
			maxY = Math.max(maxY, y)
			y = topY
		}

		{
			ctx.fillText("Balls", x, y)
			y += 20

			for (let i = 0; i < balls.length; i++) {
				ctx.fillText(`[${i}]: ${balls[i]}`, x, y)
				y += 20
			}

			x += 120
			maxY = Math.max(maxY, y)
			y = topY
		}

		{
			ctx.fillText("Hats", x, y)
			y += 20

			for (let i = 0; i < hats.length; i++) {
				ctx.fillText(`[${i}]: ${hats[i]}`, x, y)
				y += 20
			}

			x += 120
			maxY = Math.max(maxY, y)
			y = topY
		}

		y = maxY
		maxX = Math.max(maxX, x)
		x = 0
	}

	maxY += 20
	maxX += 20

	if (maxX !== window.width || maxY !== window.height) {
		window.setSizeInPixels(maxX, maxY)
	} else {
		const buffer = canvas.toBuffer('raw')
		window.render(W, H, W * 4, 'bgra32', buffer)
	}
}

let nextRender = null
const render = () => {
	if (nextRender) { return }
	nextRender = setTimeout(() => {
		nextRender = null
		doRender()
	})
}

window.on('expose', render)
window.on('resize', (event) => {
	canvas = Canvas.createCanvas(event.pixelWidth, event.pixelHeight)
	ctx = canvas.getContext('2d')
})

const openJoystick = (device) => {
	const instance = sdl.joystick.openDevice(device)
	instances.add(instance)

	instance.on('*', (event) => {
		if (event.type === 'close') {
			instances.delete(instance)
		}
		render()
	})
}

sdl.joystick.on('deviceAdd', (event) => {
	openJoystick(event.device)
	render()
})

sdl.joystick.on('deviceRemove', render)

for (const device of sdl.joystick.devices) {
	openJoystick(device)
}

window.on('close', () => {
	for (const instance of instances.values()) {
		instance.close()
	}

	sdl.joystick.removeAllListeners('deviceAdd')
	sdl.joystick.removeAllListeners('deviceRemove')
})
