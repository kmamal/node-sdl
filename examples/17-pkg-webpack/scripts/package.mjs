import { execSync } from 'node:child_process'
import url from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { rootCertificates } from 'node:tls'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

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
	path.join(__dirname, '../node_modules/@kmamal/sdl/dist'),
	path.join(__dirname, '../dist'),
	{
		recursive: true,
		verbatimSymlinks: true,
	},
)
