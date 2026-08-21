const Globals = require('../globals')
const Bindings = require('../bindings')

// SDL emits no sensor hot-plug events, so the list must be refetched on
// every use
const refreshDevices = () => {
	const devices = Bindings.sensor_getDevices()

	// Keep returning the same objects so that devices obtained from
	// earlier reads remain valid arguments to openDevice()
	const oldDevices = Globals.sensorDevices
	Globals.sensorDevices = devices.map((sensorDevice) => {
		const oldDevice = oldDevices.find(({ id }) => id === sensorDevice.id)
		return oldDevice
			? Object.assign(oldDevice, sensorDevice)
			: sensorDevice
	})
	return Globals.sensorDevices
}

module.exports = { refreshDevices }
