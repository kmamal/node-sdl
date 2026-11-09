const INT32_MIN = -(2 ** 31)
const INT32_MAX = 2 ** 31 - 1
const FLOAT32_MAX = 3.4028234663852886e38

const fail = (message, name, value) => {
	throw Object.assign(new Error(message), { [name.slice(name.lastIndexOf('.') + 1)]: value })
}

const validateBoolean = (name, value) => {
	if (typeof value !== 'boolean') { fail(`${name} must be a boolean`, name, value) }
}

const validateString = (name, value) => {
	if (typeof value !== 'string') { fail(`${name} must be a string`, name, value) }
}

const validateObject = (name, value) => {
	if (typeof value !== 'object' || value === null) { fail(`${name} must be an object`, name, value) }
}

const validateBuffer = (name, value) => {
	if (!(value instanceof Buffer)) { fail(`${name} must be a Buffer`, name, value) }
}

const validateNumber = (name, value) => {
	if (!Number.isFinite(value)) { fail(`${name} must be a finite number`, name, value) }
}

const validateNonNegativeNumber = (name, value) => {
	validateNumber(name, value)
	if (value < 0) { fail(`${name} must be non-negative`, name, value) }
}

const validateFloat = (name, value) => {
	validateNumber(name, value)
	if (Math.abs(value) > FLOAT32_MAX) { fail(`${name} must fit in a 32-bit float`, name, value) }
}

const validateNonNegativeFloat = (name, value) => {
	validateNonNegativeNumber(name, value)
	validateFloat(name, value)
}

const validatePositiveFloat = (name, value) => {
	validateFloat(name, value)
	if (value <= 0) { fail(`${name} must be positive`, name, value) }
}

const validateNumberRange = (name, value, min, max) => {
	validateNumber(name, value)
	if (value < min || value > max) { fail(`${name} must be between ${min} and ${max}`, name, value) }
}

const validateInteger = (name, value) => {
	if (!Number.isInteger(value)) { fail(`${name} must be an integer`, name, value) }
}

const validateNonNegativeInteger = (name, value) => {
	validateInteger(name, value)
	if (value < 0) { fail(`${name} must be non-negative`, name, value) }
}

const validatePositiveInteger = (name, value) => {
	validateInteger(name, value)
	if (value <= 0) { fail(`${name} must be positive`, name, value) }
}

const validateIntegerRange = (name, value, min, max, constraint = `must be between ${min} and ${max}`) => {
	validateInteger(name, value)
	if (value < min || value > max) { fail(`${name} ${constraint}`, name, value) }
}

const validateInt32 = (name, value) => {
	validateIntegerRange(name, value, INT32_MIN, INT32_MAX, "must be a 32-bit integer")
}

const validateNonNegativeInt32 = (name, value) => {
	validateIntegerRange(name, value, 0, INT32_MAX, "must be a non-negative 32-bit integer")
}

const validatePositiveInt32 = (name, value) => {
	validateIntegerRange(name, value, 1, INT32_MAX, "must be a positive 32-bit integer")
}

const validateNotClosed = (instance) => {
	if (instance._closed) { throw Object.assign(new Error("instance is closed"), { id: instance._device.id }) }
}

const validateNotDestroyed = (window) => {
	if (window._destroyed) { throw Object.assign(new Error("window is destroyed"), { id: window._id }) }
}

module.exports = {
	INT32_MAX,
	validateBoolean,
	validateString,
	validateObject,
	validateBuffer,
	validateNumber,
	validateNonNegativeNumber,
	validateFloat,
	validateNonNegativeFloat,
	validatePositiveFloat,
	validateNumberRange,
	validateInteger,
	validateNonNegativeInteger,
	validatePositiveInteger,
	validateIntegerRange,
	validateInt32,
	validateNonNegativeInt32,
	validatePositiveInt32,
	validateNotClosed,
	validateNotDestroyed,
}
