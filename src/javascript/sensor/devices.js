const Globals = require('../globals')
const Bindings = require('../bindings')

const refreshDevices = () => {
	const devices = Bindings.sensor_getDevices()

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
