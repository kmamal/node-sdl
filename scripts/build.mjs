import {
	sysRootDir,
	posixBuildDir, posixDistDir,
} from './common.mjs'

await Promise.all([
	posixBuildDir,
	posixDistDir,
].map(async (dir) => {
	await fs.rm(dir, { recursive: true }).catch(() => {})
	await fs.mkdir(dir, { recursive: true })
}))

cd(sysRootDir)
const sysSdlPath = require('@kmamal/build-sdl')
process.env.SDL_INC = path.join(sysSdlPath, 'include')
process.env.SDL_LIB = path.join(sysSdlPath, 'lib')
await $`npx node-gyp rebuild --verbose`

await Promise.all([
	$`cp ${posixBuildDir}/Release/sdl.node ${posixDistDir}`,
	await $`cp -a ${process.env.SDL_LIB}/* ${posixDistDir}`,
])
