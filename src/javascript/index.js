const { isMainThread } = require('node:worker_threads')
const Bindings = require('./bindings')
const Globals = require('./globals')

Globals.info = Bindings.global_initialize(isMainThread)

const { video } = require('./video')
const { keyboard } = require('./keyboard')
const { mouse } = require('./mouse')
const { touch } = require('./touch')
const { joystick } = require('./joystick')
const { gamepad } = require('./gamepad')
const { sensor } = require('./sensor')
const { audio } = require('./audio')
const { clipboard } = require('./clipboard')
const { power } = require('./power')

require('./events')

module.exports = {
	info: Globals.info,
	cleanup: require('./cleanup'),
	video,
	keyboard,
	mouse,
	touch,
	joystick,
	gamepad,
	sensor,
	audio,
	clipboard,
	power,
}
