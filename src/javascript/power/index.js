const Bindings = require('../bindings')

const power = {
	get info () { return Bindings.power_getInfo() },
}

module.exports = { power }
