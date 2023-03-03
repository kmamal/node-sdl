import * as Bindings from '../bindings.js'
import { EventsViaPoll } from '../events/events-via-poll.js'

const validEvents = ['update']

export class clipboard extends EventsViaPoll {
	constructor() { super(validEvents) }

	get text() { return Bindings.clipboard_getText() ?? '' }
	setText(text) {
		if (typeof text !== 'string') { throw Object.assign(new Error("text must be a string"), { text }) }
		Bindings.clipboard_setText(text)
	}
}