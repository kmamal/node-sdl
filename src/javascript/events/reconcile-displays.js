const Globals = require('../globals')
const { reconcileDevices } = require('./reconcile')

const { video: videoModule } = require('../video')
const { compare: compareDisplays } = require('../video/display')

const reconcileDisplays = (displays) => {
	reconcileDevices(
		videoModule,
		Globals.displays,
		displays,
		compareDisplays,
		'display',
	)
}

module.exports = { reconcileDisplays }
