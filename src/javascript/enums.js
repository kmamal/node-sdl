const Bindings = require('./bindings')

const enums = Bindings.enums_get()

Object.setPrototypeOf(enums, null)
for (const table of Object.values(enums)) {
	Object.setPrototypeOf(table, null)
}

module.exports = enums
