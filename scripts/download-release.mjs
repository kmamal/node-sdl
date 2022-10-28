import {
	owner, repo, version,
	posixDistDir,
	sysDistDir,
	assetName,
} from './common.mjs'

const url = `https://github.com/${owner}/${repo}/releases/download/v${version}/${assetName}`

echo("fetch", url)
$.verbose = false
const response = await fetch(url)
if (!response.ok) { throw new Error(`bad status code ${response.status}`) }
$.verbose = true

echo("unpack to", sysDistDir)
await fs.rm(posixDistDir, { recursive: true }).catch(() => {})
await fs.mkdir(posixDistDir, { recursive: true })
const tar = $`tar xz -C ${posixDistDir}`
response.body.pipe(tar.stdin)
await tar
