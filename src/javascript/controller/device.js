
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

const compare = (a, b) => a._index - b._index

const filter = (device) => device.isController

module.exports = {
	make,
	compare,
	filter,
}
