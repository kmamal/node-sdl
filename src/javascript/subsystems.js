const { isMainThread } = require('node:worker_threads')
const Bindings = require('./bindings')
const Globals = require('./globals')
const { makeDevice: makeJoystickDevice } = require('./joystick/devices')
const { makeDevice: makeGamepadDevice, isGamepadDevice } = require('./gamepad/devices')
const { refreshDevices: refreshAudioDevices } = require('./audio/devices')

const initSubsystem = (name) => {
	const result = Bindings.global_initSubsystem(name)
	Globals.initialized[name] = result === true
	if (result !== true) { Globals.initErrors[name] = result }
	return Globals.initialized[name]
}

const initJoysticks = () => {
	initSubsystem('joystick')
	initSubsystem('gamepad')
	if (!Globals.initialized.joystick) { return }
	const devices = Bindings.joystick_getDevices()
	Globals.joystickDevices = devices.map(makeJoystickDevice)
	Globals.gamepadDevices = devices.filter(isGamepadDevice).map(makeGamepadDevice)
}

const initializers = {
	video: () => {
		if (!isMainThread) { throw new Error("the video subsystem is only available on the main thread") }
		if (initSubsystem('video')) { Globals.displays = Bindings.video_getDisplays() }
	},
	audio: () => { if (initSubsystem('audio')) { refreshAudioDevices() } },
	joystick: initJoysticks,
	gamepad: initJoysticks,
	sensor: () => { initSubsystem('sensor') },
}

const ensure = (name) => {
	if (Globals.initialized[name] === null) { initializers[name]() }
	return Globals.initialized[name]
}

const isAvailable = (name) => {
	try { return ensure(name) }
	catch (_) { return false }
}

const assertInitialized = (name) => {
	if (!ensure(name)) {
		const error = Globals.initErrors[name]
		throw new Error(`SDL ${name} subsystem failed to initialize${error ? `: ${error}` : ''}`)
	}
}

module.exports = {
	assertInitialized,
	isAvailable,
}
