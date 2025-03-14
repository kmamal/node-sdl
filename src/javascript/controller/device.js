
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
		name: controllerName,
		type: controllerType,
	}
}

const compare = (a, b) => a.id - b.id

const filter = (device) => device.isController

module.exports = {
	make,
	compare,
	filter,
}
