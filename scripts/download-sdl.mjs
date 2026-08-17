import Fs from 'node:fs'
import Stream from 'node:stream'
import C from './util/common.js'
import * as Tar from 'tar'

const url = `https://github.com/${C.sdl.owner}/${C.sdl.repo}/releases/download/v${C.sdl.version}/${C.sdl.assetName}`

try {
	console.log("fetch", url)
	const response = await fetch(url)
	if (!response.ok) { throw new Error(`bad status code ${response.status}`) }

	console.log("unpack to", C.dir.sdl)
	await Fs.promises.rm(C.dir.sdl, { recursive: true }).catch(() => {})
	await Fs.promises.mkdir(C.dir.sdl, { recursive: true })
	await Stream.promises.pipeline(
		Stream.Readable.fromWeb(response.body),
		Tar.extract({ gzip: true, C: C.dir.sdl }),
	)
}
catch (error) {
	console.log(error)
	throw error
}
