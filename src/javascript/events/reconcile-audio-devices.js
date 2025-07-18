const Globals = require('../globals')
const { reconcileDevices } = require('./reconcile')

const { audio: audioModule } = require('../audio')
const { compare: compareAudioDevice } = require('../audio/device')

const reconcileAudioDevices = (audioDevices, audioDeviceType) => {
	reconcileDevices(
		audioModule,
		Globals.audioDevices[audioDeviceType],
		audioDevices,
		compareAudioDevice,
	)
}

module.exports = { reconcileAudioDevices }
