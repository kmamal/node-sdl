import Fs from 'node:fs'
import Path from 'node:path'
import { once } from 'node:events'
import C from './util/common.js'
import { fetch } from './util/fetch.js'
import Tar from 'tar'

const url = `https://github.com/${C.sdl.owner}/${C.sdl.repo}/archive/refs/tags/v${C.sdl.version}.tar.gz`

console.log("fetch", url)
const response = await fetch(url)

console.log("unpack to", C.dir.sdl)
await Fs.promises.rm(C.dir.sdl, { recursive: true }).catch(() => {})
await Fs.promises.mkdir(C.dir.sdl, { recursive: true })
const tar = Tar.extract({ gzip: true, C: C.dir.sdl })
response.stream().pipe(tar)
await once(tar, 'finish')

const sdlRoot = Path.join(C.dir.sdl, `${C.sdl.repo}-${C.sdl.version}`)
await import(Path.join(sdlRoot, '/scripts/build.mjs'))
const sdlDist = Path.join(sdlRoot, 'dist')
await Promise.all([
	Fs.promises.cp(
		Path.join(sdlDist, 'include'),
		Path.join(C.dir.sdl, 'include'),
		{ recursive: true },
	),
	Fs.promises.cp(
		Path.join(sdlDist, 'lib'),
		Path.join(C.dir.sdl, 'lib'),
		{ recursive: true },
	),
])
