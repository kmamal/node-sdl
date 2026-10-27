const Bindings = require('../bindings')
const Enums = require('../enums')

const unknownFormat = {
	format: null,
	channels: null,
	frequency: null,
	buffered: null,
}

const make = (device) => ({ id: null, name: null, ...unknownFormat, ...device })

const makeDefault = (recording) => {
	const device = make({})
	Object.defineProperty(device, '_realId', {
		value: recording ? Enums.audioDevice.defaultRecording : Enums.audioDevice.defaultPlayback,
	})
	update(device)
	return device
}

const update = (device) => {
	try { Object.assign(device, Bindings.audio_getDeviceFormat(device.id ?? device._realId)) }
	catch (_) {}
}

module.exports = {
	make,
	makeDefault,
	update,
}
