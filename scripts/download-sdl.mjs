import Fs from 'node:fs'
import { once } from 'node:events'
import C from './util/common.js'
import { fetch } from './util/fetch.js'
import Tar from 'tar'

const url = `https://github.com/${C.sdl.owner}/${C.sdl.repo}/releases/download/v${C.sdl.version}/${C.sdl.assetName}`

console.log("fetch", url)
const response = await fetch(url)

console.log("unpack to", C.dir.sdl)
await Fs.promises.rm(C.dir.sdl, { recursive: true }).catch(() => {})
await Fs.promises.mkdir(C.dir.sdl, { recursive: true })
const tar = Tar.extract({ gzip: true, C: C.dir.sdl })
response.stream().pipe(tar)
await once(tar, 'finish')
