const Enums = require('../enums')

const make = (device) => {
	const { type } = device
	device.type = Enums.joystickTypeNames[type]
	delete device.isController
}

const compare = (a, b) => a.id - b.id

const filter = (device) => device.isController

module.exports = {
	make,
	compare,
	filter,
}
