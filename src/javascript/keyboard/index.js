const Bindings = require('../bindings')
const { enums } = require('../enums')
const { mapping, reverseMapping } = require('./key-mapping')

const keyboard = {
	get SCANCODE () { return enums.scancode },

	getKey (scancode) {
		if (!Number.isFinite(scancode)) { throw Object.assign(new Error("scancode must be a number"), { scancode }) }
		if (scancode < 0 || scancode >= 512) { throw Object.assign(new Error("invalid scancode"), { scancode }) }

		const _key = Bindings.keyboard_getKey(scancode)
		return mapping[_key] ?? (_key && Array.from(_key).length === 1 ? _key : null)
	},

	getScancode (key) {
		if (typeof key !== 'string') { throw Object.assign(new Error("key must be a string"), { key }) }

		const _key = reverseMapping[key] ?? (Array.from(key).length === 1 ? key : 0)
		return Bindings.keyboard_getScancode(_key)
	},

	getState () { return Bindings.keyboard_getState() },
}

module.exports = { keyboard }
