import Fs from 'node:fs'
import { execSync } from 'node:child_process'
import { releaseDir, sdlBuildDir } from './util.mjs'

await Promise.all([
	Fs.promises.mkdir(releaseDir, { recursive: true }),
	Fs.promises.mkdir(sdlBuildDir, { recursive: true }),
])

execSync([
	'../configure',
	'--disable-joystick',
	'--disable-haptic',
	'--disable-hidapi',
	'--disable-sensor',
	'--disable-power',
	'--disable-filesystem',
	'--disable-timers',
	'--disable-file',
	'--disable-misc',
	'--disable-locale',
	'--disable-cpuinfo',
].join(' '), {
	cwd: sdlBuildDir,
	stdio: 'inherit',
})
execSync('make -j$(nproc)', {
	cwd: sdlBuildDir,
	stdio: 'inherit',
})
