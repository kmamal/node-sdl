import { execSync } from 'node:child_process'

if (process.env.SKIP_SCRIPT) { process.exit() }

try {
	execSync('npm run fetch-bins', { stdio: 'inherit' })
} catch (error) {
	execSync('SKIP_SCRIPT=1 npm install --include=dev', { stdio: 'inherit' })
	execSync('npm run build', { stdio: 'inherit' })
}
