const { validateNonNegativeInt32 } = require('../validate')

const validateBytes = (buffer, bytes) => {
	validateNonNegativeInt32('bytes', bytes)
	if (buffer.length < bytes) { throw Object.assign(new Error("buffer is smaller than expected"), { buffer, bytes }) }
}

module.exports = { validateBytes }
