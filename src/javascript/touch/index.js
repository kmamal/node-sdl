const { assertInitialized, isAvailable } = require('../subsystems')
const { refreshDevices } = require('./devices')


const touch = {
	isAvailable () { return isAvailable('video') },

	get devices () {
		assertInitialized('video')
		return [ ...refreshDevices() ]
	},
}

module.exports = { touch }
