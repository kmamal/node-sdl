import { execSync } from 'node:child_process'

execSync('npm run fetch-sdl', { stdio: 'inherit' })
execSync('npm run rebuild-sdl', { stdio: 'inherit' })
execSync('npm run rebuild-lib', { stdio: 'inherit' })
