
class Joystick extends EventsViaPoll {
	constructor (device) {
		super()

		const { name, index } = device

		const { id, guid, axes, balls, buttons, hats } = Bindings.joystick_open(index)

		this._id = id
		this._name = name
		this._guid = guid
		this._axes = axes
		this._balls = balls
		this._buttons = buttons
		this._hats = hats

		this._closed = false

		joysticks.set(this._id, this)
	}

	get id () { return this._id }
	get name () { return this._name }
	get guid () { return this._guid }

	get axes () { return this._axes }
	get balls () { return this._balls }
	get buttons () { return this._buttons }
	get hats () { return this._hats }

	get power () { return Bindings.joystick_getPower() }

	get closed () { return this._closed }
	close () {
		this._closed = true
		Bindings.joystick_close(this._id)
		joysticks.delete(this._id)
	}
}

sdl.joystick = {
	get devices () { return Bindings.joystick_getDevices() },

	open (device) { return new Joystick(device) },
}
