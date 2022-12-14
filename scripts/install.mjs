
if (!process.env.NODE_SDL_FROM_SOURCE) {
	try {
		await import('./download-release.mjs')
		process.exit(0)
	} catch (error) {}
} else {
	console.log("skip download and build from source")
}

await import('./download-sdl.mjs')
await import('./build.mjs')
