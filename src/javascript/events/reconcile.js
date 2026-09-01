
const reconcileDevices = (
	emitter,
	mainList,
	currList,
	keyFunctions,
	prefix = 'device',
) => {
	const pairs = new Map()
	let unmatchedMain = [ ...mainList ]
	let unmatchedCurr = [ ...currList ]

	for (const fnKey of keyFunctions) {
		if (unmatchedMain.length === 0 || unmatchedCurr.length === 0) { break }

		const candidates = new Map()
		for (const mainDevice of unmatchedMain) {
			const key = fnKey(mainDevice)
			let list = candidates.get(key)
			if (!list) {
				list = []
				candidates.set(key, list)
			}
			list.push(mainDevice)
		}

		const matched = new Set()
		unmatchedCurr = unmatchedCurr.filter((currDevice) => {
			const list = candidates.get(fnKey(currDevice))
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
		try { emitter.emit(type, event) }
		catch (error) { emitter.emit('error', error) }
	}
	for (const device of unmatchedCurr) {
		const type = `${prefix}Add`
		const event = { type, device }
		try { emitter.emit(type, event) }
		catch (error) { emitter.emit('error', error) }
	}
}

module.exports = { reconcileDevices }
