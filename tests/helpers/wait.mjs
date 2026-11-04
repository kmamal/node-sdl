export const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms) })

export const waitFor = async (predicate, timeout = 1000) => {
	const deadline = Date.now() + timeout
	while (!predicate()) {
		if (Date.now() > deadline) { return false }
		await sleep(20)
	}
	return true
}
