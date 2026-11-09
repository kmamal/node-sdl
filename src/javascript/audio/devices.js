const Globals = require('../globals')
const Bindings = require('../bindings')

const refreshDevices = () => {
	Globals.audioDevices.playback = Bindings.audio_getDevices(false)
	Globals.audioDevices.recording = Bindings.audio_getDevices(true)
}

module.exports = {
	refreshDevices,
}
