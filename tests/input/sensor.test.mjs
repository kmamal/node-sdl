import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'

T.test("sdl::sensor", (t) => {
	t.equal(sdl.sensor.STANDARD_GRAVITY, 9.80665)
	t.ok(Array.isArray(sdl.sensor.devices))
})
