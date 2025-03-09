import sdl from '@kmamal/sdl'
import Canvas from '@napi-rs/canvas'
import { setTimeout } from 'timers/promises'

const window = sdl.video.createWindow()
const { pixelWidth: width, pixelHeight: height } = window
const stride = width * 4
const canvas = Canvas.createCanvas(width, height)
const ctx = canvas.getContext('2d')

ctx.font = '14px monospace'
ctx.fillStyle = 'white'
ctx.textAlign = 'left'
ctx.textBaseline = 'top'

let text = ''

const redraw = () => {
	ctx.clearRect(0, 0, width, height)

	ctx.fillText(text, 0, 0)

	const buffer = Buffer.from(ctx.getImageData(0, 0, width, height).data)
	window.render(width, height, stride, 'rgba32', buffer)
}

const update = () => {
	text = sdl.clipboard.text
	redraw()
}

window.on('focus', update)
sdl.clipboard.on('update', update)

update()

const maxUnicode = 0x10FFFF

while (!window.destroyed) {
	const numChanges = Math.ceil(text.length / 100)

	for (let i = 0; i < numChanges; i++) {
		const chars = [ ...text ]
		const index = Math.floor(Math.random() * chars.length)
		const drift = Math.round(Math.random() * maxUnicode / 1000)
		const drifted = (chars[index].codePointAt(0) + drift) % maxUnicode
		const char = String.fromCodePoint(drifted)
		const before = chars.slice(0, index)
		const after = chars.slice(index + 1)

		text = [ ...before, char, ...after ].join('')
	}

	redraw()
	await setTimeout(100)
}

sdl.clipboard.off('update', update)
