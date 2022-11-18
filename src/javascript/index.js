const { isMainThread } = require('worker_threads')
if (!isMainThread) { throw new Error('@kmamal/sdl can only be used in the main thread') }

const Bindings = require('./bindings')

const info = Bindings.initialize()

const { sdl } = require('./sdl')
const { video } = require('./video')
const { keyboard } = require('./keyboard')
const { mouse } = require('./mouse')
const { joystick } = require('./joystick')
const { controller } = require('./controller')
const { audio } = require('./audio')
const { clipboard } = require('./clipboard')

sdl.info = info
sdl.video = video
sdl.keyboard = keyboard
sdl.mouse = mouse
sdl.joystick = joystick
sdl.controller = controller
sdl.audio = audio
sdl.clipboard = clipboard

require('./events')
require('./audio/prevent-exit')
require('./cleanup')

module.exports = sdl
