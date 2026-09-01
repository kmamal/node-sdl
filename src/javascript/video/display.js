
// SDL2 exposes no stable display id.
// Name plus geometry, falling back to name alone.
// Geometry can shift when another display is (dis)connected.
const keys = [
	(display) => `${display.name}\n${display.geometry.x} ${display.geometry.y} ${display.geometry.width} ${display.geometry.height}`,
	(display) => display.name,
]

module.exports = { keys }
