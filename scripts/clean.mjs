import {
	sysRootDir,
	posixBuildDir,
	posixDistDir,
	posixPublishDir,
} from './common.mjs'

const dirs = [
	posixBuildDir,
	posixDistDir,
	posixPublishDir,
]

cd(sysRootDir)
await $`rm -rf node_modules ${dirs}`
