const Globals = require('../globals')
const { reconcileDevices } = require('./reconcile')

const { audio: audioModule } = require('../audio')
const { keys: audioDeviceKeys } = require('../audio/device')

const reconcileAudioDevices = (audioDevices, audioDeviceType) => {
	reconcileDevices(
		audioModule,
		Globals.audioDevices[audioDeviceType],
		audioDevices,
		audioDeviceKeys,
	)
}

module.exports = { reconcileAudioDevices }
