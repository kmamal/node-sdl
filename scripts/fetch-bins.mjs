import Fs from 'node:fs'
import { Readable } from 'node:stream'
import { fetch } from 'undici'
import Tar from 'tar'
import {
	platform, arch,
	libVersion,
	releaseDir, sdlFilePath, libFilePath,
} from './util.mjs'

const tryFile = async (path) => {
	try {
		await Fs.promises.access(sdlFilePath, Fs.constants.F_OK)
		return true
	} catch (err) {
		console.log("missing", path)
		return false
	}
}

const filesFound = await Promise.all([
	tryFile(libFilePath),
	tryFile(sdlFilePath),
])

if (filesFound.every(Boolean)) {
	console.log("deps are ok")
	process.exit()
}

console.log("mkdir", releaseDir)
await Fs.promises.mkdir(releaseDir, { recursive: true })

const url = `https://github.com/kmamal/node-sdl/releases/download/v${libVersion}/sdl-v${libVersion}-${platform}-${arch}.tar.gz`

console.log("fetch", url)
const response = await fetch(url, { follow: true })
if (response.status !== 200) {
	console.error(`bad status code: ${response.status}`)
	process.exit(1)
}

console.log("unpack to", releaseDir)
const stream = Readable.fromWeb(response.body)
stream.pipe(Tar.x({ strip: 1, C: releaseDir }))
