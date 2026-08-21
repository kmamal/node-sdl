import Fs from 'node:fs'
import Path from 'node:path'
import Url from 'node:url'
import { execFileSync } from 'node:child_process'

// Called from binding.gyp at configure time. Prints the SDL include or lib
// dir, downloading SDL first if it is missing. This allows rebuilding the
// package without going through scripts/build.mjs, which is what tools like
// electron-rebuild do.

const key = process.argv[2]
if (key !== 'include' && key !== 'lib') { throw new Error("usage: ensure-sdl.mjs include|lib") }

const fromEnv = process.env[key === 'include' ? 'SDL_INC' : 'SDL_LIB']
if (fromEnv) {
	process.stdout.write(fromEnv)
	process.exit(0)
}

const dirScripts = Path.dirname(Url.fileURLToPath(import.meta.url))
const dirSdl = Path.join(dirScripts, '..', 'sdl')

if (!Fs.existsSync(Path.join(dirSdl, 'include'))) {
	execFileSync(process.execPath, [ Path.join(dirScripts, 'download-sdl.mjs') ], {
		cwd: dirScripts,
		stdio: [ 'ignore', 2, 2 ], // gyp reads stdout, keep it clean
	})
}

process.stdout.write(Path.join(dirSdl, key))
