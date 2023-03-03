import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const path = resolve(__dirname, '../../dist/sdl.node')
console.log(path)
// TODO:  import { getEnums } from './bindings.js'
const enums = getEnums()

for (const [key, obj] of Object.entries(enums)) {
	const names = {}
	for (const [name, value] of Object.entries(obj)) {
		names[value] = name
	}
	enums[`${key}Names`] = names
}

export default enums
