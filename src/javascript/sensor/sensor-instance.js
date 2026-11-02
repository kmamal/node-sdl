const Globals = require('../globals')
const Bindings = require('../bindings')
const { refreshDevices } = require('./devices')
const { EventsViaPoll } = require('../events/events-via-poll')
const { validateNotClosed, validateObject } = require('../validate')

const validEvents = [
	'update',
	'close',
]

class SensorInstance extends EventsViaPoll {
	constructor (requested) {
		super(validEvents)

		refreshDevices()
		validateObject('device', requested)
		const found = Globals.sensorDevices.find(({ id }) => id === requested.id)
		if (!found) { throw Object.assign(new Error("device must be from sdl.sensor.devices"), { device: requested }) }

		Bindings.sensor_open(found.id)

		this._device = found

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
		Globals.events.poll()
		validateNotClosed(this)

		return Bindings.sensor_getData(this._device.id)
	}

	get closed () { return this._closed }
	close () {
		validateNotClosed(this)

		this._closed = true

		Globals.sensorInstances.all.delete(this)
		const collection = Globals.sensorInstances.byId.get(this._device.id)
		collection.delete(this)
		if (collection.size === 0) {
			Globals.sensorInstances.byId.delete(this._device.id)
		}

		// This call could throw if the device is gone
		try { Bindings.sensor_close(this._device.id) }
		catch (_) {}

		// We might be inside an event listener
		this._retire(() => Object.assign(new Error("instance is closed"), { id: this._device.id }))

		Globals.events.withoutPolling(() => {
			try { this.emit('close', { type: 'close' }) }
			catch (error) { this.emit('error', error) }
		})
	}
}

module.exports = { SensorInstance }
