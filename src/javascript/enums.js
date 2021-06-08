const Bindings = require('./bindings')

const enums = Bindings.getEnums()

for (const [ key, obj ] of Object.entries(enums)) {
	const names = {}
	for (const [ name, value ] of Object.entries(obj)) {
		names[value] = name
	}
	enums[`${key}_names`] = names
}

module.exports = { enums }
