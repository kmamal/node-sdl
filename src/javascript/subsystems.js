const Bindings = require('./bindings')
const Globals = require('./globals')
const { make: makeJoystickDevice } = require('./joystick/device')
const { make: makeGamepadDevice, filter: filterGamepadDevice } = require('./gamepad/device')

const LAZY = [ 'joystick', 'gamepad', 'haptic', 'sensor' ]

const initLazyFlags = (initialized) => {
	for (const name of LAZY) { initialized[name] = null }
}

const initJoysticks = () => {
	const { initialized } = Globals.info
	initialized.joystick = Bindings.global_initSubsystem('joystick')
	initialized.gamepad = Bindings.global_initSubsystem('gamepad')

	if (initialized.joystick) {
		const devices = Bindings.joystick_getDevices()
		Globals.joystickDevices = devices.map(makeJoystickDevice)
		Globals.gamepadDevices = devices.filter(filterGamepadDevice).map(makeGamepadDevice)
	}
}

const ensure = (name) => {
	const { initialized } = Globals.info
	if (initialized[name] !== null) { return initialized[name] }

	if (name === 'joystick' || name === 'gamepad') { initJoysticks() }
	else { initialized[name] = Bindings.global_initSubsystem(name) }

	return initialized[name]
}

const assertInitialized = (name) => {
	const initialized = LAZY.includes(name)
		? ensure(name)
		: Globals.info.initialized[name]
	if (!initialized) { throw new Error(`SDL ${name} subsystem failed to initialize`) }
}

module.exports = {
	assertInitialized,
	initLazyFlags,
}
