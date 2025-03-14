
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

const compare = (a, b) => a.id - b.id

module.exports = {
	make,
	compare,
}
