const Globals = require('../globals')
const { EventEmitter } = require('node:events')

let numListeners = 0

const commonEvents = [ 'newListener', 'removeListener', 'error', '*' ]

class EventsViaPoll extends EventEmitter {
	constructor (validEvents, assertReady = null) {
		super()

		this._validEvents = validEvents

		// NOTE: this needs to be first, otherwise it will emit for 'newListener'
		this.on('removeListener', (type) => {
			if (type === 'newListener' || type === 'removeListener') { return }

			if (--numListeners === 0) { Globals.events.setDemand(false) }
		})

		this.on('newListener', (type) => {
			if (this._makeRetiredError) { throw this._makeRetiredError() }

			if (!commonEvents.includes(type) && !validEvents.includes(type)) {
				throw Object.assign(new Error("invalid event"), { type })
			}

			if (type === 'newListener' || type === 'removeListener') { return }

			if (assertReady && type !== 'error') { assertReady() }

			if (++numListeners === 1) { Globals.events.setDemand(true) }
		})
	}

	_retire (makeError) {
		this._makeRetiredError = makeError
		process.nextTick(() => { this.removeAllListeners() })
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
