const isSameMode = (a, b) => true
	&& a.width === b.width
	&& a.height === b.height
	&& a.pixelDensity === b.pixelDensity
	&& a.frequency === b.frequency
	&& a.format === b.format

const findMode = (modes, mode) => modes.find((other) => isSameMode(other, mode))

const internModes = (fresh, display = fresh) => {
	const known = display.modes
	for (const mode of fresh.modes) { mode.display = display }
	fresh.currentMode.display = display
	fresh.modes = fresh.modes.map((mode) => findMode(known, mode) ?? mode)
	fresh.currentMode = findMode(fresh.modes, fresh.currentMode) ?? fresh.currentMode
	return fresh
}

module.exports = {
	findMode,
	internModes,
}
