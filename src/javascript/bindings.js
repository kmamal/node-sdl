import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const path = resolve(__dirname, '../../dist/sdl.node')

// Current Node.js doesn't support import a c++ addon with "import" syntax,
// so we need to use "require" as a workaround.
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const nativeBindings = require(path)

export default nativeBindings