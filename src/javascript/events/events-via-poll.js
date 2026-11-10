const Globals = require('../globals')
const { EventEmitter } = require('node:events')

let numListeners = 0

const commonEvents = [ 'newListener', 'removeListener', 'error', '*' ]
const metaEvents = [ 'newListener', 'removeListener' ]
const undemandingEvents = [ ...metaEvents, 'error' ]

class EventsViaPoll extends EventEmitter {
	constructor (validEvents, assertReady = null) {
		super()

		this._validEvents = validEvents
		this._internalListeners = new Set()

		// NOTE: this needs to be first, otherwise it will emit for 'newListener'
		this._addInternalListener('removeListener', (type) => {
			if (undemandingEvents.includes(type)) { return }

			if (--numListeners === 0) { Globals.events.setDemand(false) }
		})

		this._addInternalListener('newListener', (type) => {
			if (this._makeRetiredError) { throw this._makeRetiredError() }

			if (!commonEvents.includes(type) && !validEvents.includes(type)) {
				throw Object.assign(new Error("invalid event"), { type })
			}

			if (undemandingEvents.includes(type)) { return }

			if (assertReady) { assertReady() }

			if (++numListeners === 1) { Globals.events.setDemand(true) }
		})
	}

	_addInternalListener (type, listener) {
		this._internalListeners.add(listener)
		this.on(type, listener)
	}

	_retire (makeError) {
		this._makeRetiredError = makeError
		process.nextTick(() => { this.removeAllListeners() })
	}

	removeAllListeners (type) {
		if (type === undefined) {
			const types = this.eventNames().filter((name) => name !== 'removeListener')
			for (const eventType of [ ...types, 'removeListener' ]) {
				this.removeAllListeners(eventType)
			}
			return this
		}

		if (!metaEvents.includes(type)) {
			super.removeAllListeners(type)
			return this
		}

		for (const listener of this.listeners(type)) {
			if (this._internalListeners.has(listener)) { continue }
			this.removeListener(type, listener)
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
