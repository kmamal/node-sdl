const Bindings = require('../bindings')
const { enums } = require('../enums')

const keyboard = {
	get SCANCODE () { return enums.scancode },

	getKey (scancode) {
		if (!Number.isFinite(scancode)) { throw Object.assign(new Error("scancode must be a number"), { scancode }) }
		if (scancode < 0 || scancode >= 512) { throw Object.assign(new Error("invalid scancode"), { scancode }) }

		return Bindings.keyboard_getKey(scancode)
	},
	getScancode (key) {
		if (typeof key !== 'string') { throw Object.assign(new Error("key must be a string"), { key }) }

		return Bindings.keyboard_getScancode(key)
	},

	getState () { return Bindings.keyboard_getState() },
}

module.exports = { keyboard }
