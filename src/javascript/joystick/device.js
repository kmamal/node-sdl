
const make = (device) => {
	const {
		isGamepad,
		gamepadMapping,
		gamepadName,
		gamepadType,
		...rest
	} = device
	return rest
}

module.exports = { make }
