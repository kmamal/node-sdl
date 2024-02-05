import sdl from '@kmamal/sdl'
import Canvas from 'canvas'
import { setTimeout } from 'timers/promises'

const window = sdl.video.createWindow()
const { pixelWidth: width, pixelHeight: height } = window
const canvas = Canvas.createCanvas(width, height)
const ctx = canvas.getContext('2d')

const channels = 1
const buffered = 128
const recordingInstance = sdl.audio.openDevice({ type: 'recording' }, {
	channels,
	buffered,
})
const {
	frequency,
	bytesPerSample,
	minSampleValue,
	maxSampleValue,
	zeroSampleValue,
} = recordingInstance
const range = maxSampleValue - minSampleValue
const amplitude = range / 2

const duration = 5
const numSamples = duration * frequency
const numBytes = numSamples * bytesPerSample
const audioBuffer = Buffer.alloc(numBytes, 0)

recordingInstance.play()

const supersampling = 4

while (!window.destroyed) {
	// Read new audio samples
	{
		const { queued } = recordingInstance
		if (queued === 0) {
			await setTimeout(1)
			continue
		}
		audioBuffer.copy(audioBuffer, 0, queued)
		recordingInstance.dequeue(audioBuffer.slice(-queued))
	}

	// Render
	{
		ctx.clearRect(0, 0, width, height)
		ctx.fillStyle = 'white'

		ctx.save()
		ctx.translate(0, height / 2)
		ctx.scale(1, -height / 2)
		ctx.lineWidth = 1 / width
		{
			let min = 0
			let max = 0
			let lastX = -1
			for (let i = 0; i < numSamples; i++) {
				const x = Math.floor((i / numSamples) * width * supersampling)

				if (x > lastX) {
					const y = (min - zeroSampleValue) / amplitude
					const h = (max - min) / amplitude
					ctx.fillRect(lastX / supersampling, y, 1, Math.max(1 / height, h))
					lastX = x
					min = Infinity
					max = -Infinity
				}

				const sample = recordingInstance.readSample(audioBuffer, i * bytesPerSample)
				max = Math.max(max, sample)
				min = Math.min(min, sample)
			}
		}
		ctx.restore()

		const pixelBuffer = canvas.toBuffer('raw')
		window.render(width, height, width * 4, 'bgra32', pixelBuffer)
	}

	await setTimeout(0)
}
