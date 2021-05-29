const sdl = require('@kmamal/sdl')
const path = require('path')
const { loadImage, loadVideo } = require('./ffmpeg')

const width = 640
const height = 480
const framerate = 25

let startTime = null
let lastIndex = null

const main = async () => {
	const [ image, video ] = await Promise.all([
		loadImage(path.join(__dirname, 'image.png'), { width, height }),
		loadVideo(path.join(__dirname, 'video.mp4'), { width, height, framerate }),
	])

	const window = sdl.video.createWindow({ width, height })

	main_loop:
	for (;;) {
		// Handle events
		{
			let event
			while ((event = sdl.events.poll())) {
				switch (event.type) {
					case 'mouse-button-up': {
						if (startTime) {
							startTime = null
						} else {
							startTime = Date.now()
						}
						break
					}

					case 'quit': { break main_loop }

					// No default
				}
			}
		}

		// Render pause image
		if (!startTime) {
			window.render(width, height, width * 3, sdl.video.FORMAT.RGB24, image)
			continue
		}

		// Render video
		{
			const time = (Date.now() - startTime) / 1e3
			const index = Math.floor(time * framerate)

			if (index === lastIndex) { continue }

			if (index >= video.length) {
				startTime = null
				lastIndex = null

				window.render(width, height, width * 3, sdl.video.FORMAT.RGB24, image)
				continue
			}

			window.render(width, height, width * 3, sdl.video.FORMAT.RGB24, video[index])
			lastIndex = index
		}
	}
}

main()
