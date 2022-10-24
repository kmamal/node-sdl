import Fs from 'node:fs'
import Path from 'node:path'
import Os from 'node:os'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
export const scriptsDir = Path.dirname(__filename)
export const rootDir = Path.dirname(scriptsDir)
export const releaseDir = Path.join(rootDir, 'build/Release')

export const sdlDir = Path.join(rootDir, 'SDL')
export const sdlBuildDir = Path.join(sdlDir, 'build')

const pkgFilePath = Path.resolve(rootDir, 'package.json')
const pkg = JSON.parse(Fs.readFileSync(pkgFilePath, 'utf8'))

export const libVersion = pkg.version
export const sdlVersion = pkg.sdl.version

export const { platform } = process
export const arch = Os.arch()
export const sharedLibExt = {
	darwin: 'dylib',
	linux: 'so',
	win32: 'dll',
}[platform]

export const libFileName = 'sdl.node'
export const sdlFileName = `${{
	darwin: 'libSDL2',
	linux: 'libSDL2',
	win32: 'SDL2',
}[platform]}.${sharedLibExt}`

export const libFilePath = Path.join(releaseDir, libFileName)
export const sdlFilePath = Path.join(releaseDir, sdlFileName)
