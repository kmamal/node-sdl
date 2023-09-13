const Bindings = require('../bindings')
const { SensorInstance } = require('./sensor-instance')


const sensor = {
	STANDARD_GRAVITY: 9.80665,

	get devices () {
		const devices = Bindings.sensor_getDevices()
		for (const sensorDevice of devices) {
			const { type } = sensorDevice
			sensorDevice.type
				= type.startsWith('accelerometer') ? 'accelerometer'
				: type.startsWith('gyroscope') ? 'gyroscope'
				: 'unknown'
			sensorDevice.side
				= type.endsWith('Left') ? 'left'
				: type.endsWith('Right') ? 'right'
				: null
		}
		return devices
	},

	openDevice (device) { return new SensorInstance(device) },
}

module.exports = { sensor }
