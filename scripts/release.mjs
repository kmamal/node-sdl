
await $`npm run clean`
process.env.FROM_SOURCE = 1
await $`npm install --include=dev`
await $`npm run upload-release`
