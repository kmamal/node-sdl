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

	t.equal(sdl.info.initialized, undefined)
})

T.test("sdl::video::drivers", (t) => {
	let drivers
	try { ({ drivers } = sdl.video) }
	catch {
		t.equal(sdl.video.isAvailable(), false)
		return
	}
	t.equal(sdl.video.isAvailable(), true)

	t.ok(Array.isArray(drivers.all))
	for (const driver of drivers.all) {
		t.equal(typeof driver, 'string')
		t.ok(driver.length > 0)
	}
	t.equal(typeof drivers.current, 'string')
	t.ok(drivers.all.includes(drivers.current))
})

T.test("sdl::audio::drivers", (t) => {
	let drivers
	try { ({ drivers } = sdl.audio) }
	catch {
		t.equal(sdl.audio.isAvailable(), false)
		return
	}
	t.equal(sdl.audio.isAvailable(), true)

	t.ok(Array.isArray(drivers.all))
	for (const driver of drivers.all) {
		t.equal(typeof driver, 'string')
		t.ok(driver.length > 0)
	}
	t.equal(typeof drivers.current, 'string')
	t.ok(drivers.all.includes(drivers.current))
})

T.test("sdl::isAvailable", (t) => {
	for (const module of [ sdl.video, sdl.keyboard, sdl.mouse, sdl.touch, sdl.clipboard, sdl.audio, sdl.joystick, sdl.gamepad, sdl.sensor ]) {
		t.equal(typeof module.isAvailable(), 'boolean')
	}
	t.equal(sdl.keyboard.isAvailable(), sdl.video.isAvailable())
})
