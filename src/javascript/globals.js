
module.exports = {
	windows: {
		all: new Map(),
		focused: null,
		hovered: null,
	},
	audio_devices: {
		all: new Map(),
		playback: [],
		recording: [],
	},
	joysticks: {
		all: new Map(),
	},
	controllers: {
		all: new Map(),
	},

	events: null, // Set later to { startPolling, stopPolling }
}
