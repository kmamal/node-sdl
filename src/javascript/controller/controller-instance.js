const Bindings = require('../bindings')
const Enums = require('../enums')
const Globals = require('../globals')
const { EventsViaPoll } = require('../events/events-via-poll')

const validEvents = [
	'axisMotion',
	'buttonDown',
	'buttonUp',
	'remap',
	'close',
]

class ControllerInstance extends EventsViaPoll {
	constructor (device) {
		super(validEvents)

		const result = Bindings.controller_open(device._index)

		this._firmwareVersion = result.firmwareVersion
		this._serialNumber = result.serialNumber
		this._hasLed = result.hasLed
		this._hasRumble = result.hasRumble
		this._hasRumbleTriggers = result.hasRumbleTriggers
		this._axes = result.axes
		this._buttons = result.buttons

		this._device = device

		this._rumbleTimeout = null
		this._rumbleTriggersTimeout = null
		this._closed = false

		Globals.controllerInstances.all.add(this)
		let collection = Globals.controllerInstances.byId.get(this._device.id)
		if (!collection) {
			collection = new Set()
			Globals.controllerInstances.byId.set(this._device.id, collection)
		}
		collection.add(this)
	}

	get device () { return this._device }
	get firmwareVersion () { return this._firmwareVersion }
	get serialNumber () { return this._serialNumber }

	get axes () { return this._axes }
	get buttons () { return this._buttons }

	get power () {
		const power = Bindings.joystick_getPower(this._device.id)
		return Enums.powerLevelNames[power]
	}

	setPlayer (player) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!Number.isFinite(player)) { throw Object.assign(new Error("player must be a number"), { player }) }
		if (player < 0) { throw Object.assign(new Error("player must be non-negative"), { player }) }

		Bindings.joystick_setPlayer(this._device.id, player)
	}

	get hasLed () { return this._hasLed }
	setLed (red, green, blue) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!Number.isFinite(red)) { throw Object.assign(new Error("red must be a number"), { red }) }
		if (red < 0 || red > 1) { throw Object.assign(new Error("red must be between 0 and 1"), { red }) }
		if (!Number.isFinite(green)) { throw Object.assign(new Error("green must be a number"), { green }) }
		if (green < 0 || green > 1) { throw Object.assign(new Error("green must be between 0 and 1"), { green }) }
		if (!Number.isFinite(blue)) { throw Object.assign(new Error("blue must be a number"), { blue }) }
		if (blue < 0 || blue > 1) { throw Object.assign(new Error("blue must be between 0 and 1"), { blue }) }

		Bindings.joystick_setLed(this._device.id, red, green, blue)
	}

	get hasRumble () { return this._hasRumble }
	rumble (lowFreqRumble = 1, highFreqRumble = 1, duration = 1e3) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!Number.isFinite(lowFreqRumble)) { throw Object.assign(new Error("lowFreqRumble must be a number"), { lowFreqRumble }) }
		if (lowFreqRumble < 0 || lowFreqRumble > 1) { throw Object.assign(new Error("lowFreqRumble must be between 0 and 1"), { lowFreqRumble }) }
		if (!Number.isFinite(highFreqRumble)) { throw Object.assign(new Error("highFreqRumble must be a number"), { highFreqRumble }) }
		if (highFreqRumble < 0 || highFreqRumble > 1) { throw Object.assign(new Error("highFreqRumble must be between 0 and 1"), { highFreqRumble }) }
		if (!Number.isFinite(duration)) { throw Object.assign(new Error("duration must be a number"), { duration }) }

		Globals.events.poll()
		Bindings.joystick_rumble(this._device.id, lowFreqRumble, highFreqRumble, duration)
		clearTimeout(this._rumbleTimeout)
		this._rumbleTimeout = setTimeout(() => { this.stopRumble() }, duration)
	}

	stopRumble () {
		clearTimeout(this._rumbleTimeout)
		this._rumbleTimeout = null
		Bindings.joystick_rumble(this._device.id, 0, 0, 0)
		Globals.events.poll()
	}

	get hasRumbleTriggers () { return this._hasRumbleTriggers }
	rumbleTriggers (leftRumble = 1, rightRumble = 1, duration = 1e3) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!Number.isFinite(leftRumble)) { throw Object.assign(new Error("leftRumble must be a number"), { leftRumble }) }
		if (leftRumble < 0 || leftRumble > 1) { throw Object.assign(new Error("leftRumble must be between 0 and 1"), { leftRumble }) }
		if (!Number.isFinite(rightRumble)) { throw Object.assign(new Error("rightRumble must be a number"), { rightRumble }) }
		if (rightRumble < 0 || rightRumble > 1) { throw Object.assign(new Error("rightRumble must be between 0 and 1"), { rightRumble }) }
		if (!Number.isFinite(duration)) { throw Object.assign(new Error("duration must be a number"), { duration }) }

		Globals.events.poll()
		Bindings.joystick_rumbleTriggers(this._device.id, leftRumble, rightRumble, duration)
		clearTimeout(this._rumbleTriggersTimeout)
		this._rumbleTriggersTimeout = setTimeout(() => { this.stopRumble() }, duration)
	}

	stopRumbleTriggers () {
		clearTimeout(this._rumbleTriggersTimeout)
		this._rumbleTriggersTimeout = null
		Bindings.joystick_rumbleTriggers(this._device.id, 0, 0, 0)
		Globals.events.poll()
	}

	get closed () { return this._closed }
	close () {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		this.emit('close')
		this.removeAllListeners()
		this._closed = true

		Globals.controllerInstances.all.delete(this)
		const collection = Globals.controllerInstances.byId.get(this._device.id)
		collection.delete(this)
		if (collection.size === 0) {
			Bindings.controller_close(this._device.id)
			Globals.controllerInstances.byId.delete(this._device.id)
		}
	}
}

module.exports = { ControllerInstance }
