import Fs from 'node:fs'
import Path from 'node:path'
import C from './util/common.js'
import { fetch } from './util/fetch.js'
import Tar from 'tar'

const commonHeaders = {
	"Accept": 'application/vnd.github+json',
	"Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
	'User-Agent': `@${C.owner}/${C.repo}@${C.version}`,
}

let response

getRelease: {
	console.log("get release", C.version)

	try {
		response = await fetch(
			`https://api.github.com/repos/${C.owner}/${C.repo}/releases/tags/v${C.version}`,
			{ headers: commonHeaders },
		)
		console.log("release exists", C.version)
		break getRelease
	} catch (error) {
		console.log(error.message)
	}

	console.log("create release", C.version)

	response = await fetch(
		`https://api.github.com/repos/${C.owner}/${C.repo}/releases`,
		{
			method: 'POST',
			headers: commonHeaders,
			body: JSON.stringify({
				tag_name: `v${C.version}`, // eslint-disable-line camelcase
				name: `v${C.version}`,
				prerelease: C.isPrerelease,
				make_latest: `${!C.isPrerelease}`, // eslint-disable-line camelcase
			}),
		},
	)
}
const releaseId = (await response.json()).id

console.log("create archive", C.assetName)
await Fs.promises.rm(C.dir.publish, { recursive: true }).catch(() => {})
await Fs.promises.mkdir(C.dir.publish, { recursive: true })
const assetPath = Path.join(C.dir.publish, C.assetName)

process.chdir(C.dir.dist)
await Tar.create(
	{ gzip: true, file: assetPath },
	await Fs.promises.readdir('.'),
)
const buffer = await Fs.promises.readFile(assetPath)

response = await fetch(
	`https://api.github.com/repos/${C.owner}/${C.repo}/releases/${releaseId}/assets`,
	{ headers: commonHeaders },
)

const list = await response.json()
const asset = list.find((x) => x.name === C.assetName)
if (asset) {
	console.log("delete asset", C.assetName)
	await fetch(
		`https://api.github.com/repos/${C.owner}/${C.repo}/releases/assets/${asset.id}`,
		{
			method: 'DELETE',
			headers: commonHeaders,
		},
	)
}

console.log("upload", C.assetName)
await fetch(
	`https://uploads.github.com/repos/${C.owner}/${C.repo}/releases/${releaseId}/assets?name=${C.assetName}`,
	{
		method: 'POST',
		headers: {
			...commonHeaders,
			'Content-Type': 'application/gzip',
		},
		body: buffer,
	},
)
