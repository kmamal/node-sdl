const Fs = require('fs')
const Path = require('path')

const dir = {}
dir.root = Path.join(__dirname, '../..')
dir.sdl = Path.join(dir.root, 'sdl')
dir.build = Path.join(dir.root, 'build')
dir.dist = Path.join(dir.root, 'dist')
dir.publish = Path.join(dir.root, 'publish')

const pkgPath = Path.join(dir.root, 'package.json')
const pkg = JSON.parse(Fs.readFileSync(pkgPath).toString())
const version = pkg.version
const [ , owner, repo ] = pkg.repository.url.match(/([^/:]+)\/([^/]+).git$/u)

const { platform, arch } = process
const targetArch = process.env.CROSS_COMPILE_ARCH || arch
const assetName = `sdl.node-v${version}-${platform}-${targetArch}.tar.gz`

const sdl = pkg.sdl
sdl.assetName = `SDL-v${sdl.version}-${platform}-${targetArch}.tar.gz`

module.exports = {
	dir,
	version,
	owner,
	repo,
	platform,
	arch,
	targetArch,
	assetName,
	sdl,
}
