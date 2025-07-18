import { execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { rootCertificates } from 'node:tls'

const rootDir = path.resolve(import.meta.dirname, '..')

execSync('npx webpack', {
	cwd: rootDir,
	stdio: 'inherit',
})

await fs.promises.writeFile(
	path.join(rootDir, 'build/package.json'),
	JSON.stringify({
		main: "index.js",
		bin: "index.js",
		pkg: {
			scripts: "index.js",
			assets: [ "../assets/**/*" ],
		},
	}, null, 2),
)

const majorVersion = process.version.slice(0, process.version.indexOf('.'))
const target = `node${majorVersion}-${process.platform}-${process.arch}`
const ext = process.platform === 'win32' ? '.exe' : ''

execSync(`npx pkg --target ${target} --output dist/example${ext} ./build/package.json`, {
	cwd: rootDir,
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
