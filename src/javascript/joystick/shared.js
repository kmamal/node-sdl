const Globals = require('../globals')
const Bindings = require('../bindings')

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

const startEffect = (kind, id, a, b, duration) => {
	const effect = effects[kind]
	a = Math.round(a * 0xFFFF)
	b = Math.round(b * 0xFFFF)
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
	const devices = Bindings.joystick_getDevices()
	for (const device of [ ...Globals.joystickDevices, ...Globals.gamepadDevices ]) {
		const updated = devices.find(({ id: _id }) => _id === device.id)
		if (updated) { device.player = updated.player }
	}
}

module.exports = {
	startEffect,
	stopEffect,
	releaseDevice,
	setPlayer,
}
