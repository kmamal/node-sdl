const Globals = require('./globals')
const { EventsViaPoll } = require('./events/events-via-poll')
const { validateNotClosed, validateObject } = require('./validate')

const lookupDevice = (requested, name, getDevices) => {
	validateObject('device', requested)

	Globals.events.poll()

	const device = getDevices().find(({ id }) => id === requested.id)
	if (!device) { throw Object.assign(new Error(`device must be from sdl.${name}.devices`), { device: requested }) }
	return device
}

class DeviceInstance extends EventsViaPoll {
	constructor (validEvents, device, instances, closeBinding) {
		super(validEvents)

		this._device = device
		this._instances = instances
		this._closeBinding = closeBinding

		this._closed = false

		instances.all.add(this)
		const collection = instances.byId.get(device.id) ?? new Set()
		instances.byId.set(device.id, collection)
		collection.add(this)
	}

	get device () { return this._device }

	_beforeCloseBinding () {}

	get closed () { return this._closed }
	close () {
		validateNotClosed(this)

		this._closed = true

		this._instances.all.delete(this)
		const collection = this._instances.byId.get(this._device.id)
		collection.delete(this)
		if (collection.size === 0) { this._instances.byId.delete(this._device.id) }
		this._beforeCloseBinding()

		// This call could throw if the device is gone
		try { this._closeBinding(this._device.id) }
		catch (_) {}

		// We might be inside an event listener
		this._retire(() => Object.assign(new Error("instance is closed"), { id: this._device.id }))

		Globals.events.withoutPolling(() => {
			try { this.emit('close', { type: 'close' }) }
			catch (error) { this.emit('error', error) }
		})
	}
}

module.exports = { DeviceInstance, lookupDevice }
