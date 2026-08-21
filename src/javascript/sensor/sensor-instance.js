const Globals = require('../globals')
const Bindings = require('../bindings')
const { refreshDevices } = require('./devices')
const { EventsViaPoll } = require('../events/events-via-poll')

const validEvents = [
	'update',
	'close',
]

class SensorInstance extends EventsViaPoll {
	constructor (device) {
		super(validEvents)

		// Refetch so a stale device or _index isn't used
		refreshDevices()
		if (!Globals.sensorDevices.includes(device)) { throw Object.assign(new Error("invalid device"), { device }) }

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
		// SDL only refreshes sensor values inside the event pump. The closed
		// check runs after polling, since the poll can process an event whose
		// handler closes this instance
		Globals.events.poll()
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		return Bindings.sensor_getData(this._device.id)
	}

	get closed () { return this._closed }
	close () {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		this._closed = true

		Globals.sensorInstances.all.delete(this)
		const collection = Globals.sensorInstances.byId.get(this._device.id)
		collection.delete(this)
		if (collection.size === 0) {
			Globals.sensorInstances.byId.delete(this._device.id)
		}

		// SDL open/close calls are reference-counted per instance
		Bindings.sensor_close(this._device.id)

		// Emitted last so a throwing listener can't leave the teardown half-done
		this.emit('close', { type: 'close' })
		this.removeAllListeners()
	}
}

module.exports = { SensorInstance }
