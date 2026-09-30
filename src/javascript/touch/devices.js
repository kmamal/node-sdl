const Globals = require('../globals')
const Bindings = require('../bindings')

const refreshDevices = () => {
	const devices = Bindings.touch_getDevices()

	const oldDevices = Globals.touchDevices
	Globals.touchDevices = devices.map((touchDevice) => {
		const oldDevice = oldDevices.find(({ id }) => id === touchDevice.id)
		return oldDevice
			? Object.assign(oldDevice, touchDevice)
			: touchDevice
	})
	return Globals.touchDevices
}

module.exports = { refreshDevices }
