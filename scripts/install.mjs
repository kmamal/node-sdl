
if (!process.env.NODE_SDL_FROM_SOURCE) {
	try {
		await $`npm run download-release`
		process.exit()
	} catch (error) {}
} else {
	echo("skip download and build from source")
}

await $`npm run build`
