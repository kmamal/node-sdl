const Bindings = require('../../..')

Bindings.setLogger((x) => console.log('SDL>', x))

const window = new Bindings.Window({ title: "JavaScript" })

for (;;) {
	for (;;) {
		const event = Bindings.pollEvent()
		if (!event) { break }

		switch (event.type) {
			case 'quit': { process.exit() }

			// No default
		}
	}

	// Do work here
}
