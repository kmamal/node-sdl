
const make = (device) => {
	const {
		isController,
		controllerMapping,
		controllerName,
		controllerType,
		...rest
	} = device
	return {
		...rest,
		mapping: controllerMapping,
		name: controllerName ?? rest.name,
		type: controllerType,
	}
}

const keys = [
	(device) => device.id,
]

const filter = (device) => device.isController

module.exports = {
	make,
	keys,
	filter,
}
