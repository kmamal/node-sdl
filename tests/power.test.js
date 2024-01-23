const { test } = require('@kmamal/testing')
const sdl = require('../src/javascript/index.js')

test("sdl::power", (t) => {
	t.ok([ 'unknown', 'noBattery', 'battery', 'charging', 'charged' ].includes(sdl.power.info.state))

	if (sdl.power.info.seconds !== null) {
		t.equal(typeof sdl.power.info.seconds, 'number')
		t.ok(sdl.power.info.seconds > 0)
	}

	if (sdl.power.info.percent !== null) {
		t.equal(typeof sdl.power.info.percent, 'number')
		t.ok(0 <= sdl.power.info.percent <= 100)
	}
})
