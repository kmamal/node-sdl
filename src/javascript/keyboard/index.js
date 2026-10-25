const Globals = require('../globals')
const Bindings = require('../bindings')
const Enums = require('../enums')
const { EventsViaPoll } = require('../events/events-via-poll')
const { mapping, reverseMapping, isCharacter } = require('./key-mapping')
const { validateIntegerRange, validateString } = require('../validate')

const validEvents = [ 'keymapChange' ]

const keyboard = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get SCANCODE () { return Enums.scancodes }

	getKey (scancode) {
		validateIntegerRange('scancode', scancode, 0, 511)

		Globals.events.poll()
		const _key = Bindings.keyboard_getKey(scancode)
		return mapping[_key] ?? (isCharacter(_key) ? _key : null)
	}

	getScancode (key) {
		validateString('key', key)

		const _key = reverseMapping[key] ?? (isCharacter(key) ? key : null)
		if (_key === null) { throw Object.assign(new Error("invalid key"), { key }) }

		Globals.events.poll()
		return Bindings.keyboard_getScancode(_key)
	}

	getState () {
		Globals.events.poll()
		return Bindings.keyboard_getState()
	}
}()

module.exports = { keyboard }
