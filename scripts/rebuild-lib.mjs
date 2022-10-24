import Fs from 'node:fs'
import Path from 'node:path'
import { execSync } from 'node:child_process'
import { globby } from 'globby'
import { platform, rootDir, sdlBuildDir, releaseDir } from './util.mjs'

execSync('npx node-gyp rebuild --verbose', {
	cwd: rootDir,
	stdio: 'inherit',
})

switch (platform) {
	case 'linux': {
		const matches = await globby([ 'build/.libs/libSDL2*.so*' ], {
			cwd: sdlBuildDir,
		})

		for await (const path of matches) {
			Fs.promises.cp(
				Path.join(sdlBuildDir, path),
				Path.join(releaseDir, Path.basename(path)),
				{ verbatimSymlinks: true },
			)
		}
	} break

	default: break
}
