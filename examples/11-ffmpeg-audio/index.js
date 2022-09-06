import sdl from '@kmamal/sdl'
import path from 'path'
import { loadAudio } from './ffmpeg.js'

const playbackDevice = sdl.audio.devices.find((x) => x.recording === false)

const channels = 1
const frequency = 48e3
const audioInstance = sdl.audio.openDevice(playbackDevice, {
	channels,
	frequency,
	format: 'f32lsb',
})

const dir = path.dirname(import.meta.url)
const buffer = await loadAudio(
	path.join(dir, 'assets/audio.wav'),
	{ channels, frequency },
)

audioInstance.enqueue(buffer)
audioInstance.play()
