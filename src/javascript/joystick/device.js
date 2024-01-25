
const make = (device) => {
	delete device.isController
	delete device.mapping
}

const compare = (a, b) => a.id - b.id

module.exports = {
	make,
	compare,
}
