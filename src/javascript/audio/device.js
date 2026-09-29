const Globals = require('../globals')
const Bindings = require('../bindings')

const closedFormat = {
	format: null,
	channels: null,
	frequency: null,
	buffered: null,
}

const make = (device) => ({ ...device, ...closedFormat })

const makeDefault = () => make({ id: null, name: null })

const update = (device) => {
	let stream = null
	for (const candidate of Globals.audioStreams.values()) {
		if (candidate._device === device) {
			stream = candidate
			break
		}
	}

	if (!stream) {
		Object.assign(device, closedFormat)
		return
	}

	try { Object.assign(device, Bindings.audio_getDeviceFormat(stream._id)) }
	catch (_) {}
}

module.exports = {
	make,
	makeDefault,
	update,
}
