import {
	sysRootDir,
	posixBuildDir,
	posixDistDir,
	posixPublishDir,
} from './common.mjs'

await Promise.all([
	path.join(sysRootDir, 'node_modules'),
	posixBuildDir,
	posixDistDir,
	posixPublishDir,
].map(async (dir) => {
	await fs.rm(dir, { recursive: true }).catch(() => {})
}))
