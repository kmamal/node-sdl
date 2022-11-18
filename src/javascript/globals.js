
module.exports = {
	windows: {
		all: new Map(),
		focused: null,
		hovered: null,
	},
	audioDevices: {
		playback: [],
		recording: [],
	},
	audioInstances: new Map(),
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

	events: null, // Set later to { startPolling, stopPolling }
}
