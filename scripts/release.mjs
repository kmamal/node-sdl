import { execSync } from 'node:child_process'

await import('./clean.mjs')

execSync('npm install', {
	stdio: 'inherit',
	env: {
		...process.env,
		NODE_SDL_FROM_SOURCE: 1,
	},
})

await import('./upload-release.mjs')
