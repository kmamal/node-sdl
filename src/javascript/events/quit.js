const Globals = require('../globals')
const { sdl } = require('../sdl')

const maybeTriggerQuit = () => {
	if (Globals.windows.all.size > 0) { return }

	let should_prevent = false
	const prevent = () => { should_prevent = true }

	const type2 = 'before-quit'
	const event2 = { type: type2, timestamp: Date.now(), prevent }
	sdl.emit(type2, event2)

	if (should_prevent) { return }

	sdl.emit('quit', { type: 'quit', timestamp: Date.now() })
	process.exit()
}

module.exports = { maybeTriggerQuit }
