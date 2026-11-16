// Only for code that runs inside a NAPI callback.
// This is to prevent the exception from bubbling up through C++ code.
// Everywhere else, emit synchronously with `try { this.emit(...) } catch (error) { this.emit('error', error) }`
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
