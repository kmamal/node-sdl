import T from '@kmamal/testing'
import { reconcileDevices } from '../src/javascript/events/reconcile.js'
import { keys as joystickKeys } from '../src/javascript/joystick/device.js'
import { keys as audioKeys } from '../src/javascript/audio/device.js'
import { keys as displayKeys } from '../src/javascript/video/display.js'

const makeEmitter = () => {
	const events = []
	return {
		events,
		emit: (type, event) => { events.push(event) },
	}
}

T.test("reconcile::joystick removal keeps identity", (t) => {
	const a = { _index: 0, id: 5, name: "A" }
	const b = { _index: 1, id: 6, name: "B" }
	const mainList = [ a, b ]
	const emitter = makeEmitter()

	reconcileDevices(emitter, mainList, [
		{ _index: 0, id: 6, name: "B" },
	], joystickKeys)

	t.equal(mainList.length, 1)
	t.ok(mainList[0] === b)
	t.equal(b._index, 0)
	t.equal(emitter.events, [ { type: 'deviceRemove', device: a } ])
})

T.test("reconcile::joystick addition", (t) => {
	const a = { _index: 0, id: 5, name: "A" }
	const mainList = [ a ]
	const emitter = makeEmitter()

	const currList = [
		{ _index: 0, id: 5, name: "A" },
		{ _index: 1, id: 7, name: "C" },
	]
	reconcileDevices(emitter, mainList, currList, joystickKeys)

	t.equal(mainList.length, 2)
	t.ok(mainList[0] === a)
	t.ok(mainList[1] === currList[1])
	t.equal(emitter.events, [ { type: 'deviceAdd', device: currList[1] } ])
})

T.test("reconcile::joystick burst removal", (t) => {
	const a = { _index: 0, id: 1, name: "A" }
	const b = { _index: 1, id: 2, name: "B" }
	const c = { _index: 2, id: 3, name: "C" }
	const mainList = [ a, b, c ]
	const emitter = makeEmitter()

	reconcileDevices(emitter, mainList, [
		{ _index: 0, id: 2, name: "B" },
	], joystickKeys)

	t.equal(mainList.length, 1)
	t.ok(mainList[0] === b)
	t.equal(emitter.events, [
		{ type: 'deviceRemove', device: a },
		{ type: 'deviceRemove', device: c },
	])
})

T.test("reconcile::audio duplicate names pair in order", (t) => {
	const x = { name: "USB Audio", type: 'playback' }
	const y = { name: "USB Audio", type: 'playback' }
	const mainList = [ x, y ]
	const emitter = makeEmitter()

	reconcileDevices(emitter, mainList, [
		{ name: "USB Audio", type: 'playback' },
	], audioKeys)

	t.equal(mainList.length, 1)
	t.ok(mainList[0] === x)
	t.equal(emitter.events, [ { type: 'deviceRemove', device: y } ])
})

T.test("reconcile::display geometry shift falls back to name", (t) => {
	const d1 = {
		_index: 0,
		name: "A",
		geometry: { x: 0, y: 0, width: 100, height: 100 },
	}
	const d2 = {
		_index: 1,
		name: "B",
		geometry: { x: 100, y: 0, width: 100, height: 100 },
	}
	const mainList = [ d1, d2 ]
	const emitter = makeEmitter()

	// B is unplugged and A's geometry changes at the same time
	reconcileDevices(emitter, mainList, [
		{
			_index: 0,
			name: "A",
			geometry: { x: 50, y: 0, width: 100, height: 100 },
		},
	], displayKeys, 'display')

	t.equal(mainList.length, 1)
	t.ok(mainList[0] === d1)
	t.equal(d1.geometry, { x: 50, y: 0, width: 100, height: 100 })
	t.equal(emitter.events, [ { type: 'displayRemove', device: d2 } ])
})

T.test("reconcile::display prefers geometry match over order", (t) => {
	const d1 = {
		_index: 0,
		name: "A",
		geometry: { x: 0, y: 0, width: 100, height: 100 },
	}
	const d2 = {
		_index: 1,
		name: "A",
		geometry: { x: 100, y: 0, width: 100, height: 100 },
	}
	const mainList = [ d1, d2 ]
	const emitter = makeEmitter()

	// Two identical monitors, the first one is unplugged
	reconcileDevices(emitter, mainList, [
		{
			_index: 0,
			name: "A",
			geometry: { x: 100, y: 0, width: 100, height: 100 },
		},
	], displayKeys, 'display')

	t.equal(mainList.length, 1)
	t.ok(mainList[0] === d2)
	t.equal(d2._index, 0)
	t.equal(emitter.events, [ { type: 'displayRemove', device: d1 } ])
})

T.test("reconcile::no changes emits nothing", (t) => {
	const a = { _index: 0, id: 5, name: "A" }
	const b = { _index: 1, id: 6, name: "B" }
	const mainList = [ a, b ]
	const emitter = makeEmitter()

	reconcileDevices(emitter, mainList, [
		{ _index: 0, id: 5, name: "A" },
		{ _index: 1, id: 6, name: "B" },
	], joystickKeys)

	t.equal(mainList.length, 2)
	t.ok(mainList[0] === a)
	t.ok(mainList[1] === b)
	t.equal(emitter.events, [])
})

T.test("reconcile::replug matches by id not position", (t) => {
	const a = { _index: 0, id: 5, name: "A" }
	const b = { _index: 1, id: 6, name: "B" }
	const mainList = [ a, b ]
	const emitter = makeEmitter()

	// A is replugged: new id, back at index 0, B shifts to index 1
	const currList = [
		{ _index: 0, id: 7, name: "A" },
		{ _index: 1, id: 6, name: "B" },
	]
	reconcileDevices(emitter, mainList, currList, joystickKeys)

	t.equal(mainList.length, 2)
	t.ok(mainList[0] === currList[0])
	t.ok(mainList[1] === b)
	t.equal(b._index, 1)
	t.equal(emitter.events, [
		{ type: 'deviceRemove', device: a },
		{ type: 'deviceAdd', device: currList[0] },
	])
})
