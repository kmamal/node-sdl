const Globals = require('../globals')
const Bindings = require('../bindings')
const { validateNumberRange, validateNonNegativeInt32 } = require('../validate')
const { refreshAndBroadcast } = require('./devices')

const effects = {
	rumble: {
		call: Bindings.joystick_rumble,
		timeouts: new Map(),
	},
	rumbleTriggers: {
		call: Bindings.joystick_rumbleTriggers,
		timeouts: new Map(),
	},
}

const clearEffectTimeout = (effect, id) => {
	for (const timer of effect.timeouts.get(id) ?? []) { clearTimeout(timer) }
	effect.timeouts.delete(id)
}

const MAX_DURATION = 0xFFFF

const validateUnit = (name, value) => { validateNumberRange(name, value, 0, 1) }

const validateRumble = (nameA, a, nameB, b, duration) => {
	validateUnit(nameA, a)
	validateUnit(nameB, b)
	if (duration !== null) { validateNonNegativeInt32('duration', duration) }
}

const validateLed = (red, green, blue) => {
	validateUnit('red', red)
	validateUnit('green', green)
	validateUnit('blue', blue)
}

const validatePlayer = (player) => { validateNonNegativeInt32('player', player) }

const startEffect = (kind, id, _a, _b, duration) => {
	if (duration === 0) {
		stopEffect(kind, id)
		return
	}

	const effect = effects[kind]
	const a = Math.round(_a * 0xFFFF)
	const b = Math.round(_b * 0xFFFF)
	effect.call(id, a, b, MAX_DURATION)

	clearEffectTimeout(effect, id)

	// Zero intensity stops the effect, so there is nothing to wait for
	if (a === 0 && b === 0) { return }

	// Keeps Node.js alive while rumbling
	const timers = []
	if (duration === null || duration > MAX_DURATION) {
		timers.push(setInterval(() => {
			try { effect.call(id, a, b, MAX_DURATION) }
			catch (_) { clearEffectTimeout(effect, id) }
		}, 30e3))
	}
	if (duration !== null) {
		timers.push(setTimeout(() => {
			clearEffectTimeout(effect, id)
			try {
				effect.call(id, 0, 0, 0)
				Globals.events.poll()
			}
			catch (_) {}
		}, duration))
	}
	effect.timeouts.set(id, timers)
}

const stopEffect = (kind, id) => {
	const effect = effects[kind]
	clearEffectTimeout(effect, id)
	effect.call(id, 0, 0, 0)
	Globals.events.poll()
}

const releaseDevice = (id) => {
	if (Globals.joystickInstances.byId.has(id) || Globals.gamepadInstances.byId.has(id)) { return }

	for (const effect of Object.values(effects)) {
		if (!effect.timeouts.has(id)) { continue }

		// This call will throw if the device is gone
		try { effect.call(id, 0, 0, 0) }
		catch (_) {}
		clearEffectTimeout(effect, id)
	}
}

const setPlayer = (id, player) => {
	Bindings.joystick_setPlayer(id, player)
	refreshAndBroadcast()
}

module.exports = {
	startEffect,
	stopEffect,
	releaseDevice,
	setPlayer,
	validateRumble,
	validateLed,
	validatePlayer,
}
