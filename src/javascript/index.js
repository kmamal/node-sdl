const { isMainThread } = require('node:worker_threads')
if (!isMainThread) { throw new Error("@kmamal/sdl can only be used in the main thread, import @kmamal/sdl/worker in workers") }

const Bindings = require('./bindings')
const Globals = require('./globals')

const { installLazyFlags, loadJoystickModules, loadSensorModule } = require('./subsystems')

const info = Bindings.global_initialize()
installLazyFlags(info.initialized)
Globals.info = info

const { video } = require('./video')
const { keyboard } = require('./keyboard')
const { mouse } = require('./mouse')
const { touch } = require('./touch')
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
	get joystick () { return loadJoystickModules().joystick },
	get gamepad () { return loadJoystickModules().gamepad },
	get sensor () { return loadSensorModule() },
	audio,
	clipboard,
	power,
}
