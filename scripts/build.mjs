import Fs from 'node:fs'
import Path from 'node:path'
import { execSync } from 'node:child_process'
import C from './util/common.js'

await Promise.all([
	C.dir.build,
	C.dir.dist,
	C.dir.publish,
].map(async (dir) => {
	await Fs.promises.rm(dir, { recursive: true }).catch(() => {})
}))

let SDL_INC = Path.join(C.dir.sdl, 'include')
let SDL_LIB = Path.join(C.dir.sdl, 'lib')
if (C.systemSdl) {
	const pkgConfig = process.env.PKG_CONFIG || 'pkg-config'
	const query = (variable) => execSync(`${pkgConfig} --variable=${variable} sdl3`, { encoding: 'utf8' }).trim()
	SDL_INC = process.env.SDL_INC || query('includedir')
	SDL_LIB = process.env.SDL_LIB || query('libdir')
	console.log("system sdl in", SDL_INC, SDL_LIB)
}

console.log("build in", C.dir.build)

let archFlag = ''
if (process.env.CROSS_COMPILE_ARCH) {
	archFlag = `--arch ${process.env.CROSS_COMPILE_ARCH}`
}

let parallelFlag = '-j max'
if (C.noParallel) {
	parallelFlag = ''
}

process.chdir(C.dir.root)
execSync(`npx -y node-gyp rebuild ${archFlag} ${parallelFlag} --verbose`, {
	stdio: 'inherit',
	env: {
		...process.env,
		SDL_INC,
		SDL_LIB,
	},
})

console.log("install to", C.dir.dist)
await Fs.promises.rm(C.dir.dist, { recursive: true }).catch(() => {})
await Fs.promises.mkdir(C.dir.dist, { recursive: true })
await Promise.all([
	Fs.promises.cp(
		Path.join(C.dir.build, 'Release/sdl.node'),
		Path.join(C.dir.dist, 'sdl.node'),
	),
	...C.systemSdl ? [] : [
		(async () => {
			const libs = await Fs.promises.readdir(SDL_LIB)
			await Promise.all(libs.map(async (name) => {
				if (C.platform === 'win32' && name !== 'SDL3.dll') { return }
				await Fs.promises.cp(
					Path.join(SDL_LIB, name),
					Path.join(C.dir.dist, name),
					{ verbatimSymlinks: true },
				)
			}))
		})(),
		// Include SDL's license
		Fs.promises.cp(
			Path.join(C.dir.sdl, 'LICENSE.txt'),
			Path.join(C.dir.dist, 'LICENSE.SDL.txt'),
		),
	],
])

// Strip binaries on linux
if (C.platform === 'linux') {
	execSync(`strip -s "${Path.join(C.dir.dist, 'sdl.node')}"`)
}
