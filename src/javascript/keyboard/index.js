const Globals = require('../globals')
const { assertInitialized, isAvailable } = require('../subsystems')
const Bindings = require('../bindings')
const Enums = require('../enums')
const { EventsViaPoll } = require('../events/events-via-poll')
const { mapping, getReverseMapping, isCharacter } = require('./key-mapping')
const { validateIntegerRange, validateString } = require('../validate')

const validEvents = [ 'keymapChange' ]

const mapKey = (key) => mapping[key] ?? (isCharacter(key) ? key : null)

const keyboard = new class extends EventsViaPoll {
	constructor () { super(validEvents, () => { assertInitialized('video') }) }

	isAvailable () { return isAvailable('video') }

	get SCANCODE () { return Enums.scancodes }

	getKey (scancode) {
		assertInitialized('video')
		validateIntegerRange('scancode', scancode, 0, 511)

		Globals.events.poll()
		return mapKey(Bindings.keyboard_getKey(scancode))
	}

	getScancode (key) {
		assertInitialized('video')
		validateString('key', key)

		Globals.events.poll()
		const _key = isCharacter(key) ? key : getReverseMapping()[key] ?? null
		if (_key === null) { throw Object.assign(new Error("invalid key"), { key }) }

		const scancode = Bindings.keyboard_getScancode(_key)
		if (scancode === null) { return null }
		if (!isCharacter(key) && mapKey(Bindings.keyboard_getKey(scancode)) !== key) { return null }

		return scancode
	}

	getState () {
		assertInitialized('video')
		Globals.events.poll()
		return Bindings.keyboard_getState()
	}
}()

module.exports = { keyboard }
