import Path from 'node:path'
import { execSync } from 'node:child_process'
import Fs from 'node:fs'
import { fileURLToPath } from 'url'
const __dirname = Path.dirname(fileURLToPath(import.meta.url))

process.chdir(Path.join(__dirname, '../tests'))
const files = await Fs.promises.readdir('.')
for (const name of files) {
	if (!name.endsWith('.test.js')) { continue }
	execSync(`node ${name}`, { stdio: 'inherit' })
}
