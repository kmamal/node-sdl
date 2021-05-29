const sdl = require('@kmamal/sdl')
const { createCanvas } = require('canvas')

const window = sdl.video.createWindow()
const { width, height } = window
const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')

ctx.font = '14px monospace'
ctx.fillStyle = 'white'
ctx.textAlign = 'left'
ctx.textBaseline = 'top'

let text = ''

const maxUnicode = 0x10FFFF

const redraw = () => {
	ctx.clearRect(0, 0, width, height)

	ctx.fillText(text, 0, 0)

	const buffer = canvas.toBuffer('raw')
	window.render(width, height, width * 4, sdl.video.FORMAT.BGRA32, buffer)
}

redraw()

const interval = setInterval(() => {
	// Handle events
	{
		let event
		while ((event = sdl.events.poll())) {
			switch (event?.type) {
				case 'window-focus-gained':
				case 'clipboard-update':
				{
					text = sdl.clipboard.text
					redraw()
					break
				}

				case 'quit': {
					clearInterval(interval)
				}

			// No default
			}
		}
	}

	// Render
	{
		if (text.length === 0) { return }

		const chars = [ ...text ]
		const index = Math.floor(Math.random() * chars.length)
		const drift = Math.round(Math.random() * maxUnicode / 100)
		const drifted = (chars[index].codePointAt(0) + drift) % maxUnicode
		const char = String.fromCodePoint(drifted)
		text = [
			...chars.slice(0, index),
			char,
			...chars.slice(index + 1),
		].join('')

		sdl.clipboard.setText(text)
		redraw()
	}
}, 10)
