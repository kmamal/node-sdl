const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { validateNotClosed, validateObject } = require('../validate')
const { startEffect, stopEffect, releaseDevice, setPlayer, validateRumble, validateLed, validatePlayer } = require('./shared')

const validEvents = [
	'axisMotion',
	'ballMotion',
	'buttonDown',
	'buttonUp',
	'hatMotion',
	'powerUpdate',
	'close',
]

class JoystickInstance extends EventsViaPoll {
	constructor (requested) {
		super(validEvents)

		Globals.events.poll()
		validateObject('device', requested)
		const device = Globals.joystickDevices.find(({ id }) => id === requested.id)
		if (!device) { throw Object.assign(new Error("device must be from sdl.joystick.devices"), { device: requested }) }

		const result = Bindings.joystick_open(device.id)

		this._firmwareVersion = result.firmwareVersion
		this._serialNumber = result.serialNumber
		this._axes = result.axes
		this._balls = result.balls
		this._buttons = result.buttons
		this._hats = result.hats
		this._power = result.power

		this._device = device

		this._closed = false

		Globals.joystickInstances.all.add(this)
		let collection = Globals.joystickInstances.byId.get(this._device.id)
		if (!collection) {
			collection = new Set()
			Globals.joystickInstances.byId.set(this._device.id, collection)
		}
		collection.add(this)
	}

	get device () { return this._device }
	get firmwareVersion () { return this._firmwareVersion }
	get serialNumber () { return this._serialNumber }

	get axes () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._axes
	}

	get balls () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._balls
	}

	get buttons () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._buttons
	}

	get hats () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._hats
	}

	get power () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._power
	}

	setPlayer (player) {
		validateNotClosed(this)

		validatePlayer(player)

		setPlayer(this._device.id, player)
	}

	resetPlayer () {
		validateNotClosed(this)

		setPlayer(this._device.id, -1)
	}

	get hasLed () {
		Globals.events.poll()
		validateNotClosed(this)

		return Bindings.joystick_getCapabilities(this._device.id).hasLed
	}

	setLed (red, green, blue) {
		validateNotClosed(this)

		validateLed(red, green, blue)

		if (!this.hasLed) { throw Object.assign(new Error("device has no led"), { id: this._device.id }) }

		Bindings.joystick_setLed(this._device.id, red, green, blue)
	}

	get hasRumble () {
		Globals.events.poll()
		validateNotClosed(this)

		return Bindings.joystick_getCapabilities(this._device.id).hasRumble
	}

	rumble (lowFreqRumble = 1, highFreqRumble = 1, duration = null) {
		validateNotClosed(this)

		validateRumble('lowFreqRumble', lowFreqRumble, 'highFreqRumble', highFreqRumble, duration)

		if (!this.hasRumble) { throw Object.assign(new Error("device has no rumble"), { id: this._device.id }) }

		startEffect('rumble', this._device.id, lowFreqRumble, highFreqRumble, duration)
	}

	stopRumble () {
		validateNotClosed(this)

		if (!this.hasRumble) { throw Object.assign(new Error("device has no rumble"), { id: this._device.id }) }

		stopEffect('rumble', this._device.id)
	}

	get hasRumbleTriggers () {
		Globals.events.poll()
		validateNotClosed(this)

		return Bindings.joystick_getCapabilities(this._device.id).hasRumbleTriggers
	}

	rumbleTriggers (leftRumble = 1, rightRumble = 1, duration = null) {
		validateNotClosed(this)

		validateRumble('leftRumble', leftRumble, 'rightRumble', rightRumble, duration)

		if (!this.hasRumbleTriggers) { throw Object.assign(new Error("device has no trigger rumble"), { id: this._device.id }) }

		startEffect('rumbleTriggers', this._device.id, leftRumble, rightRumble, duration)
	}

	stopRumbleTriggers () {
		validateNotClosed(this)

		if (!this.hasRumbleTriggers) { throw Object.assign(new Error("device has no trigger rumble"), { id: this._device.id }) }

		stopEffect('rumbleTriggers', this._device.id)
	}

	get closed () { return this._closed }
	close () {
		validateNotClosed(this)

		this._closed = true

		Globals.joystickInstances.all.delete(this)
		const collection = Globals.joystickInstances.byId.get(this._device.id)
		collection.delete(this)
		if (collection.size === 0) { Globals.joystickInstances.byId.delete(this._device.id) }
		releaseDevice(this._device.id)

		// This call could throw if the device is gone
		try { Bindings.joystick_close(this._device.id) }
		catch (_) {}

		// We might be inside an event listener
		this._retire(() => Object.assign(new Error("instance is closed"), { id: this._device.id }))

		Globals.events.withoutPolling(() => {
			try { this.emit('close', { type: 'close' }) }
			catch (error) { this.emit('error', error) }
		})
	}
}

module.exports = { JoystickInstance }
