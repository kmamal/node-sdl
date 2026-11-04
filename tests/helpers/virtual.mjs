import sdl from '../../src/javascript/index.js'
import Bindings from '../../src/javascript/bindings.js'

export const pollEvents = () => sdl.gamepad.devices

export const attachVirtual = (isGamepad) => {
	pollEvents()
	const id = Bindings.testing_attachVirtualJoystick(isGamepad)
	pollEvents()
	let attached = true
	return {
		id,
		joystick: () => sdl.joystick.devices.find((device) => device.id === id),
		gamepad: () => sdl.gamepad.devices.find((device) => device.id === id),
		setAxis: (axis, value) => { Bindings.testing_setVirtualJoystickAxis(id, axis, value) },
		setButton: (button, down) => { Bindings.testing_setVirtualJoystickButton(id, button, down) },
		detach: () => {
			if (!attached) { return }
			attached = false
			Bindings.testing_detachVirtualJoystick(id)
			pollEvents()
		},
	}
}

export const withVirtual = async (isGamepad, callback) => {
	const virtual = attachVirtual(isGamepad)
	try { return await callback(virtual) }
	finally { virtual.detach() }
}
