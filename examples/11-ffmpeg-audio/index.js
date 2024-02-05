import sdl from '../../src/javascript/index.js'
import path from 'path'
import url from 'url'
import { loadAudio } from './ffmpeg.js'

const channels = 1
const frequency = 48e3
const audioInstance = sdl.audio.openDevice({ type: 'playback' }, {
	channels,
	frequency,
	format: 'f32lsb',
})

const dir = path.dirname(url.fileURLToPath(import.meta.url))
const buffer = await loadAudio(
	path.join(dir, 'assets/audio.wav'),
	{ channels, frequency },
)

audioInstance.enqueue(buffer)
audioInstance.play()
