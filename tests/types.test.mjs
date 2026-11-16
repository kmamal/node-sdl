import T from '@kmamal/testing'
import Fs from 'node:fs'
import Path from 'node:path'

const rootDir = Path.join(import.meta.dirname, '..')
const jsDir = Path.join(rootDir, 'src/javascript')
const typesPath = Path.join(rootDir, 'src/types/index.d.ts')
const docsPath = Path.join(rootDir, 'docs/api-reference.md')

const commonEvents = [ '*', 'error' ]

const parseStrings = (text) => [ ...text.matchAll(/'(?<value>[^']*)'/gu) ].map((match) => match.groups.value)

const readJs = (file) => Fs.readFileSync(Path.join(jsDir, file), 'utf8')

const parseValidEvents = (file) => {
	const match = readJs(file).match(/const validEvents = \[(?<list>[^\]]*)\]/u)
	return parseStrings(match.groups.list)
}

const parseAudioStreamEvents = () => {
	const source = readJs('audio/audio-stream.js')
	const entries = source.match(/const notifyEvents = \{(?<entries>[^}]*)\}/u).groups.entries
	const notifyEvents = {}
	for (const { groups } of entries.matchAll(/(?<key>\w+): '(?<value>[^']*)'/gu)) {
		notifyEvents[groups.key] = groups.value
	}
	const common = parseStrings(source.match(/super\(\[(?<list>[^\]]*)\]\)/u).groups.list)
	return {
		base: common,
		playback: [ ...common, notifyEvents.playback ],
		recording: [ ...common, notifyEvents.recording ],
	}
}

const parseTypedEvents = () => {
	const result = {}
	const stack = []
	for (const line of Fs.readFileSync(typesPath, 'utf8').split('\n')) {
		const header = line.match(/^\s*(?:export\s+)?(?:namespace|interface)\s+(?<name>\w+)/u)
		let name = header ? header.groups.name : null
		for (const char of line) {
			if (char === '{') {
				stack.push(name)
				name = null
			}
			else if (char === '}') {
				stack.pop()
			}
		}

		const event = line.match(/^\s*on \(event: '(?<name>[^']*)'/u)
		if (!event) { continue }
		const path = stack.filter(Boolean).join('.')
		result[path] ??= []
		result[path].push(event.groups.name)
	}
	return result
}

const parseDocEvents = () => {
	const result = {}
	let section = null
	for (const line of Fs.readFileSync(docsPath, 'utf8').split('\n')) {
		const heading = line.match(/^## (?<name>.*)$/u) ?? line.match(/^### (?<name>sdl\.audio\.(?:playback|recording))$/u)
		if (heading) {
			section = heading.groups.name
			continue
		}

		const event = line.match(/^### Event: '(?<name>[^']*)'$/u)
		if (!event) { continue }
		result[section] ??= []
		result[section].push(event.groups.name)
	}
	return result
}

const findValidEventsFiles = () => Fs.readdirSync(jsDir, { recursive: true })
	.filter((file) => file.endsWith('.js'))
	.filter((file) => readJs(file).includes('const validEvents = '))

const getEmitters = () => {
	const audioStream = parseAudioStreamEvents()
	const inherited = (events) => events.filter((event) => !audioStream.base.includes(event))
	return [
		{ file: 'video/index.js', types: 'Sdl.Video.Module', docs: [ 'sdl.video' ] },
		{ file: 'video/window.js', types: 'Sdl.Video.Window', docs: [ 'class Window' ] },
		{ file: 'keyboard/index.js', types: 'Sdl.Keyboard.Module', docs: [ 'sdl.keyboard' ] },
		{ file: 'joystick/index.js', types: 'Sdl.Joystick.Module', docs: [ 'sdl.joystick' ] },
		{ file: 'joystick/joystick-instance.js', types: 'Sdl.Joystick.JoystickInstance', docs: [ 'class JoystickInstance' ] },
		{ file: 'gamepad/index.js', types: 'Sdl.Gamepad.Module', docs: [ 'sdl.gamepad' ] },
		{ file: 'gamepad/gamepad-instance.js', types: 'Sdl.Gamepad.GamepadInstance', docs: [ 'class GamepadInstance' ] },
		{ file: 'sensor/sensor-instance.js', types: 'Sdl.Sensor.SensorInstance', docs: [ 'class SensorInstance' ] },
		{ file: 'audio/index.js', types: 'Sdl.Audio.DeviceModule', docs: [ 'sdl.audio.playback', 'sdl.audio.recording' ] },
		{ file: 'clipboard/index.js', types: 'Sdl.Clipboard.Module', docs: [ 'sdl.clipboard' ] },
	].map((emitter) => ({ ...emitter, events: parseValidEvents(emitter.file) })).concat([
		{
			types: 'Sdl.Audio.AudioStream',
			docs: [ 'class AudioStream' ],
			events: audioStream.base,
		},
		{
			types: 'Sdl.Audio.AudioPlaybackStream',
			docs: [ 'class AudioPlaybackStream extends AudioStream' ],
			events: audioStream.playback,
			docEvents: inherited(audioStream.playback),
		},
		{
			types: 'Sdl.Audio.AudioRecordingStream',
			docs: [ 'class AudioRecordingStream extends AudioStream' ],
			events: audioStream.recording,
			docEvents: inherited(audioStream.recording),
		},
	])
}

T.test("sdl::types every validEvents list is checked", (t) => {
	const files = getEmitters().map(({ file }) => file).filter(Boolean)
	t.equal(findValidEventsFiles().sort(), files.sort())
})

T.test("sdl::types event overloads match validEvents", (t) => {
	const emitters = getEmitters()
	const typed = parseTypedEvents()
	t.equal(Object.keys(typed).sort(), emitters.map(({ types }) => types).sort())

	for (const { types, events } of emitters) {
		const typedEvents = typed[types] ?? []
		for (const event of commonEvents) {
			t.ok(typedEvents.includes(event), `${types} is missing '${event}'`)
		}
		const specific = typedEvents.filter((event) => !commonEvents.includes(event))
		t.equal(specific.sort(), [ ...events ].sort(), types)
	}
})

T.test("sdl::types event headings in the api reference match validEvents", (t) => {
	const emitters = getEmitters()
	const documented = parseDocEvents()
	t.equal(Object.keys(documented).sort(), emitters.flatMap(({ docs }) => docs).sort())

	for (const { docs, events, docEvents = events } of emitters) {
		for (const section of docs) {
			t.equal([ ...documented[section] ?? [] ].sort(), [ ...docEvents ].sort(), section)
		}
	}
})
