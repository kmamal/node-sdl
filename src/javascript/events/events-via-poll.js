const Globals = require('../globals')
const { EventEmitter } = require('node:events')

let _ID = 0
const activeEmitters = new Set()

const commonEvents = [ 'newListener', 'removeListener', 'error', '*' ]

class EventsViaPoll extends EventEmitter {
	constructor (validEvents) {
		super()

		this._validEvents = validEvents

		const id = _ID++
		let count = 0

		// NOTE: this needs to be first, otherwise it will emit for 'newListener'
		this.on('removeListener', (type) => {
			if (type === 'newListener' || type === 'removeListener') { return }

			count--
			if (count !== 0) { return }

			activeEmitters.delete(id)
			if (activeEmitters.size !== 0) { return }

			Globals.events.switchToPollingSlow()
		})

		this.on('newListener', (type) => {
			if (this._makeRetiredError) { throw this._makeRetiredError() }

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

	_retire (makeError) {
		process.nextTick(() => {
			this.removeAllListeners()
			this._makeRetiredError = makeError
		})
	}

	removeAllListeners (type) {
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
