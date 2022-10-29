import Path from 'node:path'
import { execSync } from 'node:child_process'
import { fstat } from 'node:fs'

process.chdir(Path.resolve(__dirname, '../tests'))
const files = await fstat.readdir('.')
for (const name of files) {
	if (!name.endsWith('.test.js')) { continue }
	execSync(`node ${name}`, { stdio: 'inherit' })
}
