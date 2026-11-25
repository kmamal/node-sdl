import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import { skip } from '../helpers/env.mjs'

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

T.test("sdl::video::displays", (t) => {
	t.ok(Array.isArray(sdl.video.displays))

	if (sdl.video.displays.length === 0) {
		skip("no displays found")
		return
	}

	for (const display of sdl.video.displays) {
		t.equal(typeof display.id, 'number')
		t.equal(typeof display.name, 'string')
		t.ok(display.name.length > 0)

		if (display.format !== null) {
			t.equal(typeof display.format, 'string')
			t.ok(display.format.length > 0)
		}

		if (display.frequency !== null) {
			t.equal(typeof display.frequency, 'number')
		}

		t.equal(typeof display.geometry.x, 'number')
		t.equal(typeof display.geometry.y, 'number')
		t.equal(typeof display.geometry.width, 'number')
		t.equal(typeof display.geometry.height, 'number')

		t.equal(typeof display.usable.x, 'number')
		t.equal(typeof display.usable.y, 'number')
		t.equal(typeof display.usable.width, 'number')
		t.equal(typeof display.usable.height, 'number')

		if (display.scale !== null) {
			t.equal(typeof display.scale, 'number')
		}

		if (display.orientation !== null) {
			t.equal(typeof display.orientation, 'string')
		}

		if (display.mode !== null) {
			t.equal(typeof display.mode.width, 'number')
			t.equal(typeof display.mode.height, 'number')
			t.ok(display.modes.some((mode) => (
				mode.width === display.mode.width
				&& mode.height === display.mode.height
				&& mode.pixelDensity === display.mode.pixelDensity
				&& mode.frequency === display.mode.frequency
				&& mode.format === display.mode.format
			)))
		}

		t.ok(Array.isArray(display.modes))
		for (const mode of display.modes) {
			t.equal(typeof mode.width, 'number')
			t.ok(mode.width > 0)
			t.equal(typeof mode.height, 'number')
			t.ok(mode.height > 0)
			t.equal(typeof mode.pixelDensity, 'number')
			t.ok(mode.pixelDensity > 0)

			if (mode.frequency !== null) {
				t.equal(typeof mode.frequency, 'number')
				t.ok(mode.frequency > 0)
			}

			if (mode.format !== null) {
				t.equal(typeof mode.format, 'string')
				t.ok(mode.format.length > 0)
			}
		}
	}
})
