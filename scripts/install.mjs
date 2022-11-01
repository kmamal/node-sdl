
if (!process.env.NODE_SDL_FROM_SOURCE) {
	try {
		await import('./download-release.mjs')
		process.exit()
	} catch (error) {}
} else {
	console.log("skip download and build from source")
}

await import('./download-sdl.mjs')
await import('./build.mjs')
