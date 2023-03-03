import Bindings from '../bindings.js'
import Enums from '../enums.js'
import * as Globals from '../globals.js'
import { EventsViaPoll } from '../events/events-via-poll.js'

const validEvents = [
	'axisMotion',
	'ballMotion',
	'buttonDown',
	'buttonUp',
	'hatMotion',
	'close',
]

export class JoystickInstance extends EventsViaPoll {
	constructor(device) {
		super(validEvents)

		const result = Bindings.joystick_open(device._index)

		this._firmwareVersion = result.firmwareVersion
		this._serialNumber = result.serialNumber
		this._hasLed = result.hasLed
		this._hasRumble = result.hasRumble
		this._hasRumbleTriggers = result.hasRumbleTriggers
		this._axes = result.axes
		this._balls = result.balls
		this._buttons = result.buttons
		this._hats = result.hats.map((x) => Enums.hatPositionNames[x])

		this._device = device

		this._closed = false

		Globals.joystickInstances.all.add(this)
		let collection = Globals.joystickInstances.byId.get(this._device.id)
		if (!collection) {
			collection = new Set()
			Globals.joystickInstances.byId.set(this._device.id, collection)
		}
		collection.add(this)
	}

	get device() { return this._device }
	get firmwareVersion() { return this._firmwareVersion }
	get serialNumber() { return this._serialNumber }

	get axes() { return this._axes }
	get balls() { return this._balls }
	get buttons() { return this._buttons }
	get hats() { return this._hats }

	get power() {
		const power = Bindings.joystick_getPower(this._device.id)
		return Enums.powerLevelNames[power]
	}

	get hasLed() { return this._hasLed }
	setLed(red, green, blue) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!Number.isFinite(red)) { throw Object.assign(new Error("red must be a number"), { red }) }
		if (red < 0 || red > 1) { throw Object.assign(new Error("red must be between 0 and 1"), { red }) }
		if (!Number.isFinite(green)) { throw Object.assign(new Error("green must be a number"), { green }) }
		if (green < 0 || green > 1) { throw Object.assign(new Error("green must be between 0 and 1"), { green }) }
		if (!Number.isFinite(blue)) { throw Object.assign(new Error("blue must be a number"), { blue }) }
		if (blue < 0 || blue > 1) { throw Object.assign(new Error("blue must be between 0 and 1"), { blue }) }

		Bindings.joystick_rumble(this._device.id, red, green, blue)
	}

	get hasRumble() { return this._hasRumble }
	rumble(lowFreqRumble = 1, highFreqRumble = 1, duration = 1e3) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!Number.isFinite(lowFreqRumble)) { throw Object.assign(new Error("lowFreqRumble must be a number"), { lowFreqRumble }) }
		if (lowFreqRumble < 0 || lowFreqRumble > 1) { throw Object.assign(new Error("lowFreqRumble must be between 0 and 1"), { lowFreqRumble }) }
		if (!Number.isFinite(highFreqRumble)) { throw Object.assign(new Error("highFreqRumble must be a number"), { highFreqRumble }) }
		if (highFreqRumble < 0 || highFreqRumble > 1) { throw Object.assign(new Error("highFreqRumble must be between 0 and 1"), { highFreqRumble }) }
		if (!Number.isFinite(duration)) { throw Object.assign(new Error("duration must be a number"), { duration }) }

		Bindings.joystick_rumble(this._device.id, lowFreqRumble, highFreqRumble, duration)
	}

	stopRumble() { this.rumble(0, 0) }

	get hasRumbleTriggers() { return this._hasRumbleTriggers }
	rumbleTriggers(leftRumble = 1, rightRumble = 1, duration = 1e3) {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		if (!Number.isFinite(leftRumble)) { throw Object.assign(new Error("leftRumble must be a number"), { leftRumble }) }
		if (leftRumble < 0 || leftRumble > 1) { throw Object.assign(new Error("leftRumble must be between 0 and 1"), { leftRumble }) }
		if (!Number.isFinite(rightRumble)) { throw Object.assign(new Error("rightRumble must be a number"), { rightRumble }) }
		if (rightRumble < 0 || rightRumble > 1) { throw Object.assign(new Error("rightRumble must be between 0 and 1"), { rightRumble }) }
		if (!Number.isFinite(duration)) { throw Object.assign(new Error("duration must be a number"), { duration }) }

		Bindings.joystick_rumbleTriggers(this._device.id, leftRumble, rightRumble, duration)
	}

	stopRumbleTriggers() { this.rumbleTriggers(0, 0) }

	get closed() { return this._closed }
	close() {
		if (this._closed) { throw Object.assign(new Error("instance is closed"), { id: this._device.id }) }

		this.emit('close')
		this.removeAllListeners()
		this._closed = true

		Globals.joystickInstances.all.delete(this)
		const collection = Globals.joystickInstances.byId.get(this._device.id)
		collection.delete(this)
		if (collection.size === 0) {
			Bindings.joystick_close(this._device.id)
			Globals.joystickInstances.byId.delete(this._device.id)
		}
	}
}
