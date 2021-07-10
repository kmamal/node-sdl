import sdl from '@kmamal/sdl'
import path from 'path'
import { setTimeout } from 'timers/promises'
import { loadImage, loadVideo } from './ffmpeg.js'

const width = 640
const height = 480
const framerate = 25

let startTime = null
let lastIndex = null

const dir = path.dirname(import.meta.url)
const [ image, video ] = await Promise.all([
	loadImage(path.join(dir, 'image.png'), { width, height }),
	loadVideo(path.join(dir, 'video.mp4'), { width, height, framerate }),
])

const window = sdl.video.createWindow({ width, height })

window.on('mouseButtonUp', () => {
	startTime = startTime ? null : Date.now()
	render()
})

const render = async () => {
	for (;;) {
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
