

export const sysRootDir = path.dirname(__dirname)
export const sysBuildDir = path.join(sysRootDir, 'build')
export const sysDistDir = path.join(sysRootDir, 'dist')
export const sysPublishDir = path.join(sysRootDir, 'publish')

export const posixRootDir = await within(async () => {
	$.verbose = false
	cd(sysRootDir)
	const { stdout } = await $`pwd`
	$.verbose = true
	return stdout.trim()
})
export const posixBuildDir = path.posix.join(posixRootDir, 'build')
export const posixDistDir = path.posix.join(posixRootDir, 'dist')
export const posixPublishDir = path.posix.join(posixRootDir, 'publish')

const pkg = await fs.readJson(path.join(sysRootDir, 'package.json'))
export const libVersion = pkg.version
export const sdlVersion = pkg.sdl.version
export const [ , owner, repo ] = pkg.repository.url.match(/([^/:]+)\/([^/]+).git$/u)

export const { platform } = process
export const arch = os.arch()
export const targetArch = platform === 'darwin' ? 'x64_arm64' : arch

export const assetName = `sdl.node-v${libVersion}-${platform}-${targetArch}.tar.gz`

export const sdlSharedLibsPattern = {
	darwin: 'libSDL2*.dylib',
	linux: 'libSDL2*.so*',
	win32: 'SDL2.dll*',
}[platform]
