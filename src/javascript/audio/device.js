export const make = (device) => {
	const { isRecorder } = device
	delete device.isRecorder
	device.type = isRecorder ? 'recording' : 'playback'
}

export const compare = (a, b) => {
	const { name: aName } = a
	const { name: bName } = b
	if (aName === bName) { return 0 }
	return a.name < b.name ? -1 : 1
}
