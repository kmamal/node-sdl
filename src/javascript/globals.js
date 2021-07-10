
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
	audioInstances: {
		all: new Map(),
	},
	joysticks: {
		all: new Map(),
	},
	controllers: {
		all: new Map(),
	},

	events: null, // Set later to { startPolling, stopPolling }
}
