import sdl from '@kmamal/sdl'
import Canvas from '@napi-rs/canvas'

const window = sdl.video.createWindow()
let canvas
let ctx

const instances = new Set()

let requestedWidth = null
let requestedHeight = null

const resize = (event) => {
	if (window.destroyed) { return }

	canvas = Canvas.createCanvas(event.pixelWidth, event.pixelHeight)
	ctx = canvas.getContext('2d')

	render()
}

const render = () => {
	if (window.destroyed) { return }

	const {
		pixelWidth: W,
		pixelHeight: H,
	} = window

	let x = 0
	let y = 0
	let maxX = 0
	let maxY = 0

	ctx.font = '12px "Courier New", "SF Mono", "DejaVu Sans Mono", "Noto Sans Mono"'
	ctx.textAlign = 'left'
	ctx.textBaseline = 'top'

	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, W, H)

	ctx.fillStyle = 'white'

	if (instances.size === 0) {
		x += 20
		y += 20

		const message = "No gamepads connected"
		ctx.fillText(message, x, y)

		const metrics = ctx.measureText(message)
		maxX = Math.ceil(x + metrics.width)
		maxY = Math.ceil(y + metrics.actualBoundingBoxDescent)
	}
	else {
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
	}

	maxY += 20
	maxX += 20

	window.render(W, H, W * 4, 'rgba32', canvas.data())

	if (maxX !== requestedWidth || maxY !== requestedHeight) {
		requestedWidth = maxX
		requestedHeight = maxY
		window.setSizeInPixels(maxX, maxY)
	}
}

const openGamepad = (device) => {
	const instance = sdl.gamepad.openDevice(device)
	instances.add(instance)

	instance.on('*', (eventType) => {
		if (eventType === 'close') {
			instances.delete(instance)
		}
		render()
	})
}

sdl.gamepad.on('deviceAdd', (event) => {
	openGamepad(event.device)
	render()
})

sdl.gamepad.on('deviceRemove', render)

for (const device of sdl.gamepad.devices) {
	openGamepad(device)
}

const cleanup = () => {
	for (const instance of instances.values()) {
		instance.close()
	}

	sdl.gamepad.removeAllListeners('deviceAdd')
	sdl.gamepad.removeAllListeners('deviceRemove')
}

window
	.on('expose', render)
	.on('resize', resize)
	.on('close', cleanup)
