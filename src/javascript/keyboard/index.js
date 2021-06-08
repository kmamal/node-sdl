const Bindings = require('../bindings')
const { enums } = require('../enums')

const keyboard = {
	get SCANCODE () { return enums.keycode },
	get SCANCODE_NAME () { return enums.keycode_names },
	get KEYCODE () { return enums.scancode },
	get KEYCODE_NAME () { return enums.scancode_names },

	getKeycode (scancode) { return Bindings.keyboard_getKeycode(scancode) },
	getScancode (keycode) { return Bindings.keyboard_getScancode(keycode) },

	getState () { return Bindings.keyboard_getState() },
}

module.exports = { keyboard }
