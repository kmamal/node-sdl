import T from '@kmamal/testing'
import sdl from '../src/javascript/index.js'

T.test("sdl::info", (t) => {
	t.equal(typeof sdl.info.version.compile.major, 'number')
	t.equal(typeof sdl.info.version.compile.minor, 'number')
	t.equal(typeof sdl.info.version.compile.patch, 'number')

	t.equal(typeof sdl.info.version.runtime.major, 'number')
	t.equal(typeof sdl.info.version.runtime.minor, 'number')
	t.equal(typeof sdl.info.version.runtime.patch, 'number')

	t.ok([ 'Linux', 'Mac OS X', 'Windows' ].includes(sdl.info.platform))

	t.ok(Array.isArray(sdl.info.drivers.video.all))
	for (const driver of sdl.info.drivers.video.all) {
		t.equal(typeof driver, 'string')
		t.ok(driver.length > 0)
	}
	t.equal(typeof sdl.info.drivers.video.current, 'string')
	t.ok(sdl.info.drivers.video.all.includes(sdl.info.drivers.video.current))

	t.ok(Array.isArray(sdl.info.drivers.audio.all))
	for (const driver of sdl.info.drivers.audio.all) {
		t.equal(typeof driver, 'string')
		t.ok(driver.length > 0)
	}
	t.equal(typeof sdl.info.drivers.audio.current, 'string')
	t.ok(sdl.info.drivers.audio.all.includes(sdl.info.drivers.audio.current))
})
