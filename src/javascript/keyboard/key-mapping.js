const Bindings = require('../bindings')

const mapping = Object.assign(Object.create(null), {
	'±': '+/-',
	'A': 'a',
	'AC Back': 'back',
	'AC Bookmarks': 'bookmarks',
	'AC Forward': 'forward',
	'AC Home': 'home',
	'AC Refresh': 'refresh',
	'AC Search': 'search',
	'AC Stop': 'stop',
	'AC New': 'new',
	'AC Open': 'open',
	'AC Close': 'close',
	'AC Exit': 'exit',
	'AC Save': 'save',
	'AC Print': 'print',
	'AC Properties': 'properties',
	'Again': 'again',
	'Application': 'menu',
	'AltErase': 'altErase',
	'B': 'b',
	'Backspace': 'backspace',
	'C': 'c',
	'Call': 'call',
	'Cancel': 'cancel',
	'ChannelDown': 'channelDown',
	'ChannelUp': 'channelUp',
	'CapsLock': 'capsLock',
	'Clear / Again': 'clear/again',
	'Clear': 'clear',
	'Copy': 'copy',
	'CrSel': 'crSel',
	'CurrencySubUnit': 'currencySubUnit',
	'CurrencyUnit': 'currencyUnit',
	'Cut': 'cut',
	'D': 'd',
	'DecimalSeparator': 'decimalSeparator',
	'Delete': 'delete',
	'Down': 'down',
	'E': 'e',
	'Eject': 'eject',
	'End': 'end',
	'EndCall': 'endCall',
	'Escape': 'escape',
	'Execute': 'execute',
	'ExSel': 'exSel',
	'F': 'f',
	'F1': 'f1',
	'F10': 'f10',
	'F11': 'f11',
	'F12': 'f12',
	'F13': 'f13',
	'F14': 'f14',
	'F15': 'f15',
	'F16': 'f16',
	'F17': 'f17',
	'F18': 'f18',
	'F19': 'f19',
	'F2': 'f2',
	'F20': 'f20',
	'F21': 'f21',
	'F22': 'f22',
	'F23': 'f23',
	'F24': 'f24',
	'F3': 'f3',
	'F4': 'f4',
	'F5': 'f5',
	'F6': 'f6',
	'F7': 'f7',
	'F8': 'f8',
	'F9': 'f9',
	'Find': 'find',
	'Front': 'front',
	'G': 'g',
	'H': 'h',
	'Help': 'help',
	'Home': 'home',
	'I': 'i',
	'Insert': 'insert',
	'International 1': 'international1',
	'International 2': 'international2',
	'International 3': 'international3',
	'International 4': 'international4',
	'International 5': 'international5',
	'International 6': 'international6',
	'International 7': 'international7',
	'International 8': 'international8',
	'International 9': 'international9',
	'J': 'j',
	'K': 'k',
	'Keypad -': '-',
	'Keypad ,': ',',
	'Keypad :': ':',
	'Keypad !': '!',
	'Keypad .': '.',
	'Keypad {': '{',
	'Keypad }': '}',
	'Keypad @': '@',
	'Keypad *': '*',
	'Keypad /': '/',
	'Keypad &': '&',
	'Keypad &&': '&&',
	'Keypad #': '#',
	'Keypad %': '%',
	'Keypad ^': '^',
	'Keypad +': '+',
	'Keypad <': '<',
	'Keypad = (AS400)': '=',
	'Keypad =': '=',
	'Keypad >': '>',
	'Keypad |': '|',
	'Keypad ||': '||',
	'Keypad (': '(',
	'Keypad )': ')',
	'Keypad +/-': '+/-',
	'Keypad 0': '0',
	'Keypad 00': '00',
	'Keypad 000': '000',
	'Keypad 1': '1',
	'Keypad 2': '2',
	'Keypad 3': '3',
	'Keypad 4': '4',
	'Keypad 5': '5',
	'Keypad 6': '6',
	'Keypad 7': '7',
	'Keypad 8': '8',
	'Keypad 9': '9',
	'Keypad A': 'a',
	'Keypad B': 'b',
	'Keypad Backspace': 'backspace',
	'Keypad Binary': 'binary',
	'Keypad C': 'c',
	'Keypad Clear': 'clear',
	'Keypad ClearEntry': 'clearEntry',
	'Keypad D': 'd',
	'Keypad Decimal': 'decimal',
	'Keypad E': 'e',
	'Keypad Enter': 'return',
	'Keypad F': 'f',
	'Keypad Hexadecimal': 'hexadecimal',
	'Keypad MemAdd': 'memAdd',
	'Keypad MemClear': 'memClear',
	'Keypad MemDivide': 'memDivide',
	'Keypad MemMultiply': 'memMultiply',
	'Keypad MemRecall': 'memRecall',
	'Keypad MemStore': 'memStore',
	'Keypad MemSubtract': 'memSubtract',
	'Keypad Octal': 'octal',
	'Keypad Space': ' ',
	'Keypad Tab': 'tab',
	'Keypad XOR': 'xor',
	'L': 'l',
	'Language 1': 'language1',
	'Language 2': 'language2',
	'Language 3': 'language3',
	'Language 4': 'language4',
	'Language 5': 'language5',
	'Language 6': 'language6',
	'Language 7': 'language7',
	'Language 8': 'language8',
	'Language 9': 'language9',
	'Left Alt': 'alt',
	'Left Command': 'command',
	'Left Ctrl': 'ctrl',
	'Left GUI': 'gui',
	'Left Hyper': 'hyper',
	'Left Meta': 'meta',
	'Left Option': 'option',
	'Left Shift': 'shift',
	'Left Windows': 'windows',
	'LeftTab': 'leftTab',
	'Left': 'left',
	'Level5Shift': 'level5Shift',
	'M': 'm',
	'MediaFastForward': 'mediaFastForward',
	'MediaPause': 'mediaPause',
	'MediaPlay': 'mediaPlay',
	'MediaPlayPause': 'mediaPlayPause',
	'MediaRecord': 'mediaRecord',
	'MediaRewind': 'mediaRewind',
	'MediaSelect': 'mediaSelect',
	'MediaStop': 'mediaStop',
	'MediaTrackNext': 'mediaTrackNext',
	'MediaTrackPrevious': 'mediaTrackPrevious',
	'Menu': 'menu',
	'ModeSwitch': 'modeSwitch',
	'MultiKeyCompose': 'compose',
	'Mute': 'mute',
	'N': 'n',
	'NonUSBackslash': 'nonUsBackslash',
	'Numlock': 'numlock',
	'O': 'o',
	'Oper': 'oper',
	'Out': 'out',
	'P': 'p',
	'PageDown': 'pageDown',
	'PageUp': 'pageUp',
	'Paste': 'paste',
	'Pause': 'pause',
	'Power': 'power',
	'PrintScreen': 'printScreen',
	'Prior': 'pageUp',
	'Q': 'q',
	'R': 'r',
	'Return': 'return',
	'Right Alt': 'alt',
	'Right Command': 'command',
	'Right Ctrl': 'ctrl',
	'Right GUI': 'gui',
	'Right Hyper': 'hyper',
	'Right Meta': 'meta',
	'Right Option': 'option',
	'Right Shift': 'shift',
	'Right Windows': 'windows',
	'Right': 'right',
	'S': 's',
	'ScrollLock': 'scrollLock',
	'Select': 'select',
	'Separator': 'separator',
	'Sleep': 'sleep',
	'SoftLeft': 'softLeft',
	'SoftRight': 'softRight',
	'Space': ' ',
	'Stop': 'stop',
	'SysReq': 'sysReq',
	'T': 't',
	'Tab': 'tab',
	'ThousandsSeparator': 'thousandsSeparator',
	'U': 'u',
	'Undo': 'undo',
	'Up': 'up',
	'V': 'v',
	'VolumeDown': 'volumeDown',
	'VolumeUp': 'volumeUp',
	'Wake': 'wake',
	'W': 'w',
	'X': 'x',
	'Y': 'y',
	'Z': 'z',
})

