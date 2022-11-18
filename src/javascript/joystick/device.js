const Enums = require('../enums')

const make = (device) => {
	const { type } = device
	device.type = Enums.joystickTypeNames[type]
	delete device.isController
	delete device.mapping
}

const compare = (a, b) => a.id - b.id

module.exports = {
	make,
	compare,
}
