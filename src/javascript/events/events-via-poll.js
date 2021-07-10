const { EventEmitter } = require('events')
const Globals = require('../globals')

let _ID = 0
const activeEmitters = new Set()

const commonEvents = [ 'newListener', 'removeListener', '*' ]

class EventsViaPoll extends EventEmitter {
	constructor (validEvents) {
		super()

		this._validEvents = validEvents

		const id = _ID++
		let count = 0

		// NOTE: this needs to be first, otherwise it will emit for 'newListener'
		this.on('removeListener', (type) => {
			if (!commonEvents.includes(type) && !validEvents.includes(type)) {
				throw Object.assign(new Error("invalid event"), { type })
			}

			count--
			if (count !== 0) { return }

			activeEmitters.delete(id)
			if (activeEmitters.size !== 0) { return }

			Globals.events.stopPolling()
		})

		this.on('newListener', (type) => {
			if (!commonEvents.includes(type) && !validEvents.includes(type)) {
				throw Object.assign(new Error("invalid event"), { type })
			}

			count++
			if (count !== 1) { return }

			activeEmitters.add(id)
			if (activeEmitters.size !== 1) { return }

			Globals.events.startPolling()
		})
	}

	emit (type, ...args) {
		const isCommon = commonEvents.includes(type)
		const isValid = this._validEvents.includes(type)
		if (!isCommon && !isValid) {
			throw Object.assign(new Error("invalid event"), { type })
		}

		super.emit(type, ...args)

		if (!isCommon) {
			super.emit("*", type, ...args)
		}
	}
}

module.exports = { EventsViaPoll }
