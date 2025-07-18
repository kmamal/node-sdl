import sdl from '@kmamal/sdl'
import path from 'node:path'
import { loadAudio } from './ffmpeg.js'

const channels = 1
const frequency = 48e3
const audioInstance = sdl.audio.openDevice({ type: 'playback' }, {
	channels,
	frequency,
	format: 'f32lsb',
})

const buffer = await loadAudio(
	path.join(import.meta.dirname, 'assets/audio.wav'),
	{ channels, frequency },
)

audioInstance.enqueue(buffer)
audioInstance.play()
