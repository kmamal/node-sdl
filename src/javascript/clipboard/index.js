const Globals = require('../globals')
const { assertInitialized } = require('../subsystems')
const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')
const { validateString } = require('../validate')

const validEvents = [ 'update' ]

const clipboard = new class extends EventsViaPoll {
	constructor () { super(validEvents, () => { assertInitialized('video') }) }

	get text () {
		assertInitialized('video')
		Globals.events.poll()
		return Bindings.clipboard_getText()
	}

	setText (text) {
		assertInitialized('video')
		validateString('text', text)

		Bindings.clipboard_setText(text)
	}
}()

module.exports = { clipboard }
