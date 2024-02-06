import sdl from '@kmamal/sdl'
import Canvas from 'canvas'
import { fork } from 'node:child_process'
import { once } from 'node:events'

const audioDrivers = sdl.info.drivers.audio.all
let currentAudioDriver = sdl.info.drivers.audio.current
let currentState = 'stopped'
let currentTime = 0

let audioProcess
const restartAudioProcessWith = async (driver) => {
	audioProcess?.kill()
	audioProcess = fork('./audio-proc.js', {
		env: {
			...process.env,
			SDL_AUDIODRIVER: driver,
		},
	})

	await once(audioProcess, 'message')

	audioProcess.on('message', (message) => {
		switch (message.type) {
			case 'end': { currentState = 'stopped' } break
			case 'time': { currentTime = message.time } break
			// No default
		}
		redraw()
	})

	if (currentState === 'playing') {
		audioProcess.send({ type: 'play', time: currentTime })
	}
}
await restartAudioProcessWith(currentAudioDriver)

const buttons = [
	{
		text: "play",
		rect: { x: 10, y: 30, w: 100, h: 20 },
		fn () {
			if (currentState !== 'stopped') { return }
			currentState = 'playing'
			audioProcess.send({ type: 'play', time: currentTime })
		},
	},
	{
		text: "stop",
		rect: { x: 120, y: 30, w: 100, h: 20 },
		fn () {
			if (currentState !== 'playing') { return }
			currentState = 'stopped'
			audioProcess.send({ type: 'stop' })
		},
	},
	...audioDrivers.map((text, index) => ({
		text,
		rect: { x: 10, y: 90 + index * 30, w: 210, h: 20 },
		async fn () {
			currentAudioDriver = this.text
			await restartAudioProcessWith(currentAudioDriver)
		},
	})),
]

const width = 230
const height = 90 + audioDrivers.length * 30 + 10

const window = sdl.video.createWindow({ width, height })
const { pixelWidth, pixelHeight } = window
const canvas = Canvas.createCanvas(pixelWidth, pixelHeight)
const ctx = canvas.getContext('2d')

const scaleX = pixelWidth / width
const scaleY = pixelHeight / height
ctx.scale(scaleX, scaleY)

ctx.font = '15px monospace'
ctx.fillStyle = 'white'
ctx.strokeStyle = 'white'
ctx.lineWidth = 2 * Math.min(scaleX, scaleY)
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'

const redraw = () => {
	ctx.clearRect(0, 0, width, height)

	const time = Math.round(currentTime / 1e3)
	const minutes = Math.floor(time / 60).toString().padStart(2, '0')
	const seconds = (time % 60).toString().padStart(2, '0')
	ctx.fillText(`State: ${currentState} ${minutes}:${seconds}`, width / 2, 15)

	ctx.fillText(`Using: ${currentAudioDriver}`, width / 2, 75)

	for (const { text, rect: { x, y, w, h } } of buttons) {
		ctx.strokeRect(x, y, w, h)
		ctx.fillText(text, x + w / 2, y + h / 2)
	}

	const buffer = canvas.toBuffer('raw')
	window.render(width, height, width * 4, 'bgra32', buffer)
}

redraw()

let processing = false
window.on('mouseButtonUp', async (event) => {
	if (processing) { return }
	processing = true

	if (event.button !== 1) { return }

	for (const button of buttons) {
		const { rect: { x, y, w, h } } = button
		if (x <= event.x && event.x <= x + w && y <= event.y && event.y <= y + h) {
			console.log(`Clicked: ${button.text}`)
			await button.fn()
			redraw()
			break
		}
	}

	processing = false
})

window.on('close', () => { audioProcess?.kill() })
