
const fromSource = ![ undefined, '', '0', 'false' ].includes(process.env.NODE_SDL_FROM_SOURCE)

if (!fromSource) {
	try {
		await import('./download-release.mjs')
		process.exit(0)
	}
	catch (error) {
		console.log("failed to download release:", error.cause?.message ?? error.message)
	}
}
else {
	console.log("skip download and build from source")
}

try {
	await import('./download-sdl.mjs')
}
catch (error) {
	console.log("failed to download sdl:", error.cause?.message ?? error.message)
	await import('./build-sdl.mjs')
}

await import('./build.mjs')
