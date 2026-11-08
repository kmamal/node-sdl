const Globals = require('../globals')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { validateNotClosed, validateNumberRange, validateNonNegativeInt32 } = require('../validate')
const { refreshAndBroadcast } = require('./devices')

const MAX_DURATION = 0xFFFF

const effects = {
	rumble: {
		call: Bindings.joystick_rumble,
		capability: 'hasRumble',
		missing: "device has no rumble",
		timers: new Map(),
	},
	rumbleTriggers: {
		call: Bindings.joystick_rumbleTriggers,
		capability: 'hasRumbleTriggers',
		missing: "device has no trigger rumble",
		timers: new Map(),
	},
}

const validateUnit = (name, value) => { validateNumberRange(name, value, 0, 1) }

const clearTimers = (effect, id) => {
	for (const timer of effect.timers.get(id) ?? []) { clearTimeout(timer) }
	effect.timers.delete(id)
}

const stopEffect = (effect, id) => {
	clearTimers(effect, id)
	effect.call(id, 0, 0, 0)
}

const startEffect = (effect, id, _a, _b, duration) => {
	if (duration === 0) {
		stopEffect(effect, id)
		Globals.events.poll()
		return
	}

	const a = Math.round(_a * 0xFFFF)
	const b = Math.round(_b * 0xFFFF)
	effect.call(id, a, b, MAX_DURATION)

	clearTimers(effect, id)

	// Zero intensity stops the effect, so there is nothing to wait for
	if (a === 0 && b === 0) { return }

	// Keeps Node.js alive while rumbling
	const timers = []
	if (duration === null || duration > MAX_DURATION) {
		timers.push(setInterval(() => {
			try { effect.call(id, a, b, MAX_DURATION) }
			catch (_) { clearTimers(effect, id) }
		}, 30e3))
	}
	if (duration !== null) {
		timers.push(setTimeout(() => {
			try {
				stopEffect(effect, id)
				Globals.events.poll()
			}
			catch (_) {}
		}, duration))
	}
	effect.timers.set(id, timers)
}

const releaseDevice = (id) => {
	if (Globals.joystickInstances.byId.has(id) || Globals.gamepadInstances.byId.has(id)) { return }

	for (const effect of Object.values(effects)) {
		if (!effect.timers.has(id)) { continue }

		// This call will throw if the device is gone
		try { stopEffect(effect, id) }
		catch (_) {}
	}
}

class SharedDeviceInstance extends EventsViaPoll {
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
	get firmwareVersion () { return this._firmwareVersion }
	get serialNumber () { return this._serialNumber }

	get power () {
		Globals.events.poll()
		validateNotClosed(this)

		return this._power
	}

	setPlayer (player) {
		validateNotClosed(this)

		validateNonNegativeInt32('player', player)

		this._setPlayer(player)
	}

	resetPlayer () {
		validateNotClosed(this)

		this._setPlayer(-1)
	}

	_setPlayer (player) {
		Bindings.joystick_setPlayer(this._device.id, player)
		refreshAndBroadcast()
	}

	_hasCapability (name) {
		Globals.events.poll()
		validateNotClosed(this)

		return Bindings.joystick_getCapabilities(this._device.id)[name]
	}

	get hasLed () { return this._hasCapability('hasLed') }
	get hasRumble () { return this._hasCapability('hasRumble') }
	get hasRumbleTriggers () { return this._hasCapability('hasRumbleTriggers') }

	setLed (red, green, blue) {
		validateNotClosed(this)

		validateUnit('red', red)
		validateUnit('green', green)
		validateUnit('blue', blue)

		if (!this.hasLed) { throw Object.assign(new Error("device has no led"), { id: this._device.id }) }

		Bindings.joystick_setLed(this._device.id, red, green, blue)
	}

	_getEffect (kind) {
		const effect = effects[kind]
		if (!this[effect.capability]) { throw Object.assign(new Error(effect.missing), { id: this._device.id }) }
		return effect
	}

	_startEffect (kind, nameA, a, nameB, b, duration) {
		validateNotClosed(this)

		validateUnit(nameA, a)
		validateUnit(nameB, b)
		if (duration !== null) { validateNonNegativeInt32('duration', duration) }

		startEffect(this._getEffect(kind), this._device.id, a, b, duration)
	}

	_stopEffect (kind) {
		validateNotClosed(this)

		stopEffect(this._getEffect(kind), this._device.id)
		Globals.events.poll()
	}

	rumble (lowFreqRumble = 1, highFreqRumble = 1, duration = null) {
		this._startEffect('rumble', 'lowFreqRumble', lowFreqRumble, 'highFreqRumble', highFreqRumble, duration)
	}

	stopRumble () { this._stopEffect('rumble') }

	rumbleTriggers (leftRumble = 1, rightRumble = 1, duration = null) {
		this._startEffect('rumbleTriggers', 'leftRumble', leftRumble, 'rightRumble', rightRumble, duration)
	}

	stopRumbleTriggers () { this._stopEffect('rumbleTriggers') }

	get closed () { return this._closed }
	close () {
		validateNotClosed(this)

		this._closed = true

		this._instances.all.delete(this)
		const collection = this._instances.byId.get(this._device.id)
		collection.delete(this)
		if (collection.size === 0) { this._instances.byId.delete(this._device.id) }
		releaseDevice(this._device.id)

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

module.exports = { SharedDeviceInstance }
