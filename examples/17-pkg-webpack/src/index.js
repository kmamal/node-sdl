import sdl from '@kmamal/sdl'
import path from 'path'
import url from 'url'
import { loadBmp } from './bmp.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const imagePath = path.join(__dirname, '../assets/image.bmp')
const { width, height, data } = await loadBmp(imagePath)

const window = sdl.video.createWindow({ width, height })
window.render(width, height, width * 4, 'abgr32', data)
