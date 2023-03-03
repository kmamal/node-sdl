import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const path = resolve(__dirname, '../../dist/sdl.node')
console.log(path)

export default await import(path)
