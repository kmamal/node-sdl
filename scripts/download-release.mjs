import {
	owner, repo, version,
	posixDistDir,
	assetName,
} from './common.mjs'

const url = `https://github.com/${owner}/${repo}/releases/download/v${version}/${assetName}`

echo("fetch", url)
$.verbose = false
const response = await fetch(url)
if (!response.ok) { throw new Error(`bad status code ${response.status}`) }
$.verbose = true

echo("unpack to", posixDistDir)
await $`mkdir -p ${posixDistDir}`
const tar = $`tar xz -C ${posixDistDir}`
response.body.pipe(tar.stdin)
await tar
