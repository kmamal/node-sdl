const Globals = require('../globals')
const { audio: audioModule } = require('.')
const { makeDevice: makeAudioDevice } = require('./devices')
const { tryEmit, tryCall } = require('../events/try')

const handleEvent = (event) => {
	// Thread might not have initialized this subsystem
	if (!Globals.initialized.audio) { return }

	const { type, audioDeviceType, defaultDevice } = event
	delete event.audioDeviceType
	delete event.defaultDevice

	const list = Globals.audioDevices[audioDeviceType]
	const emitter = audioModule[audioDeviceType]

	switch (type) {
		case 'deviceAdd': {
			const { device } = event
			delete event.device

			if (list.some((a) => a.id === device.id)) { return }
			const made = makeAudioDevice(device)
			list.push(made)
			event.device = made
			Object.assign(list[0], defaultDevice)
		} break

		case 'deviceRemove': {
			const { deviceId } = event
			delete event.deviceId

			const logical = Globals.audioStreams.get(deviceId)
			if (logical) {
				tryCall(() => { logical.close() })
				return
			}

			const index = list.findIndex((a) => a.id === deviceId)
			if (index === -1) { return }
			const device = list[index]
			list.splice(index, 1)

			for (const stream of [ ...Globals.audioStreams.values() ]) {
				if (stream.device === device) {
					tryCall(() => { stream.close() })
				}
			}
			Object.assign(list[0], defaultDevice)

			event.device = device
		} break

		case 'deviceFormatChange': {
			const { deviceId, format } = event
			const device = Globals.audioStreams.get(deviceId)?.device
				?? list.find((a) => a.id === deviceId)
			if (device) { Object.assign(device, format) }
			Object.assign(list[0], defaultDevice)
		} return

		// No default
	}

	tryEmit(emitter, type, event)
}

module.exports = { handleEvent }
