const { isMainThread } = require('worker_threads')
if (!isMainThread) { throw new Error('@kmamal/sdl can only be used in the main thread') }

const Bindings = require('./bindings')

const info = Bindings.global_initialize()

const { video } = require('./video')
const { keyboard } = require('./keyboard')
const { mouse } = require('./mouse')
const { touch } = require('./touch')
const { joystick } = require('./joystick')
const { controller } = require('./controller')
const { sensor } = require('./sensor')
const { audio } = require('./audio')
const { clipboard } = require('./clipboard')
const { power } = require('./power')

require('./events')
require('./cleanup')

module.exports = {
	info,
	video,
	keyboard,
	mouse,
	touch,
	joystick,
	controller,
	sensor,
	audio,
	clipboard,
	power,
}
