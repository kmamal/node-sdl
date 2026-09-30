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
	clearTimeout(effect.timeouts.get(id))
	effect.timeouts.delete(id)
}

const startEffect = (kind, id, a, b, duration) => {
	const effect = effects[kind]
	a = Math.round(a * 0xFFFF)
	b = Math.round(b * 0xFFFF)
	effect.call(id, a, b, duration)

	clearEffectTimeout(effect, id)

	// Zero intensity stops the effect, so there is nothing to wait for
	if (a === 0 && b === 0) { return }

	// Keeps Node.js alive while rumbling
	effect.timeouts.set(id, setTimeout(() => {
		effect.timeouts.delete(id)
		try {
			effect.call(id, 0, 0, 0)
			Globals.events.poll()
		}
		catch (_) {}
	}, duration))
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
