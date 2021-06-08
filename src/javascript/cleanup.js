const Bindings = require('./bindings')
const Globals = require('./globals')

process.on('exit', (code) => {
	if (code !== 0) { return }

	Globals.events.stopPolling()

	// Close all windows
	for (const window of Globals.windows.all.values()) {
		window.destroy()
	}

	// Close all audio devices
	for (const device of Globals.audio_devices.all.values()) {
		device.close()
	}

	// Close all joysticks
	for (const joystick of Globals.joysticks.all.values()) {
		joystick.close()
	}

	// Close all controllers
	for (const controller of Globals.controllers.all.values()) {
		controller.close()
	}

	Bindings.cleanup()
})
