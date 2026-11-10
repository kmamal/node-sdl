import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

T.test("sdl::info", (t) => {
	t.equal(typeof sdl.info.version.compile.major, 'number')
	t.equal(typeof sdl.info.version.compile.minor, 'number')
	t.equal(typeof sdl.info.version.compile.patch, 'number')

	t.equal(typeof sdl.info.version.runtime.major, 'number')
	t.equal(typeof sdl.info.version.runtime.minor, 'number')
	t.equal(typeof sdl.info.version.runtime.patch, 'number')

	t.ok([ 'Linux', 'macOS', 'Windows' ].includes(sdl.info.platform))
})

T.test("sdl::isAvailable", (t) => {
	for (const module of [ sdl.video, sdl.keyboard, sdl.mouse, sdl.touch, sdl.clipboard, sdl.audio, sdl.joystick, sdl.gamepad, sdl.sensor ]) {
		t.equal(typeof module.isAvailable(), 'boolean')
	}
	t.equal(sdl.keyboard.isAvailable(), sdl.video.isAvailable())
})
