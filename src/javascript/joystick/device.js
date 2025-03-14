
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

const compare = (a, b) => a._index - b._index

module.exports = {
	make,
	compare,
}
