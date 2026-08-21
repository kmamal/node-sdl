
// SDL2 identifies audio devices only by name; identical devices get equal
// names and are told apart by list order in reconciliation.
const keys = [
	(device) => device.name,
]

module.exports = { keys }
