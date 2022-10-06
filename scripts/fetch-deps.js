const Https = require('https')
const Fs = require('fs')
const Path = require('path')
const Stream = require('stream')

const { folder, name } = {
	darwin: { folder: 'mac', name: 'libSDL2-2.0.0.dylib' },
	linux: { folder: 'linux', name: 'libSDL2-2.0.so.0' },
	win32: { folder: 'windown', name: 'SDL2.dll' },
}[process.platform]

const github = 'https://raw.githubusercontent.com/kmamal/node-sdl/master/deps'

;(async () => {
	const dir = Path.resolve(__dirname, `../deps/${folder}`)
	const file = Path.join(dir, name)

	try {
		await Fs.promises.access(file, Fs.constants.F_OK)
		console.log("deps are ok")
		return
	} catch (err) {
		console.log("missing", file)
	}

	console.log("mkdir", dir)
	console.log("fetch", `${github}/${folder}/${name}`)
	console.log("write", file)

	await Fs.promises.mkdir(dir, { recursive: true })
	await Stream.promises.pipeline(
		await new Promise((resolve) => {
			Https.get(`${github}/${folder}/${name}`, resolve)
		}),
		Fs.createWriteStream(file),
	)
})()
