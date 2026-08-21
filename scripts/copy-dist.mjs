import Fs from 'node:fs'
import Path from 'node:path'
import C from './util/common.js'

// Called from binding.gyp after building. Copies the addon and the SDL
// libraries to dist/, which is where bindings.js loads them from. This makes
// rebuilds that don't go through scripts/build.mjs (e.g. electron-rebuild)
// actually take effect.

const productDir = process.argv[2]
if (!productDir) { throw new Error("usage: copy-dist.mjs <product-dir>") }

const sdlLib = process.env.SDL_LIB || Path.join(C.dir.sdl, 'lib')

await Fs.promises.mkdir(C.dir.dist, { recursive: true })

await Promise.all([
	Fs.promises.cp(
		Path.join(productDir, 'sdl.node'),
		Path.join(C.dir.dist, 'sdl.node'),
	),
	(async () => {
		const libs = await Fs.promises.readdir(sdlLib)
		await Promise.all(libs.map(async (name) => {
			if (C.platform === 'win32' && name !== 'SDL2.dll') { return }
			await Fs.promises.cp(
				Path.join(sdlLib, name),
				Path.join(C.dir.dist, name),
				{ verbatimSymlinks: true },
			)
		}))
	})(),
	// Include SDL's license (older build-sdl assets don't ship it)
	Fs.promises.cp(
		Path.join(C.dir.sdl, 'LICENSE.txt'),
		Path.join(C.dir.dist, 'LICENSE.SDL.txt'),
	).catch(() => {}),
])
