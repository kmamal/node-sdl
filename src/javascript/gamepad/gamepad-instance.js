const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { startEffect, stopEffect, releaseDevice, setPlayer } = require('../joystick/shared')

const validEvents = [
	'axisMotion',
	'buttonDown',
	'buttonUp',
	'powerUpdate',
	'steamHandleUpdate',
	'remap',
	'close',
]

class GamepadInstance extends EventsViaPoll {
	constructor (device) {
		super(validEvents)

		Globals.events.poll()
		if (!Globals.gamepadDevices.includes(device)) { throw Object.assign(new Error("invalid device"), { device }) }

		const result = Bindings.gamepad_open(device.id)

		this._firmwareVersion = result.firmwareVersion
		this._serialNumber = result.serialNumber
		this._steamHandle = result.steamHandle
		this._power = result.power
		this._axes = result.axes
		this._buttons = result.buttons
		this._buttonLabels = result.buttonLabels

		this._device = device

		this._closed = false

		Globals.gamepadInstances.all.add(this)
		let collection = Globals.gamepadInstances.byId.get(this._device.id)
		if (!collection) {
			collection = new Set()
			Globals.gamepadInstances.byId.set(this._device.id, collection)
		}
		collection.add(this)
	}

	get device () { return this._device }
	get firmwareVersion () { return this._firmwareVersion }
	get serialNumber () { return this._serialNumber }

	get steamHandle () {
		Globals.events.poll()
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		return this._steamHandle
	}

	get axes () {
		Globals.events.poll()
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		return this._axes
	}

	get buttons () {
		Globals.events.poll()
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		return this._buttons
	}

	get buttonLabels () {
		Globals.events.poll()
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		return this._buttonLabels
	}

	get power () {
		Globals.events.poll()
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		return this._power
	}

	setPlayer (player) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!Number.isInteger(player)) { throw Object.assign(new Error("player must be an integer"), { player }) }
		if (player < 0 || player > 2 ** 31 - 1) { throw Object.assign(new Error("invalid player"), { player }) }

		setPlayer(this._device.id, player)
	}

	resetPlayer () {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		setPlayer(this._device.id, -1)
	}

	get hasLed () {
		Globals.events.poll()
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		return Bindings.joystick_getCapabilities(this._device.id).hasLed
	}
	setLed (red, green, blue) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!Number.isFinite(red)) { throw Object.assign(new Error("red must be a number"), { red }) }
		if (red < 0 || red > 1) { throw Object.assign(new Error("red must be between 0 and 1"), { red }) }
		if (!Number.isFinite(green)) { throw Object.assign(new Error("green must be a number"), { green }) }
		if (green < 0 || green > 1) { throw Object.assign(new Error("green must be between 0 and 1"), { green }) }
		if (!Number.isFinite(blue)) { throw Object.assign(new Error("blue must be a number"), { blue }) }
		if (blue < 0 || blue > 1) { throw Object.assign(new Error("blue must be between 0 and 1"), { blue }) }

		if (!this.hasLed) { throw Object.assign(new Error("device has no led"), { id: this._device.id }) }

		Bindings.joystick_setLed(this._device.id, red, green, blue)
	}

	get hasRumble () {
		Globals.events.poll()
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		return Bindings.joystick_getCapabilities(this._device.id).hasRumble
	}
	rumble (lowFreqRumble = 1, highFreqRumble = 1, duration = null) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!Number.isFinite(lowFreqRumble)) { throw Object.assign(new Error("lowFreqRumble must be a number"), { lowFreqRumble }) }
		if (lowFreqRumble < 0 || lowFreqRumble > 1) { throw Object.assign(new Error("lowFreqRumble must be between 0 and 1"), { lowFreqRumble }) }
		if (!Number.isFinite(highFreqRumble)) { throw Object.assign(new Error("highFreqRumble must be a number"), { highFreqRumble }) }
		if (highFreqRumble < 0 || highFreqRumble > 1) { throw Object.assign(new Error("highFreqRumble must be between 0 and 1"), { highFreqRumble }) }
		if (duration !== null) {
			if (!Number.isInteger(duration)) { throw Object.assign(new Error("duration must be an integer"), { duration }) }
			if (duration < 1 || duration > 2 ** 31 - 1) { throw Object.assign(new Error("invalid duration"), { duration }) }
		}

		if (!this.hasRumble) { throw Object.assign(new Error("device has no rumble"), { id: this._device.id }) }

		startEffect('rumble', this._device.id, lowFreqRumble, highFreqRumble, duration)
	}

	stopRumble () {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!this.hasRumble) { throw Object.assign(new Error("device has no rumble"), { id: this._device.id }) }

		stopEffect('rumble', this._device.id)
	}

	get hasRumbleTriggers () {
		Globals.events.poll()
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		return Bindings.joystick_getCapabilities(this._device.id).hasRumbleTriggers
	}
	rumbleTriggers (leftRumble = 1, rightRumble = 1, duration = null) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!Number.isFinite(leftRumble)) { throw Object.assign(new Error("leftRumble must be a number"), { leftRumble }) }
		if (leftRumble < 0 || leftRumble > 1) { throw Object.assign(new Error("leftRumble must be between 0 and 1"), { leftRumble }) }
		if (!Number.isFinite(rightRumble)) { throw Object.assign(new Error("rightRumble must be a number"), { rightRumble }) }
		if (rightRumble < 0 || rightRumble > 1) { throw Object.assign(new Error("rightRumble must be between 0 and 1"), { rightRumble }) }
		if (duration !== null) {
			if (!Number.isInteger(duration)) { throw Object.assign(new Error("duration must be an integer"), { duration }) }
			if (duration < 1 || duration > 2 ** 31 - 1) { throw Object.assign(new Error("invalid duration"), { duration }) }
		}

		if (!this.hasRumbleTriggers) { throw Object.assign(new Error("device has no trigger rumble"), { id: this._device.id }) }

		startEffect('rumbleTriggers', this._device.id, leftRumble, rightRumble, duration)
	}

	stopRumbleTriggers () {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!this.hasRumbleTriggers) { throw Object.assign(new Error("device has no trigger rumble"), { id: this._device.id }) }

		stopEffect('rumbleTriggers', this._device.id)
	}

	get closed () { return this._closed }
	close () {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		this._closed = true

		Globals.gamepadInstances.all.delete(this)
		const collection = Globals.gamepadInstances.byId.get(this._device.id)
		collection.delete(this)
		if (collection.size === 0) {
			Globals.gamepadInstances.byId.delete(this._device.id)
		}
		releaseDevice(this._device.id)

		// This call could throw if the device is gone
		try { Bindings.gamepad_close(this._device.id) }
		catch (_) {}

		// We might be inside an event listener
		this._retire(() => Object.assign(new Error("instance is closed"), { id: this._device.id }))

		try { this.emit('close', { type: 'close' }) }
		catch (error) { this.emit('error', error) }
	}
}

module.exports = { GamepadInstance }
