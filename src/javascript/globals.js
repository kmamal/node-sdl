
module.exports = {
	displays: [],
	windows: {
		all: new Map(),
		focused: null,
		hovered: null,
	},
	joystickDevices: [],
	joystickInstances: {
		all: new Set(),
		byId: new Map(),
	},
	controllerDevices: [],
	controllerInstances: {
		all: new Set(),
		byId: new Map(),
	},
	sensorInstances: {
		all: new Set(),
		byId: new Map(),
	},
	audioDevices: {
		playback: [],
		recording: [],
	},
	audioInstances: new Map(),

	events: null, // Set later to { startPolling, stopPolling, poll }
}
