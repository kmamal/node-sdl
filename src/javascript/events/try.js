const rethrow = (error) => {
	process.nextTick(() => { throw error })
}

const tryEmit = (emitter, type, event) => {
	try { emitter.emit(type, event) }
	catch (error) {
		if (type === 'error') {
			rethrow(error)
			return
		}
		try { emitter.emit('error', error) }
		catch (error2) { rethrow(error2) }
	}
}

const tryCall = (fn) => {
	try { fn() }
	catch (error) { rethrow(error) }
}

module.exports = { tryEmit, tryCall }
