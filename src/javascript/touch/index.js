const Globals = require('../globals')
const Bindings = require('../bindings')


Globals.touchDevices = Bindings.touch_getDevices()


const touch = {
	get devices () {
		Globals.events.poll()
		return Globals.touchDevices
	},
}

module.exports = { touch }
