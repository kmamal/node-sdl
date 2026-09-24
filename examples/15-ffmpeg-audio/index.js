import sdl from '@kmamal/sdl'
import path from 'node:path'
import { loadAudio } from './ffmpeg.js'

const channels = 1
const frequency = 48e3
const playbackStream = sdl.audio.playback.openDevice(null, {
	channels,
	frequency,
	format: 'f32le',
})

const buffer = await loadAudio(
	path.join(import.meta.dirname, 'assets/audio.wav'),
	{ channels, frequency },
)

playbackStream.putData(buffer)
playbackStream.play()
