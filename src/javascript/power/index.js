const Bindings = require('../bindings')
const Enums = require('../enums')

const power = {
	get info () {
		const info = Bindings.power_getInfo()
		info.state = Enums.powerStateNames[info.state]
		return info
	},
}

module.exports = { power }
