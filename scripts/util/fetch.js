const Stream = require('stream')

const fetch = async (url, options = {}) => {
	const response = await globalThis.fetch(url, options)

	const { status: statusCode } = response

	if (!response.ok) {
		let responseBody
		try { responseBody = await response.text() }
		catch (_) {}
		try { responseBody = JSON.parse(responseBody) }
		catch (_) {}
		throw Object.assign(new Error(`bad status code ${statusCode}`), {
			statusCode,
			responseBody,
		})
	}

	return {
		stream () { return Stream.Readable.fromWeb(response.body) },
		async buffer () {
			return Buffer.from(await response.arrayBuffer())
		},
		async text () {
			return await response.text()
		},
		async json () {
			return await response.json()
		},
	}
}

module.exports = { fetch }
