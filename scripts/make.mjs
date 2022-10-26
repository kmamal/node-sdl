import {
	sysRootDir,
	posixBuildDir, posixDistDir,
	sdlSharedLibsPattern,
} from './common.mjs'

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
