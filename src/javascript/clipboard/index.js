// TODO: handle import issues here

const Bindings = require('../bindings').default
const { EventsViaPoll } = require('../events/events-via-poll').default

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
