const Bindings = require('../bindings')
const { enums } = require('../enums')

console.log(enums)
const keyboard = {
	get SCANCODE () { return enums.scancode },
	get SCANCODE_NAME () { return enums.scancode_names },
	get KEYCODE () { return enums.keycode },
	get KEYCODE_NAME () { return enums.keycode_names },

	getKeycode (scancode) { return Bindings.keyboard_getKeycode(scancode) },
	getScancode (keycode) { return Bindings.keyboard_getScancode(keycode) },

	getState () { return Bindings.keyboard_getState() },
}

module.exports = { keyboard }
