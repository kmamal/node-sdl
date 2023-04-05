const { isMainThread } = require('worker_threads')
if (!isMainThread) { throw new Error('@kmamal/sdl can only be used in the main thread') }

const Bindings = require('./bindings')

const info = Bindings.initialize()

const { video } = require('./video')
const { keyboard } = require('./keyboard')
const { mouse } = require('./mouse')
const { joystick } = require('./joystick')
const { controller } = require('./controller')
const { audio } = require('./audio')
const { clipboard } = require('./clipboard')

require('./events')
require('./cleanup')

module.exports = {
	info,
	video,
	keyboard,
	mouse,
	joystick,
	controller,
	audio,
	clipboard,
}
