const { refreshDevices } = require('./devices')


refreshDevices()


const touch = {
	get devices () { return [ ...refreshDevices() ] },
}

module.exports = { touch }
