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

console.log("build in", C.dir.build)
const SDL_INC = Path.join(C.dir.sdl, 'include')
const SDL_LIB = Path.join(C.dir.sdl, 'lib')

let archFlag = ''
if (process.env.CROSS_COMPILE_ARCH) {
	archFlag = `--arch ${process.env.CROSS_COMPILE_ARCH}`
}

process.chdir(C.dir.root)
execSync(`npx -y node-gyp rebuild ${archFlag} -j max --verbose`, {
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
	Fs.promises.copyFile(
		Path.join(C.dir.build, 'Release/sdl.node'),
		Path.join(C.dir.dist, 'sdl.node'),
	),
	(async () => {
		const libs = await Fs.promises.readdir(SDL_LIB)
		await Promise.all(libs.map(async (name) => {
			if (C.platform === 'win32' && name !== 'SDL2.dll') { return }
			await Fs.promises.cp(
				Path.join(SDL_LIB, name),
				Path.join(C.dir.dist, name),
				{ verbatimSymlinks: true },
			)
		}))
	})(),
])
