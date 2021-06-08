const { EventEmitter } = require('events')
const Globals = require('../globals')

let _ID = 0
const emitters = new Set()

class EventsViaPoll extends EventEmitter {
	constructor () {
		super()

		const id = _ID++

		this.on('removeListener', () => {
			emitters.delete(id)
			if (emitters.size === 0) { Globals.events.stopPolling() }
		})
		this.on('newListener', () => {
			if (emitters.size === 0) { Globals.events.startPolling() }
			emitters.add(id)
		})
	}
}

module.exports = { EventsViaPoll }
