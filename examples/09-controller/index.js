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

			for (const [ key, value ] of Object.entries(axes)) {
				ctx.fillText(`${key}: ${value.toFixed(2)}`, x, y)
				y += 20
			}

			x += 200
			maxY = Math.max(maxY, y)
			y = topY
		}

		{
			ctx.fillText("Buttons", x, y)
			y += 20

			for (const [ key, value ] of Object.entries(buttons)) {
				ctx.fillText(`${key}: ${value}`, x, y)
				y += 20
			}

			x += 200
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

const openController = (device) => {
	const instance = sdl.controller.openDevice(device)
	instances.add(instance)

	instance.on('*', (event) => {
		if (event.type === 'close') {
			instances.delete(instance)
		}
		render()
	})
}

sdl.controller.on('deviceAdd', (event) => {
	openController(event.device)
	render()
})

sdl.controller.on('deviceRemove', render)

for (const device of sdl.controller.devices) {
	openController(device)
}

window.on('close', () => {
	for (const instance of instances.values()) {
		instance.close()
	}

	sdl.controller.removeAllListeners('deviceAdd')
	sdl.controller.removeAllListeners('deviceRemove')
})
