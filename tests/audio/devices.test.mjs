import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import { hasAudio, skip } from '../helpers/env.mjs'

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

T.test("sdl::audio::devices", (t) => {
	if (!hasAudio()) {
		skip("no audio")
		return
	}

	const checkFormat = (device) => {
		t.ok(device.format === null || typeof device.format === 'string')
		t.ok(Number.isInteger(device.channels) && device.channels > 0)
		t.ok(Number.isInteger(device.frequency) && device.frequency > 0)
		t.ok(Number.isInteger(device.buffered) && device.buffered >= 0)
	}

	for (const module of [ sdl.audio.playback, sdl.audio.recording ]) {
		t.ok(Array.isArray(module.devices))
		const [ defaultDevice, ...devices ] = module.devices
		t.equal(defaultDevice.id, null)
		t.equal(defaultDevice.name, null)
		checkFormat(defaultDevice)
		for (const device of devices) {
			t.equal(typeof device.id, 'number')
			t.equal(typeof device.name, 'string')
			t.ok(device.name.length > 0)
			checkFormat(device)
		}
	}
})
