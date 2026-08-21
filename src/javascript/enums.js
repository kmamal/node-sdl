const Bindings = require('./bindings')

const enums = Bindings.enums_get()

// Null prototypes so that lookups of names like 'constructor' can't match
// inherited Object members and leak through as valid entries
Object.setPrototypeOf(enums, null)
for (const table of Object.values(enums)) {
	Object.setPrototypeOf(table, null)
}

module.exports = enums
