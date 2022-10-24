import Fs from 'fs'
import { fetch } from 'undici'
import Tar from 'tar'
import { Readable } from 'node:stream'
import { sdlVersion, sdlDir } from './util.mjs'

const url = `https://github.com/libsdl-org/SDL/archive/refs/tags/release-${sdlVersion}.tar.gz`

console.log("fetch", url)
const response = await fetch(url, { follow: true })
if (response.status !== 200) {
	console.error(`bad status code: ${response.status}`)
	process.exit(1)
}

console.log("unpack to", sdlDir)
Fs.mkdirSync(sdlDir, { recursive: true })
const stream = Readable.fromWeb(response.body)
stream.pipe(Tar.x({ strip: 1, C: sdlDir }))
