import Bindings from './bindings.js'
import { events, windows, audioInstances, joystickInstances, controllerInstances } from './globals.js'

process.on('exit', (code) => {
	if (code !== 0) { return }

	events.stopPolling()

	// Close all windows
	for (const window of windows.all.values()) {
		window.destroy()
	}

	// Close all audio instances
	for (const instance of audioInstances.values()) {
		instance.close()
	}

	// Close all joysticks
	for (const joystick of joystickInstances.all.values()) {
		joystick.close()
	}

	// Close all controllers
	for (const controller of controllerInstances.all.values()) {
		controller.close()
	}

	Bindings.cleanup()
})
