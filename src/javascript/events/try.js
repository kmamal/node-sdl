
const tryEmit = (emitter, type, event) => {
	try {
		try { emitter.emit(type, event) }
		catch (error) { emitter.emit('error', error) }
	}
	catch (error) { process.nextTick(() => { throw error }) }
}

const tryCall = (fn) => {
	try { fn() }
	catch (error) { process.nextTick(() => { throw error }) }
}

module.exports = { tryEmit, tryCall }
