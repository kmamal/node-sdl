const Bindings = require('../bindings')
const { EventsViaPoll } = require('../events/events-via-poll')

const clipboard = new class extends EventsViaPoll {
	get text () { return Bindings.clipboard_getText() ?? '' }
	setText (text) {
		if (typeof text !== 'string') { throw new Error("text must be a string") }
		Bindings.clipboard_setText(text)
	}
}()

module.exports = { clipboard }
