import { execSync } from 'node:child_process'

if (!process.env.FROM_SOURCE) {
	try {
		execSync('npm run download-release', { stdio: 'inherit' })
		process.exit()
	} catch (_) {}
} else {
	console.log("build from source")
}

execSync('npm install --no-save zx', { stdio: 'inherit' })
execSync('npm run build', { stdio: 'inherit' })
