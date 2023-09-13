const Bindings = require('../bindings')
const Globals = require('../globals')
const { EventsViaPoll } = require('../events/events-via-poll')

const validEvents = [
	'update',
	'close',
]

class SensorInstance extends EventsViaPoll {
	constructor (device) {
		super(validEvents)

		Bindings.sensor_open(device._index)

		this._device = device

		this._closed = false

		Globals.sensorInstances.all.add(this)
		let collection = Globals.sensorInstances.byId.get(this._device.id)
		if (!collection) {
			collection = new Set()
			Globals.sensorInstances.byId.set(this._device.id, collection)
		}
		collection.add(this)
	}

	get device () { return this._device }

	get data () {
		const data = Bindings.sensor_getData(this._device.id)
		if (data.timestamp === 0) { data.timestamp = null }
		return data
	}

	get closed () { return this._closed }
	close () {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		this.emit('close')
		this.removeAllListeners()
		this._closed = true

		Globals.sensorInstances.all.delete(this)
		const collection = Globals.sensorInstances.byId.get(this._device.id)
		collection.delete(this)
		if (collection.size === 0) {
			Bindings.sensor_close(this._device.id)
			Globals.sensorInstances.byId.delete(this._device.id)
		}
	}
}

module.exports = { SensorInstance }
