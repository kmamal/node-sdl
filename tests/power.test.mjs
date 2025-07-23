import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

T.test("sdl::power", (t) => {
	t.ok([ 'noBattery', 'battery', 'charging', 'charged', null ].includes(sdl.power.info.state))

	if (sdl.power.info.seconds !== null) {
		t.equal(typeof sdl.power.info.seconds, 'number')
		t.ok(sdl.power.info.seconds > 0)
	}

	if (sdl.power.info.percent !== null) {
		t.equal(typeof sdl.power.info.percent, 'number')
		t.ok(0 <= sdl.power.info.percent <= 100)
	}
})
