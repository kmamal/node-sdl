import {
	sysRootDir,
	posixBuildDir, posixDistDir,
} from './common.mjs'

await $`rm -rf ${posixBuildDir} ${posixDistDir}`
await Promise.all([
	$`mkdir -p ${posixBuildDir}`,
	$`mkdir -p ${posixDistDir}`,
])

cd(sysRootDir)

const sysSdlPath = require('@kmamal/build-sdl')
process.env.SDL_INC = path.join(sysSdlPath, 'include')
process.env.SDL_LIB = path.join(sysSdlPath, 'lib')

await $`npx node-gyp rebuild --verbose`

await $`mkdir -p ${posixDistDir}`
await Promise.all([
	$`cp ${posixBuildDir}/Release/sdl.node ${posixDistDir}`,
	await $`cp -a ${process.env.SDL_LIB}/* ${posixDistDir}`,
])
