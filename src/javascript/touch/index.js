const Globals = require('../globals')
const { assertInitialized } = require('../subsystems')
const { refreshDevices } = require('./devices')


if (Globals.info.initialized.video) { refreshDevices() }


const touch = {
	get devices () {
		assertInitialized('video')
		return [ ...refreshDevices() ]
	},
}

module.exports = { touch }
