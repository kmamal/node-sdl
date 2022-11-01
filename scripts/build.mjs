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

console.log("load @kmamal/build-sdl")
process.chdir(C.dir.root)
const { default: sdlPath } = await import('@kmamal/build-sdl')

console.log("build in", C.dir.build)
process.env.SDL_INC = Path.join(sdlPath, 'include')
process.env.SDL_LIB = Path.join(sdlPath, 'lib')

if (C.platform === 'darwin') {
	process.env.CC = 'clang'
	if (process.env.CROSS_COMPILE_ARCH) {
		process.env.ARCH_FLAG = `-arch ${process.env.CROSS_COMPILE_ARCH}`
	}
}

execSync(`npx node-gyp rebuild --verbose`, { stdio: 'inherit' })

console.log("install to", C.dir.dist)
await Fs.promises.rm(C.dir.dist, { recursive: true }).catch(() => {})
await Fs.promises.mkdir(C.dir.dist, { recursive: true })
await Promise.all([
	Fs.promises.copyFile(
		Path.join(C.dir.build, 'Release/sdl.node'),
		Path.join(C.dir.dist, 'sdl.node'),
	),
	(async () => {
		const libs = await Fs.promises.readdir(process.env.SDL_LIB)
		await Promise.all(libs.map(async (name) => {
			if (C.platform === 'win32' && name !== 'SDL2.dll') { return }
			await Fs.promises.cp(
				Path.join(process.env.SDL_LIB, name),
				Path.join(C.dir.dist, name),
				{ verbatimSymlinks: true },
			)
		}))
	})(),
])
