import * as Path from 'path'
import { execSync } from 'child_process'
import { fstat } from 'fs'
import { fileURLToPath } from 'url'
const __dirname = Path.dirname(fileURLToPath(import.meta.url))

process.chdir(Path.join(__dirname, '../tests'))
const files = await fstat.readdir('.')
for (const name of files) {
	if (!name.endsWith('.test.js')) { continue }
	execSync(`node ${name}`, { stdio: 'inherit' })
}
