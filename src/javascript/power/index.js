const Bindings = require('../bindings')
const Enums = require('../enums')

const power = {
	get info () {
		const info = Bindings.power_getInfo()
		if (info.seconds === -1) { info.seconds = null }
		if (info.percent === -1) { info.percent = null }
		info.state = Enums.powerStateNames[info.state]
		return info
	},
}

module.exports = { power }
