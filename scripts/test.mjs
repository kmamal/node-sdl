
cd(path.join(__dirname, '..', 'tests'))
for (const name of await glob('*.test.js')) {
	await $`node ${name}`
}
