import { execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'

const majorVersion = process.version.slice(0, process.version.indexOf('.'))
const target = `node${majorVersion}-${process.platform}-${process.arch}`
const ext = process.platform === 'win32' ? '.exe' : ''

execSync(`npx pkg --target ${target} --output dist/example${ext} .`, {
	cwd: path.resolve(import.meta.dirname, '..'),
	stdio: 'inherit',
})

await fs.promises.cp(
	path.join(import.meta.dirname, '../node_modules/@kmamal/sdl/dist'),
	path.join(import.meta.dirname, '../dist'),
	{
		recursive: true,
		verbatimSymlinks: true,
	},
)
