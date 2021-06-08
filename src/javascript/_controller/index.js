
class Controller extends EventsViaPoll {
	constructor (device) {
		super()

		const { name, index } = device

		const { id, guid, sticks, triggers, shoulders, dpad, buttons } = Bindings.controller_open(index)

		this._id = id
		this._name = name
		this._guid = guid

		this._sticks = sticks
		this._triggers = triggers
		this._shoulders = shoulders
		this._dpad = dpad
		this._buttons = buttons

		this._closed = false

		controllers.set(this._id, this)
	}

	get id () { return this._id }
	get name () { return this._name }
	get guid () { return this._guid }

	get sticks () { return this._sticks }
	get triggers () { return this._triggers }
	get shoulders () { return this._shoulders }
	get dpad () { return this._dpad }
	get buttons () { return this._buttons }

	get closed () { return this._closed }
	close () {
		this._closed = true
		Bindings.controller_close(this._id)
		controllers.delete(this._id)
	}
}

sdl.controller = {
	get devices () { return sdl.joystick.devices.filter(({ controller }) => controller) },

	open: (device) => new Controller(device),
}
