const Globals = require('../globals')
const Bindings = require('../bindings')
const { SensorInstance } = require('./sensor-instance')


const sensor = {
	STANDARD_GRAVITY: 9.80665,

	get devices () {
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
	},

	openDevice (device) { return new SensorInstance(device) },
}

module.exports = { sensor }
