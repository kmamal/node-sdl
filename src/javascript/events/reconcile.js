
// Pairs cached devices with a fresh snapshot by identity, not list position.
// `keys` holds key functions ordered most-specific-first: devices one key
// leaves unmatched fall through to the next, and devices with equal keys are
// paired in list order. Matched cached objects are updated in place (apps may
// hold references to them), and the cached list ends up in snapshot order.
const reconcileDevices = (
	emitter,
	mainList,
	currList,
	keys,
	prefix = 'device',
) => {
	const pairs = new Map()
	let unmatchedMain = [ ...mainList ]
	let unmatchedCurr = [ ...currList ]

	for (const key of keys) {
		if (unmatchedMain.length === 0 || unmatchedCurr.length === 0) { break }

		const candidates = new Map()
		for (const mainDevice of unmatchedMain) {
			const k = key(mainDevice)
			let list = candidates.get(k)
			if (!list) {
				list = []
				candidates.set(k, list)
			}
			list.push(mainDevice)
		}

		const matched = new Set()
		unmatchedCurr = unmatchedCurr.filter((currDevice) => {
			const list = candidates.get(key(currDevice))
			if (!list || list.length === 0) { return true }
			const mainDevice = list.shift()
			pairs.set(currDevice, mainDevice)
			matched.add(mainDevice)
			return false
		})
		unmatchedMain = unmatchedMain.filter((mainDevice) => !matched.has(mainDevice))
	}

	const newList = currList.map((currDevice) => {
		const mainDevice = pairs.get(currDevice)
		if (!mainDevice) { return currDevice }
		Object.assign(mainDevice, currDevice)
		return mainDevice
	})
	mainList.splice(0, mainList.length, ...newList)

	for (const device of unmatchedMain) {
		const type = `${prefix}Remove`
		const event = { type, device }
		emitter.emit(type, event)
	}
	for (const device of unmatchedCurr) {
		const type = `${prefix}Add`
		const event = { type, device }
		emitter.emit(type, event)
	}
}

module.exports = { reconcileDevices }
