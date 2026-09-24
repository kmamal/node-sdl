
const make = (device) => {
	const {
		isGamepad,
		gamepadMapping,
		gamepadName,
		gamepadType,
		...rest
	} = device
	return {
		...rest,
		mapping: gamepadMapping,
		name: gamepadName ?? rest.name,
		type: gamepadType,
	}
}

const filter = (device) => device.isGamepad

module.exports = {
	make,
	filter,
}
