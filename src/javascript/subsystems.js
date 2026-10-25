const Bindings = require('./bindings')

const LAZY = [ 'joystick', 'gamepad', 'haptic', 'sensor' ]

const state = Object.fromEntries(LAZY.map((name) => [ name, null ]))

const ensure = (name) => (state[name] ??= Bindings.global_initSubsystem(name))

const ensureJoysticks = () => {
	ensure('joystick')
	ensure('gamepad')
}

const installLazyFlags = (initialized) => {
	for (const name of LAZY) {
		Object.defineProperty(initialized, name, {
			configurable: true,
			enumerable: true,
			get: () => {
				if (name === 'joystick' || name === 'gamepad') { ensureJoysticks() }
				const value = ensure(name)
				Object.defineProperty(initialized, name, { value, enumerable: true, writable: false, configurable: false })
				return value
			},
		})
	}
}

let joystickModules = null

const loadJoystickModules = () => {
	if (joystickModules !== null) { return joystickModules }
	ensureJoysticks()
	const { joystick } = require('./joystick')
	const { gamepad } = require('./gamepad')
	joystickModules = { joystick, gamepad }
	return joystickModules
}

const joystickModulesLoaded = () => joystickModules !== null

let sensorModule = null

const loadSensorModule = () => {
	if (sensorModule !== null) { return sensorModule }
	ensure('sensor')
	sensorModule = require('./sensor').sensor
	return sensorModule
}

module.exports = {
	installLazyFlags,
	loadJoystickModules,
	joystickModulesLoaded,
	loadSensorModule,
}
