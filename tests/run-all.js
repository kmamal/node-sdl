const Fs = require('fs/promises')
const Path = require('path')
const { execSync } = require('child_process')

;(async () => {
	for await (const { name } of await Fs.opendir(__dirname)) {
		execSync(`node ${Path.join(__dirname, name)}`)
	}
})()
