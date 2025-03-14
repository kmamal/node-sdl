const Globals = require('../globals')
const { reconcileDevices } = require('./reconcile')

const { compare: compareDisplays } = require('../video/display')

const reconcileDisplays = (displays) => {
	reconcileDevices(
		require('../video').video,
		Globals.displays,
		displays,
		compareDisplays,
		'display',
	)
}

module.exports = { reconcileDisplays }
