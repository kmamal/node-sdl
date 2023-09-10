import sdl from '@kmamal/sdl'
import path from 'path'
import { setTimeout } from 'timers/promises'
import { loadImage, loadVideo } from './ffmpeg.js'

const framerate = 25

const window = sdl.video.createWindow()
const { pixelWidth: width, pixelHeight: height } = window

const dir = path.dirname(import.meta.url)
const [ image, video ] = await Promise.all([
	loadImage(path.join(dir, 'assets/image.png'), { width, height }),
	loadVideo(path.join(dir, 'assets/video.mp4'), { width, height, framerate }),
])

let startTime = null
let lastIndex = null

window.on('mouseButtonUp', () => {
	startTime = startTime ? null : Date.now()
	render()
})

const render = async () => {
	while (!window.destroyed) {
		// Render pause image
		if (!startTime) {
			window.render(width, height, width * 3, 'rgb24', image)
			return
		}

		// Render video
		{
			const time = (Date.now() - startTime) / 1e3
			const index = Math.floor(time * framerate)

			if (index === lastIndex) { continue }

			if (index >= video.length) {
				startTime = null
				lastIndex = null

				window.render(width, height, width * 3, 'rgb24', image)
				return
			}

			window.render(width, height, width * 3, 'rgb24', video[index])
			lastIndex = index
		}

		await setTimeout(0)
	}
}

render()
