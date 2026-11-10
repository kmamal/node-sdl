const Globals = require('../globals')
const { tryEmit } = require('../events/try')

const handleEvent = (event, targetId) => {
	const { type } = event

	const collection = Globals.sensorInstances.byId.get(targetId)
	if (!collection) { return }

	switch (type) {
		case 'update': {
			for (const sensorInstance of collection) {
				tryEmit(sensorInstance, type, event)
			}
		} break

		// No default
	}
}

module.exports = { handleEvent }
