import Fs from 'node:fs'
import Path from 'node:path'
import { execSync } from 'node:child_process'

for await (const { name } of await Fs.promises.opendir(__dirname)) {
	execSync(`node ${Path.join(__dirname, name)}`)
}
