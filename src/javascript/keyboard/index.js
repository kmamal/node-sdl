const Bindings = require('../bindings')
const Enums = require('../enums')
const { mapping, reverseMapping } = require('./key-mapping')

const keyboard = {
	get SCANCODE () { return Enums.scancode },

	getKey (scancode) {
		if (!Number.isFinite(scancode)) { throw Object.assign(new Error("scancode must be a number"), { scancode }) }
		if (scancode < 0 || scancode >= 512) { throw Object.assign(new Error("invalid scancode"), { scancode }) }

		const _key = Bindings.keyboard_getKey(scancode)
		return mapping[_key] ?? _key?.length === 1 ? _key : null
	},

	getScancode (key) {
		if (typeof key !== 'string') { throw Object.assign(new Error("key must be a string"), { key }) }

		const _key = reverseMapping[key] ?? key.length === 1 ? key : null
		if (_key === null) { throw Object.assign(new Error("invalid key"), { key }) }

		return Bindings.keyboard_getScancode(_key)
	},

	getState () { return Bindings.keyboard_getState() },
}

module.exports = { keyboard }
