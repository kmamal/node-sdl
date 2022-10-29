import Fs from 'node:fs'
import { once } from 'node:events'
import C from './util/common.js'
import { fetch } from './util/fetch.js'
import Tar from 'tar'

const url = `https://github.com/${C.owner}/${C.repo}/releases/download/v${C.version}/${C.assetName}`

console.log("fetch", url)
const response = await fetch(url)

console.log("unpack to", C.dir.dist)
await Fs.promises.rm(C.dir.dist, { recursive: true }).catch(() => {})
await Fs.promises.mkdir(C.dir.dist, { recursive: true })
const tar = Tar.extract({ gzip: true, C: C.dir.dist })
response.stream().pipe(tar)
await once(tar, 'finish')
