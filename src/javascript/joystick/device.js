import Enums from '../enums.js'

export const make = (device) => {
	const { type } = device
	device.type = Enums.joystickTypeNames[type]
	delete device.isController
	delete device.mapping
}

export const compare = (a, b) => a.id - b.id
