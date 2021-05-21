const sdl = require('../..')
const { createCanvas } = require('canvas')

const window = sdl.video.createWindow()
const { width, height } = window
const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')

const device = sdl.audio.devices.find(({ recording }) => recording)
const format = sdl.audio.FORMAT.F32
const channels = 1
const buffered = 128
const audioDevice = sdl.audio.openDevice(device, {
	format,
	channels,
	buffered,
})
const { frequency } = audioDevice
const bytesPerSample = 4

const duration = 5
const numSamples = duration * frequency
const numBytes = numSamples * bytesPerSample
const audioBuffer = Buffer.alloc(numBytes, 0)

audioDevice.play()

const supersampling = 4

main_loop:
for (;;) {
	// Handle events
	{
		let event
		while ((event = sdl.events.poll())) {
			if (event.type === 'quit') { break main_loop }
		}
	}

	// Read new audio samples
	{
		const { queued } = audioDevice
		if (queued === 0) { continue }
		audioBuffer.copy(audioBuffer, 0, queued)
		audioDevice.dequeue(audioBuffer.slice(-queued))
	}

	// Render
	{
		ctx.fillStyle = 'black'
		ctx.fillRect(0, 0, width, height)
		ctx.fillStyle = 'white'

		ctx.save()
		ctx.translate(0, height / 2)
		ctx.scale(1, -height / 2)
		ctx.lineWidth = 1 / width
		{
			let min = 0
			let max = 0
			let last_x = -1
			for (let i = 0; i < numSamples; i++) {
				const x = Math.floor((i / numSamples) * width * supersampling)

				if (x > last_x) {
					ctx.fillRect(last_x / supersampling, min, 1, max - min)
					last_x = x
					min = Infinity
					max = -Infinity
				}

				const sample = audioBuffer.readFloatLE(i * bytesPerSample)
				max = Math.max(max, sample)
				min = Math.min(min, sample)
			}
		}
		ctx.restore()

		const pixelBuffer = canvas.toBuffer('raw')
		window.render(width, height, width * 4, sdl.video.FORMAT.BGRA32, pixelBuffer)
	}
}
