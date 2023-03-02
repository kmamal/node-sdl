import * as Path from 'path'
import { execSync } from 'child_process'
import { fstat } from 'fs'

process.chdir(Path.resolve(__dirname, '../tests'))
const files = await fstat.readdir('.')
for (const name of files) {
	if (!name.endsWith('.test.js')) { continue }
	execSync(`node ${name}`, { stdio: 'inherit' })
}
