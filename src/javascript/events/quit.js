import { windows } from '../globals.js'
import { sdl } from '../sdl.js'


export const maybeTriggerQuit = () => {
	if (windows.all.size > 0) { return }

	let shouldPrevent = false
	const prevent = () => { shouldPrevent = true }

	const type1 = 'beforeQuit'
	const event1 = { type: type1, prevent }
	sdl.emit(type1, event1)

	if (shouldPrevent) { return }

	const type2 = 'quit'
	const event2 = { type: type2 }
	sdl.emit(type2, event2)
	process.exit()
}
