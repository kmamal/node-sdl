
const reconcileDevices = (
	emitter,
	mainList,
	currList,
	compare,
	prefix = 'device',
) => {
	const addEventType = `${prefix}Add`
	const removeEventType = `${prefix}Remove`

	currList.sort(compare)

	let mainIndex = 0
	let currIndex = 0
	let mainDevice = mainList[mainIndex]
	let currDevice = currList[currIndex]
	while (mainIndex < mainList.length && currIndex < currList.length) {
		const cmp = compare(mainDevice, currDevice)
		if (cmp === 0) {
			Object.assign(mainList[mainIndex], currList[currIndex])
			mainDevice = mainList[++mainIndex]
			currDevice = currList[++currIndex]
		}
		else if (cmp < 0) {
			mainList.splice(mainIndex, 1)
			const type = removeEventType
			const event = { type, device: mainDevice }
			emitter.emit(type, event)
			mainDevice = mainList[mainIndex]
		}
		else {
			mainList.splice(mainIndex, 0, currDevice)
			mainDevice = mainList[++mainIndex]
			const type = addEventType
			const event = { type, device: currDevice }
			emitter.emit(type, event)
			currDevice = currList[++currIndex]
		}
	}

	if (mainIndex < mainList.length) {
		while (mainIndex < mainList.length) {
			[ mainDevice ] = mainList.splice(mainIndex, 1)
			const type = removeEventType
			const event = { type, device: mainDevice }
			emitter.emit(type, event)
		}
	}
	else {
		while (currIndex < currList.length) {
			mainList.push(currDevice)
			const type = addEventType
			const event = { type, device: currDevice }
			emitter.emit(type, event)
			currDevice = currList[++currIndex]
		}
	}
}

module.exports = { reconcileDevices }
