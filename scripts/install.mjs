
if (!process.env.NODE_SDL_FROM_SOURCE) {
	try {
		await import('./download-release.mjs')
		process.exit(0)
	} catch (error) {
		console.log("failed to download release")
	}
} else {
	console.log("skip download and build from source")
}

try {
	await import('./download-sdl.mjs')
} catch (error) {
	console.log("failed to download sdl")
	await import('./build-sdl.mjs')
}

await import('./build.mjs')
