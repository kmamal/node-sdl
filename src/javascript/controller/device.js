export const make = (device) => {
	delete device.type
	delete device.isController
}

export const compare = (a, b) => a.id - b.id

export const filter = (device) => device.isController
