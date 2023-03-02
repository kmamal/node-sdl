const make = (device) => {
	delete device.type
	delete device.isController
}

const compare = (a, b) => a.id - b.id

const filter = (device) => device.isController

export default {
	make,
	compare,
	filter,
}
