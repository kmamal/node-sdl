const Bindings = require('./bindings')
const Globals = require('./globals')

process.on('exit', (code) => {
	if (code !== 0) { return }

	Globals.events.stopPolling()

	// Close all windows
	for (const window of Globals.windows.all.values()) {
		window.destroy()
	}

	// Close all audio instances
	for (const instance of Globals.audioInstances.all.values()) {
		instance.close()
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
