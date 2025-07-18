import sdl from '@kmamal/sdl'
import path from 'node:path'
import { loadBmp } from './bmp.js'

const imagePath = path.join(import.meta.dirname, '../assets/image.bmp')
const { width, height, data } = await loadBmp(imagePath)

const window = sdl.video.createWindow({ width, height })
window.render(width, height, width * 4, 'abgr32', data)
