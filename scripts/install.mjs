
import C from './util/common.js'

if (C.systemSdl) {
	console.log("build against the system sdl")
	await import('./build.mjs')
	process.exit(0)
}

if (!C.fromSource) {
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
