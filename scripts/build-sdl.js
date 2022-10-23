const { execSync } = require('child_process')
const Path = require('path')
const Fs = require('fs')

const releaseDir = Path.resolve(__dirname, '../build/Release')

const sdlDir = Path.resolve(__dirname, '../SDL')
const sdlBuildDir = Path.join(sdlDir, 'build')

Fs.mkdirSync(releaseDir, { recursive: true })
Fs.mkdirSync(sdlBuildDir, { recursive: true })

execSync([
	'../configure',
	'make -j$(nproc)',
].join(' && '), {
	cwd: sdlBuildDir,
	stdio: 'inherit',
})
