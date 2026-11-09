const { validateNonNegativeInt32 } = require('../validate')

const validateBytes = (buffer, bytes) => {
	validateNonNegativeInt32('bytes', bytes)
	// Attaching the whole buffer is fine: Node's inspect only prints its first 50 bytes.
	if (buffer.length < bytes) { throw Object.assign(new Error("buffer is smaller than expected"), { buffer, bytes }) }
}

module.exports = { validateBytes }
