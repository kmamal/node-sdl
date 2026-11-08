const Globals = require('../globals')
const Bindings = require('../bindings')
const { refreshDevices } = require('./devices')
const { DeviceInstance, lookupDevice } = require('../device-instance')
const { validateNotClosed } = require('../validate')

const validEvents = [
	'update',
	'close',
]

class SensorInstance extends DeviceInstance {
	constructor (requested) {
		const device = lookupDevice(requested, 'sensor', refreshDevices)

		Bindings.sensor_open(device.id)

		super(validEvents, device, Globals.sensorInstances, Bindings.sensor_close)
	}

	get data () {
		Globals.events.poll()
		validateNotClosed(this)

		return Bindings.sensor_getData(this._device.id)
	}
}

module.exports = { SensorInstance }
