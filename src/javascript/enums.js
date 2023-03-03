import Bindings from './bindings.js'
const enums = Bindings.getEnums()

for (const [key, obj] of Object.entries(enums)) {
	const names = {}
	for (const [name, value] of Object.entries(obj)) {
		names[value] = name
	}
	enums[`${key}Names`] = names
}

export default enums
