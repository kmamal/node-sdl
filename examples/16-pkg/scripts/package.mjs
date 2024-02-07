import { execSync } from 'node:child_process'
import url from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const majorVersion = process.version.slice(0, process.version.indexOf('.'))
const target = `node${majorVersion}-${process.platform}-${process.arch}`
const ext = process.platform === 'win32' ? '.exe' : ''

execSync(`npx pkg --target ${target} --output dist/example${ext} .`, {
	cwd: path.resolve(__dirname, '..'),
	stdio: 'inherit',
})

await fs.promises.cp(
	path.join(__dirname, '../node_modules/@kmamal/sdl/dist'),
	path.join(__dirname, '../dist'),
	{
		recursive: true,
		verbatimSymlinks: true,
	},
)
