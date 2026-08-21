const Globals = require('../globals')
const Bindings = require('../bindings')


Globals.touchDevices = Bindings.touch_getDevices()


const touch = {
	get devices () {
		// SDL emits no touch hot-plug events, so polling can't refresh the list
		Globals.touchDevices = Bindings.touch_getDevices()
		return Globals.touchDevices
	},
}

module.exports = { touch }
