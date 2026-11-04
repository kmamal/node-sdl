import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'

T.test("sdl::touch", (t) => {
	t.ok(Array.isArray(sdl.touch.devices))
})
