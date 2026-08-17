import Fs from 'node:fs'
import Stream from 'node:stream'
import C from './util/common.js'
import * as Tar from 'tar'

const url = `https://github.com/${C.owner}/${C.repo}/releases/download/v${C.version}/${C.assetName}`

console.log("fetch", url)
const response = await fetch(url)
if (!response.ok) { throw new Error(`bad status code ${response.status}`) }

console.log("unpack to", C.dir.dist)
await Fs.promises.rm(C.dir.dist, { recursive: true }).catch(() => {})
await Fs.promises.mkdir(C.dir.dist, { recursive: true })
await Stream.promises.pipeline(
	Stream.Readable.fromWeb(response.body),
	Tar.extract({ gzip: true, C: C.dir.dist }),
)
