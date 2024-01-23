const Bindings = require('./bindings')

const enums = Bindings.enums_get()

for (const [ key, obj ] of Object.entries(enums)) {
	const names = {}
	for (const [ name, value ] of Object.entries(obj)) {
		names[value] = name
	}
	enums[`${key}Names`] = names
}

module.exports = enums