const isCharacter = (key) => key !== null && [ ...key ].length === 1

const buildReverseMapping = () => {
	const reverseMapping = Object.create(null)

	for (const [ key, value ] of Object.entries(mapping)) {
		maybeSkip: {
			const existing = reverseMapping[value]
			if (existing === undefined) { break maybeSkip }

			const keyScancode = Bindings.keyboard_getScancode(key)
			if (keyScancode === null) { continue }

			const existingScancode = Bindings.keyboard_getScancode(existing)
			if (existingScancode === null) { break maybeSkip }

			if (existingScancode < keyScancode) { continue }
		}

		reverseMapping[value] = key
	}

	for (const [ value, key ] of Object.entries(reverseMapping)) {
		if (!isCharacter(value)) { continue }

		const valueScancode = Bindings.keyboard_getScancode(value)
		if (valueScancode === null) { continue }

		const keyScancode = Bindings.keyboard_getScancode(key)
		if (keyScancode === null) {
			delete reverseMapping[value]
			continue
		}

		const _key = Bindings.keyboard_getKey(valueScancode)
		const roundTrips = (mapping[_key] ?? _key) === value
		if (roundTrips && valueScancode < keyScancode) {
			delete reverseMapping[value]
		}
	}

	return reverseMapping
}

let reverseMapping = null

const getReverseMapping = () => {
	reverseMapping ??= buildReverseMapping()
	return reverseMapping
}

const invalidateReverseMapping = () => { reverseMapping = null }

module.exports = {
	mapping,
	getReverseMapping,
	invalidateReverseMapping,
	isCharacter,
}
