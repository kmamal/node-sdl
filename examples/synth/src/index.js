const SDL = require('../../..')
const Canvas = require('canvas')

// Note definitions

const num_midi_notes = 127

const first_piano_note = 21
const last_piano_note = 108
const isPianoNote = (note) => true
	&& note >= first_piano_note
	&& note <= last_piano_note

const note_names = [ "C", "D", "E", "F", "G", "A", "B" ]
const is_black_key = [ 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0 ]
const note_name_templates = new Array(12)
{
	let note_name_index = -1
	for (let i = 0; i < 12; i++) {
		if (!is_black_key[i]) { note_name_index += 1 }
		note_name_templates[i] = is_black_key[i]
			? `${note_names[note_name_index]}#_/${note_names[note_name_index + 1]}b_`
			: `${note_names[note_name_index]}_`
	}
}

const getNoteName = (note) => {
	if (!isPianoNote(note)) { return null }

	const octave = Math.floor(note / 12) - 1
	return note_name_templates[note % 12].replace(/_/gu, octave)
}

const a4_note = 69
const a4_freq = 440
const getNoteFreq = (note) => a4_freq * 2 ** ((note - a4_note) / 12)

const midi_notes = new Array(127)
for (let i = 0; i < num_midi_notes; i++) {
	midi_notes[i] = {
		name: getNoteName(i),
		freq: getNoteFreq(i),
	}
}

const notes_by_key = new Map([
	// Lower rows
	[ 'Left Shift', 45 ],
	[ 'Caps Lock', 46 ],
	[ '<', 47 ],
	[ 'Z', 48 ],
	[ 'S', 49 ],
	[ 'X', 50 ],
	[ 'D', 51 ],
	[ 'C', 52 ],
	[ 'V', 53 ],
	[ 'G', 54 ],
	[ 'B', 55 ],
	[ 'H', 56 ],
	[ 'N', 57 ],
	[ 'J', 58 ],
	[ 'M', 59 ],
	[ ',', 60 ],
	[ 'L', 61 ],
	[ '.', 62 ],
	[ ';', 63 ],
	[ '/', 64 ],
	[ 'Right Shift', 65 ],
	[ '\\', 66 ],

	// Upper rows
	[ 'Tab', 60 ],
	[ '1', 61 ],
	[ 'Q', 62 ],
	[ '2', 63 ],
	[ 'W', 64 ],
	[ 'E', 65 ],
	[ '4', 66 ],
	[ 'R', 67 ],
	[ '5', 68 ],
	[ 'T', 69 ],
	[ '6', 70 ],
	[ 'Y', 71 ],
	[ 'U', 72 ],
	[ '8', 73 ],
	[ 'I', 74 ],
	[ '9', 75 ],
	[ 'O', 76 ],
	[ 'P', 77 ],
	[ '-', 78 ],
	[ '[', 79 ],
	[ '=', 80 ],
	[ ']', 81 ],
	[ 'Backspace', 82 ],
	[ 'Return', 83 ],
])

const voices = new Map()

class Sine {
	constructor (freq, amp, overtone = 1) {
		this._freq = freq
		this._amp = amp
		this._angle = 0
		this._child = null

		const next_overtone = overtone + 1
		const next_freq = (this._freq / overtone) * next_overtone
		if (next_freq < midi_notes[num_midi_notes - 1].freq) {
			this._child = new Sine(next_freq, amp / 2, next_overtone)
		}
	}

	render (buffer, start, end, spec) {
		let offset = start * spec.bytes_per_frame
		const num = end - start
		for (let i = 0; i < num; i++) {
			const value = this._amp * Math.sin(2 * Math.PI * this._angle)
			for (let j = 0; j < spec.channels; j++) {
				const existing = buffer.readFloatLE(offset)
				buffer.writeFloatLE(existing + value, offset)
				offset += spec.bytes_per_sample
			}

			this._angle += this._freq / spec.freq
			this._angle %= 1
		}

		if (this._child) {
			this._child.render(buffer, start, end, spec)
		}
	}
}

// SDL

SDL.setLogger((x) => console.log('SDL>', x))

const window = new SDL.Window({
	title: "JavaScript",
	resizable: false,
})

// Video

const { width: w, height: h } = window
const canvas = Canvas.createCanvas(w, h)
const ctx = canvas.getContext('2d')

ctx.font = '75px serif'
ctx.fillStyle = 'red'
ctx.textAlign = 'center'
ctx.fillText("Hello, World!", w / 2, h / 2)

const pixels = canvas.toBuffer('raw')
window.render(w, h, w * 4, SDL.PixelFormat.ARGB8888, pixels)

// Audio

const audio_spec = SDL.Audio.start({ format: SDL.AudioFormat.F32LSB, samples: 1024 })
audio_spec.bytes_per_sample = 4
audio_spec.bytes_per_frame = audio_spec.bytes_per_sample * audio_spec.channels

const audio_buffer_frames = audio_spec.samples * 2
const audio_buffer_size = audio_buffer_frames * audio_spec.bytes_per_frame
const audio_buffer = Buffer.alloc(audio_buffer_size)
const audio_buffer_duration = (audio_buffer_frames / audio_spec.freq) * 1e3

const silenceAudioBuffer = () => {
	let offset = 0
	for (let i = 0; i < audio_buffer_frames; i++) {
		for (let j = 0; j < audio_spec.channels; j++) {
			audio_buffer.writeFloatLE(0, offset++ * audio_spec.bytes_per_frame)
		}
	}
}
silenceAudioBuffer()

let last_push = Date.now()
let last_index = 0

// Main

const eventLoop = () => {
	for (;;) {
		const event = SDL.pollEvent()
		if (!event) { break }

		switch (event.type) {
			case 'key-down': {
				const is_note = notes_by_key.has(event.key)
				if (is_note && !event.repeat) {
					const note = notes_by_key.get(event.key)
					const freq = midi_notes[note].freq
					const voice = new Sine(freq, 0.1)
					voices.set(note, voice)
					console.log(`[${Array.from(voices.keys()).map((i) => midi_notes[i].name).join(' ')}]`)
				}
				break
			}

			case 'key-up': {
				const is_note = notes_by_key.has(event.key)
				if (is_note) {
					const note = notes_by_key.get(event.key)
					voices.delete(note)
					console.log(`[${Array.from(voices.keys()).map((i) => midi_notes[i].name).join(' ')}]`)
				}
				break
			}

			case 'quit': { process.exit() }

			// No default
		}
	}

	// Do work here

	const now = Date.now()
	const ellapsed = now - last_push
	const progress = Math.min(1, ellapsed / audio_buffer_duration)
	const target_index = Math.ceil(audio_buffer_frames * progress)

	if (target_index > last_index) {
		for (const voice of voices.values()) {
			voice.render(audio_buffer, last_index, target_index, audio_spec)
		}
		last_index = target_index
	}

	if (SDL.Audio.getQueuedSize() === 0 || progress >= 0.25) {
		SDL.Audio.queue(audio_buffer, target_index * audio_spec.bytes_per_frame)
		last_push = now
		last_index = 0
		silenceAudioBuffer()
	}

	setImmediate(eventLoop)
}

eventLoop()
