const Bindings = require('./bindings')
const Globals = require('./globals')

process.on('exit', (code) => {
	if (code !== 0) { return }

	Globals.events.stopPolling()

	const errors = []

	for (const window of Globals.windows.all.values()) {
		try { window.destroy() }
		catch (error) { errors.push(error) }
	}

	for (const stream of Globals.audioStreams.values()) {
		try { stream.close() }
		catch (error) { errors.push(error) }
	}

	for (const joystick of Globals.joystickInstances.all.values()) {
		try { joystick.close() }
		catch (error) { errors.push(error) }
	}

	for (const gamepad of Globals.gamepadInstances.all.values()) {
		try { gamepad.close() }
		catch (error) { errors.push(error) }
	}

	for (const sensor of Globals.sensorInstances.all.values()) {
		try { sensor.close() }
		catch (error) { errors.push(error) }
	}

	Bindings.global_cleanup()

	if (errors.length) { throw new AggregateError(errors, "errors occurred during process exit cleanup") }
})
