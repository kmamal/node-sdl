import sdl from '@kmamal/sdl'
import Canvas from 'canvas'
import { setTimeout } from 'timers/promises'

const window = sdl.video.createWindow()
const { width, height } = window
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

	const buffer = canvas.toBuffer('raw')
	window.render(width, height, width * 4, sdl.video.FORMAT.BGRA32, buffer)
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
	await setTimeout(10)

	if (text.length === 0) { continue }

	const chars = [ ...text ]
	const index = Math.floor(Math.random() * chars.length)
	const drift = Math.round(Math.random() * maxUnicode / 1000)
	const drifted = (chars[index].codePointAt(0) + drift) % maxUnicode
	const char = String.fromCodePoint(drifted)
	const before = chars.slice(0, index)
	const after = chars.slice(index + 1)

	text = [ ...before, char, ...after ].join('')
	redraw()
}
