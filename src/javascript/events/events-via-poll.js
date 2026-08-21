const Globals = require('../globals')
const { EventEmitter } = require('events')

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
		// Invalid types can't reach here: the newListener hook rejects them
		// before they are ever registered
		this.on('removeListener', (type) => {
			// Emitter-internal events need no polling, and removeAllListeners
			// skips them, so counting them could keep fast polling on forever
			if (type === 'newListener' || type === 'removeListener') { return }

			count--
			if (count !== 0) { return }

			activeEmitters.delete(id)
			if (activeEmitters.size !== 0) { return }

			Globals.events.switchToPollingSlow()
		})

		this.on('newListener', (type) => {
			if (!commonEvents.includes(type) && !validEvents.includes(type)) {
				throw Object.assign(new Error("invalid event"), { type })
			}

			if (type === 'newListener' || type === 'removeListener') { return }

			count++
			if (count !== 1) { return }

			activeEmitters.add(id)
			if (activeEmitters.size !== 1) { return }

			Globals.events.switchToPollingFast()
		})
	}

	removeAllListeners (type) {
		// Removing the bookkeeping listeners above would corrupt the count
		const types = type !== undefined ? [ type ] : this.eventNames()
		for (const eventType of types) {
			if (eventType === 'newListener' || eventType === 'removeListener') { continue }
			super.removeAllListeners(eventType)
		}
		return this
	}

	emit (type, ...args) {
		const isCommon = commonEvents.includes(type)
		const isValid = this._validEvents.includes(type)
		if (!isCommon && !isValid) {
			throw Object.assign(new Error("invalid event"), { type })
		}

		let hadListeners = super.emit(type, ...args)

		if (!isCommon) {
			hadListeners = super.emit("*", type, ...args) || hadListeners
		}

		return hadListeners
	}
}

module.exports = { EventsViaPoll }
