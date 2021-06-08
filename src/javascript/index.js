const Bindings = require('./bindings')

const info = Bindings.initialize()

const { sdl } = require('./sdl')
const { video } = require('./video')
const { audio } = require('./audio')
const { keyboard } = require('./keyboard')
const { mouse } = require('./mouse')
const { clipboard } = require('./clipboard')

sdl.info = info
sdl.video = video
sdl.audio = audio
sdl.keyboard = keyboard
sdl.mouse = mouse
sdl.clipboard = clipboard

require('./events')
require('./audio/prevent-exit')
require('./cleanup')

module.exports = sdl
