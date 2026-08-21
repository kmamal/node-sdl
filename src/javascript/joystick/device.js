
const make = (device) => {
	const {
		isController,
		controllerMapping,
		controllerName,
		controllerType,
		...rest
	} = device
	return rest
}

const keys = [
	(device) => device.id,
]

module.exports = {
	make,
	keys,
}
