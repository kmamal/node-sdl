const SDL = require('../../..')

SDL.setLogger((x) => console.log('SDL>', x))

const window = new SDL.Window({ title: "JavaScript" })

for (;;) {
	for (;;) {
		const event = SDL.pollEvent()
		if (!event) { break }

		switch (event.type) {
			case 'quit': { process.exit() }

			// No default
		}
	}

	// Do work here
}
