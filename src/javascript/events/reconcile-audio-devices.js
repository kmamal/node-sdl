const Globals = require('../globals')
const { reconcileDevices } = require('./reconcile')

const { compare: compareAudioDevice } = require('../audio/device')

const reconcileAudioDevices = (audioDevices, audioDeviceType) => {
	reconcileDevices(
		require('../audio').audio,
		Globals.audioDevices[audioDeviceType],
		audioDevices,
		compareAudioDevice,
	)
}

module.exports = { reconcileAudioDevices }
