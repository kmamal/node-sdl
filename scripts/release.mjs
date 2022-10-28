
await $`npm run clean`
process.env.KMAMAL_SDL_FROM_SOURCE = 1
await $`npm install`
await $`npm run upload-release`
