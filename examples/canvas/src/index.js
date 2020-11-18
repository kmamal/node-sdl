const SDL = require('../../..')
const Canvas = require('canvas')

SDL.setLogger((x) => console.log('SDL>', x))

const window = new SDL.Window({
	title: "JavaScript",
	resizable: false,
	borderless: true,
})

const { width: w, height: h } = window
const canvas = Canvas.createCanvas(w, h)
const ctx = canvas.getContext('2d')

ctx.font = '75px serif'
ctx.fillStyle = 'red'
ctx.textAlign = 'center'
ctx.fillText("Hello, World!", w / 2, h / 2)

const buffer = canvas.toBuffer('raw')
window.render(w, h, w * 4, SDL.PixelFormat.ARGB8888, buffer)

setTimeout(() => {}, 3e3)
