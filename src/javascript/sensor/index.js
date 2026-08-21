const { refreshDevices } = require('./devices')
const { SensorInstance } = require('./sensor-instance')


const sensor = {
	STANDARD_GRAVITY: 9.80665,

	get devices () { return refreshDevices() },

	openDevice (device) { return new SensorInstance(device) },
}

module.exports = { sensor }
