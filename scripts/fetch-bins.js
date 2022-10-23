const Https = require('https')
const Fs = require('fs')
const Path = require('path')
const Stream = require('stream')
const { libname } = require('./util')

const github = 'https://raw.githubusercontent.com/kmamal/node-sdl/master/deps'

;(async () => {
	const file = Path.resolve(__dirname, `../build/Release/${libname}`)

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