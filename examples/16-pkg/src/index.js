const sdl = require('@kmamal/sdl')
const path = require('path')
const fs = require('fs')
const bmp = require('bmp-js')

const bmpBuffer = fs.readFileSync(path.join(__dirname, '../assets/image.bmp'))
const { width, height, data } = bmp.decode(bmpBuffer)

const window = sdl.video.createWindow({ width, height })
window.render(width, height, width * 4, 'abgr32', data)
