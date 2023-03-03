export const windows = {
	all: new Map(),
	focused: null,
	hovered: null,
};
export const audioDevices = {
	playback: [],
	recording: [],
};
export const audioInstances = new Map();
export const joystickDevices = [];
export const joystickInstances = {
	all: new Set(),
	byId: new Map(),
};
export const controllerDevices = [];
export const controllerInstances = {
	all: new Set(),
	byId: new Map(),
};
export let events = {
	
};
