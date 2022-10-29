
const _consume = async (stream) => {
	const chunks = []
	for await (const chunk of stream) {
		chunks.push(chunk)
	}
	return Buffer.concat(chunks)
}

const fetch = async (_url, options = {}) => {
	let url = _url
	let {
		maxRedirect = 5,
		body = null,
	} = options

	const { protocol } = new URL(url)
	const lib = require(protocol.slice(0, -1))

	const evalPromise = (resolve, reject) => {
		const request = lib.request(url, options)
			.on('error', reject)
			.on('response', resolve)

		if (!body) {
			request.end()
			return
		}

		if (body?.length) {
			if (!Buffer.isBuffer(body)) { body = Buffer.from(body) }
			body = Promise.resolve(body)
		} else {
			body = _consume(body)
		}

		body.then((buffer) => {
			request.setHeader('Content-Length', buffer.length)
			request.end(buffer)
		})
	}

	for (;;) {
		const response = await new Promise(evalPromise)

		const { statusCode } = response

		if (300 <= statusCode && statusCode < 400) {
			if (maxRedirect-- > 0) {
				url = response.headers.location
				continue
			}
		}

		if (!(200 <= statusCode && statusCode < 300)) {
			let responseBody
			try { responseBody = (await _consume(response)).toString() } catch (_) {}
			try { responseBody = JSON.parse(responseBody) } catch (_) {}
			throw Object.assign(new Error(`bad status code ${statusCode}`), {
				statusCode,
				responseBody,
			})
		}

		return {
			stream () { return response },
			async buffer () {
				return await _consume(response)
			},
			async text () {
				const buffer = await this.buffer()
				return buffer.toString()
			},
			async json () {
				const text = await this.text()
				return JSON.parse(text)
			},
		}
	}
}

module.exports = { fetch }
