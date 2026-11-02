const Globals = require('../globals')
const Bindings = require('../bindings')

const unknownFormat = {
	format: null,
	channels: null,
	frequency: null,
	buffered: null,
}

const makeDevice = (device) => ({ id: null, name: null, ...unknownFormat, ...device })

const refreshDevices = () => {
	Globals.audioDevices.playback = Bindings.audio_getDevices(false).map(makeDevice)
	Globals.audioDevices.recording = Bindings.audio_getDevices(true).map(makeDevice)
}

module.exports = {
	makeDevice,
	refreshDevices,
}
