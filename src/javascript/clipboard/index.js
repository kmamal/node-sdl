const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')

const validEvents = [ 'update' ]

const clipboard = new class extends EventsViaPoll {
	constructor () { super(validEvents) }

	get text () { return Bindings.clipboard_getText() ?? '' }
	setText (text) {
		if (typeof text !== 'string') { throw Object.assign(new Error("text must be a string"), { text }) }
		Bindings.clipboard_setText(text)
	}
}()

module.exports = { clipboard }
