const { assertInitialized, isAvailable } = require('../subsystems')
const { refreshDevices } = require('./devices')
const { SensorInstance } = require('./sensor-instance')


const sensor = {
	STANDARD_GRAVITY: 9.80665,

	isAvailable () { return isAvailable('sensor') },

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
