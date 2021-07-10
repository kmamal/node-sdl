import sdl from '@kmamal/sdl'
import { setTimeout } from 'timers/promises'

const window = sdl.video.createWindow()

const { width, height } = window
const stride = width * 4
const numBytes = stride * height
const buffer = Buffer.alloc(numBytes, 0)

let tic = Date.now()
let toc
let frames = 0

while (!window.destroyed) {
	// Draw to the screen
	window.render(width, height, stride, 'rgba32', buffer)

	// Count frames
	{
		frames++
		toc = Date.now()
		const ellapsed = (toc - tic) / 1e3
		if (ellapsed >= 1) {
			const fps = Math.round(frames / ellapsed)

			window.setTitle(`FPS: ${fps}`)

			tic = toc
			frames = 0
		}
	}

	await setTimeout(0)
}
