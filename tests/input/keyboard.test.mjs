import fs from 'node:fs'
import path from 'node:path'
import T from '@kmamal/testing'
import sdl from '../../src/javascript/index.js'
import Bindings from '../../src/javascript/bindings.js'
import { mapping, isCharacter } from '../../src/javascript/keyboard/key-mapping.js'

const includeDir = path.join(import.meta.dirname, '../../sdl/include/SDL3')

const parseHeaderScancodes = () => {
	const text = fs.readFileSync(path.join(includeDir, 'SDL_scancode.h'), 'utf8')
	const result = {}
	for (const match of text.matchAll(/^\s*SDL_SCANCODE_(?<name>[A-Z0-9_]+)\s*=\s*(?<value>\d+)/gmu)) {
		const { name, value } = match.groups
		if (name === 'UNKNOWN' || name === 'RESERVED' || name === 'COUNT') { continue }
		result[name] = Number(value)
	}
	return result
}

const parseHeaderExtendedKeys = () => {
	const text = fs.readFileSync(path.join(includeDir, 'SDL_keycode.h'), 'utf8')
	return [ ...text.matchAll(/^#define SDLK_(?<name>[A-Z0-9_]+)\s+0x2000000[0-9a-fA-F]u/gmu) ].map((m) => m.groups.name)
}

const extendedKeyNames = {
	LEFT_TAB: 'LeftTab',
	LEVEL5_SHIFT: 'Level5Shift',
	MULTI_KEY_COMPOSE: 'MultiKeyCompose',
	LMETA: 'Left Meta',
	RMETA: 'Right Meta',
	LHYPER: 'Left Hyper',
	RHYPER: 'Right Hyper',
}

const isModifierLabel = (label) => [ 'ctrl', 'shift', 'alt', 'gui', 'windows', 'command', 'option' ].includes(label)
const rightModifiers = new Set([ 'RCTRL', 'RSHIFT', 'RALT', 'RGUI' ])
const duplicates = new Set([ 'RETURN2', 'PRIOR', 'AC_HOME', 'AC_STOP', 'MENU' ])

T.test("sdl::keyboard", (t) => {
	const scancodes1 = Object.entries(sdl.keyboard.SCANCODE).map(([ , v ]) => v)
	t.ok(scancodes1.length > 200)
	const scancodeSet1 = new Set(scancodes1)
	t.equal(scancodeSet1.size, scancodes1.length)

	for (const code of scancodes1) {
		t.equal(typeof code, 'number')
		t.ok(code > 0)

		const key = sdl.keyboard.getKey(code)
		if (key === null) { continue }
		t.equal(typeof key, 'string')
		t.ok(key.length >= 1)
	}

	const state = sdl.keyboard.getState()

	let numPressed = 0
	for (const isPressed of state) {
		t.ok(isPressed === 0 || isPressed === 1)
		if (isPressed) { numPressed++ }
	}
	t.ok(numPressed <= 3)

	for (const scancode of Object.values(sdl.keyboard.SCANCODE)) {
		t.ok(state[scancode] === 0 || state[scancode] === 1)
	}
})

T.test("sdl::keyboard scancodes match SDL header", (t) => {
	const expected = parseHeaderScancodes()
	const actual = Object.fromEntries(Object.entries(sdl.keyboard.SCANCODE))
	t.equal(Object.keys(expected).length > 200, true)
	t.equal(Object.keys(actual).sort(), Object.keys(expected).sort())
	for (const [ name, value ] of Object.entries(expected)) {
		t.equal(actual[name], value)
	}
})

T.test("sdl::keyboard every SDL key name is mapped", (t) => {
	for (const code of Object.values(sdl.keyboard.SCANCODE)) {
		const raw = Bindings.keyboard_getKey(code)
		if (raw === null) { continue }
		t.ok(raw in mapping || isCharacter(raw), `unmapped key name ${JSON.stringify(raw)}`)
	}

	const extended = parseHeaderExtendedKeys()
	t.ok(extended.length >= 7)
	for (const name of extended) {
		const keyName = extendedKeyNames[name]
		t.ok(keyName !== undefined, `unknown extended key SDLK_${name}`)
		t.ok(keyName in mapping, `unmapped extended key ${keyName}`)
	}
})

T.test("sdl::keyboard roundtrips", (t) => {
	const byValue = new Map(Object.entries(sdl.keyboard.SCANCODE).map(([ k, v ]) => [ v, k ]))

	for (const [ name, code ] of Object.entries(sdl.keyboard.SCANCODE)) {
		const label = sdl.keyboard.getKey(code)
		if (label === null) { continue }

		const code2 = sdl.keyboard.getScancode(label)
		if (code2 === null) { continue }

		t.ok(byValue.has(code2), `${label} -> invalid scancode ${code2}`)
		if (!name.startsWith('KP_')) {
			t.equal(sdl.keyboard.getKey(code2), label, `${label} does not map back to itself`)
		}

		if (code2 === code) { continue }

		const allowed = duplicates.has(name)
			|| name.startsWith('KP_')
			|| (rightModifiers.has(name) && isModifierLabel(label))
		t.ok(allowed, `${name} -> ${JSON.stringify(label)} -> ${byValue.get(code2)}`)
	}

	for (const label of new Set(Object.values(mapping))) {
		const code = sdl.keyboard.getScancode(label)
		t.ok(code === null || byValue.has(code), `${label} -> ${code}`)
	}
})
