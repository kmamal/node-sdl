const Bindings = require('./bindings')
const Globals = require('./globals')

process.on('exit', (code) => {
	Globals.events.stopPolling()

	if (code !== 0) {
		Bindings.global_cleanup()
		return
	}

	const errors = []

	for (const window of Globals.windows.all.values()) {
		try { window.destroy() }
		catch (error) { errors.push(error) }
	}

	for (const stream of Globals.audioStreams.values()) {
		try { stream.close() }
		catch (error) { errors.push(error) }
	}

	for (const joystick of Globals.joystickInstances.all) {
		try { joystick.close() }
		catch (error) { errors.push(error) }
	}

	for (const gamepad of Globals.gamepadInstances.all) {
		try { gamepad.close() }
		catch (error) { errors.push(error) }
	}

	for (const sensor of Globals.sensorInstances.all) {
		try { sensor.close() }
		catch (error) { errors.push(error) }
	}

	Bindings.global_cleanup()

	if (errors.length) { throw new AggregateError(errors, "errors occurred during exit cleanup") }
})
