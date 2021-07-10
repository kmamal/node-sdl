const Globals = require('../globals')
const { sdl } = require('../sdl')

const maybeTriggerQuit = () => {
	if (Globals.windows.all.size > 0) { return }

	let shouldPrevent = false
	const prevent = () => { shouldPrevent = true }

	const type2 = 'beforeQuit'
	const event2 = { prevent }
	sdl.emit(type2, event2)

	if (shouldPrevent) { return }

	sdl.emit('quit')
	process.exit()
}

module.exports = { maybeTriggerQuit }
