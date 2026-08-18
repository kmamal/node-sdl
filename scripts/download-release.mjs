import Fs from 'node:fs'
import Zlib from 'node:zlib'
import Stream from 'node:stream'
import C from './util/common.js'
import { unpackTar } from 'modern-tar/fs'

const url = `https://github.com/${C.owner}/${C.repo}/releases/download/v${C.version}/${C.assetName}`

console.log("fetch", url)
const response = await fetch(url)
if (!response.ok) { throw new Error(`bad status code ${response.status}`) }

console.log("unpack to", C.dir.dist)
await Fs.promises.rm(C.dir.dist, { recursive: true }).catch(() => {})
await Fs.promises.mkdir(C.dir.dist, { recursive: true })
await Stream.promises.pipeline(
	Stream.Readable.fromWeb(response.body),
	Zlib.createGunzip(),
	unpackTar(C.dir.dist),
)
