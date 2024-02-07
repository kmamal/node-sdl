import { execSync } from 'node:child_process'
import url from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

execSync('npx pkg --output dist/example .', {
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
