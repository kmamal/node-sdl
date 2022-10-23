const Fs = require('fs')
const Path = require('path')
const Os = require('os')

const pkgFilePath = Path.resolve(__dirname, '../package.json')
const { version: libVersion } = JSON.parse(Fs.readFileSync(pkgFilePath, 'utf8'))

const sdlVersionFilePath = Path.resolve(__dirname, '../SDL/include/SDL_version.h')
const sdlVersionFile = Fs.readFileSync(sdlVersionFilePath, 'utf8')
const [ , sdlVersionMajor ] = sdlVersionFile.match(/#define SDL_MAJOR_VERSION +(\d+)/u)
const [ , sdlVersionMinor ] = sdlVersionFile.match(/#define SDL_MINOR_VERSION +(\d+)/u)
const [ , sdlVersionPatch ] = sdlVersionFile.match(/#define SDL_PATCHLEVEL +(\d+)/u)
const sdlVersion = `${sdlVersionMajor}.${sdlVersionMinor}.${sdlVersionPatch}`

const { platform } = process
const arch = Os.arch()
const ext = {
	darwin: 'dylib',
	linux: 'so',
	win32: 'dll',
}[platform]

const sdlName = `SDL-${sdlVersion}-${platform}-${arch}.${ext}`

module.exports = {
	libVersion,
	sdlVersion,
	sdlName,
}
