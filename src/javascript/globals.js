
module.exports = {
	info: null,

	displays: [],
	windows: {
		all: new Map(),
		focused: null,
		hovered: null,
	},
	touchDevices: null,
	joystickDevices: [],
	joystickInstances: {
		all: new Set(),
		byId: new Map(),
	},
	gamepadDevices: [],
	gamepadInstances: {
		all: new Set(),
		byId: new Map(),
	},
	sensorDevices: [],
	sensorInstances: {
		all: new Set(),
		byId: new Map(),
	},
	audioDevices: {
		playback: [],
		recording: [],
	},
	audioStreams: new Map(),

	events: null,
}
