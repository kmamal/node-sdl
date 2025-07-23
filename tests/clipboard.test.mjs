import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

T.test("sdl::clipboard", (t) => {
	if (sdl.clipboard.text !== null) {
		t.equal(typeof sdl.clipboard.text, 'string')
	}

	const random1 = `${Math.random()}`.slice(2)
	sdl.clipboard.setText(random1)
	t.equal(sdl.clipboard.text, random1)

	const random2 = `${Math.random()}`.slice(2)
	sdl.clipboard.setText(random2)
	t.equal(sdl.clipboard.text, random2)
})
