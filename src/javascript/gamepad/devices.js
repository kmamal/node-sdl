const makeDevice = (device) => {
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

const isGamepadDevice = (device) => device.isGamepad

module.exports = {
	makeDevice,
	isGamepadDevice,
}
