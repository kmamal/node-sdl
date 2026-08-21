const Globals = require('../globals')
const { reconcileDevices } = require('./reconcile')

const { video: videoModule } = require('../video')
const { keys: displayKeys } = require('../video/display')

const reconcileDisplays = (displays) => {
	reconcileDevices(
		videoModule,
		Globals.displays,
		displays,
		displayKeys,
		'display',
	)
}

module.exports = { reconcileDisplays }
