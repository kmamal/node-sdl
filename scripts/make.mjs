import {
	platform,
	sysRootDir,
	posixRootDir, posixBuildDir, posixDistDir,
	sdlSharedLibsPattern,
} from './common.mjs'

const { SDL_INC, SDL_LIB } = process.env
const isIncVarMissing = !SDL_INC
const isLibVarMissing = !SDL_LIB
const areVarsMissing = isIncVarMissing || isLibVarMissing
if (areVarsMissing) {
	echo(isIncVarMissing ? "SDL_INC is not set" : `SDL_INC=${SDL_INC}`)
	echo(isLibVarMissing ? "SDL_LIB is not set" : `SDL_LIB=${SDL_LIB}`)

	echo("trying to use @kmamal/build-sdl instead")
	try {
		const sysSdlPath = require('@kmamal/build-sdl')
		const posixSdlPath = await within(async () => {
			$.verbose = false
			cd(sysSdlPath)
			const { stdout } = await $`pwd`
			$.verbose = true
			return stdout.trim()
		})
		process.env.SDL_INC = path.posix.join(posixSdlPath, 'include')
		process.env.SDL_LIB = path.posix.join(posixSdlPath, 'lib')
	} catch (error) {
		echo("failed to use sdl via @kmamal/build-sdl")
		process.exit(1)
	}
}

if (platform === 'darwin') {
	process.env.CC = `sh ${path.posix.join(posixRootDir, 'scripts/clang-fat.sh')}`
	process.env.CXX = `sh ${path.posix.join(posixRootDir, 'scripts/clang++-fat.sh')}`
}

cd(sysRootDir)
await $`npx node-gyp rebuild --verbose`

await $`mkdir -p ${posixDistDir}`
await Promise.all([
	$`cp ${posixBuildDir}/Release/sdl.node ${posixDistDir}`,
	(async () => {
		const files = await glob(`${process.env.SDL_LIB}/${sdlSharedLibsPattern}`)
		await $`cp ${files} ${posixDistDir}`
	})(),
])
