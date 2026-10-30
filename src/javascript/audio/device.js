const unknownFormat = {
	format: null,
	channels: null,
	frequency: null,
	buffered: null,
}

const make = (device) => ({ id: null, name: null, ...unknownFormat, ...device })

module.exports = { make }
