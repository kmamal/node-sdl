const { assertInitialized } = require('../subsystems')
const { refreshDevices } = require('./devices')
const { SensorInstance } = require('./sensor-instance')


const sensor = {
	STANDARD_GRAVITY: 9.80665,

	get devices () {
		assertInitialized('sensor')
		return [ ...refreshDevices() ]
	},

	openDevice (device) {
		assertInitialized('sensor')
		return new SensorInstance(device)
	},
}

module.exports = { sensor }
