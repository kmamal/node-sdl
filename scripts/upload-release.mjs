import {
	owner, repo, libVersion,
	sysDistDir, posixPublishDir,
	assetName,
} from './common.mjs'

const commonHeaders = {
	Accept: 'application/vnd.github+json',
	Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
}

let response

getRelease: {
	echo("get release", libVersion)

	$.verbose = false
	response = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/releases/tags/v${libVersion}`,
		{ headers: commonHeaders },
	)
	$.verbose = true

	if (response.ok) {
		echo("release exists", libVersion)
		break getRelease
	}

	echo("bad status code", response.status)
	echo("create release", libVersion)

	$.verbose = false
	response = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/releases`,
		{
			headers: commonHeaders,
			method: 'POST',
			body: JSON.stringify({
				tag_name: `v${libVersion}`, // eslint-disable-line camelcase
				name: `v${libVersion}`,
			}),
		},
	)
	$.verbose = true
	if (!response.ok) { throw new Error(`bad status code ${response.status}`) }
}
const releaseId = (await response.json()).id

echo("create archive", assetName)
await $`mkdir -p ${posixPublishDir}`
const assetPath = path.join(posixPublishDir, assetName)

cd(sysDistDir)
await $`tar czf ${assetPath} *`
const buffer = await fs.readFile(assetPath)

$.verbose = false
response = await fetch(
	`https://api.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets`,
	{ headers: commonHeaders },
)
$.verbose = true
if (!response.ok) { throw new Error(`bad status code ${response.status}`) }

const list = await response.json()
const asset = list.find((x) => x.name === assetName)
if (asset) {
	echo("delete asset", assetName)
	$.verbose = false
	response = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/releases/assets/${asset.id}`,
		{
			headers: commonHeaders,
			method: 'DELETE',
		},
	)
	$.verbose = true
	if (!response.ok) { throw new Error(`bad status code ${response.status}`) }
}

echo("upload", assetName)
$.verbose = false
response = await fetch(
	`https://uploads.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets?name=${assetName}`,
	{
		headers: {
			...commonHeaders,
			'Content-Type': 'application/gzip',
			'Content-Length': buffer.length,
		},
		method: 'POST',
		body: buffer,
	},
)
$.verbose = true
if (!response.ok) { throw new Error(`bad status code ${response.status}`) }
