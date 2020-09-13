const SDL = require('../../..')
const createContext = require('gl')
const createRegl = require('regl')

SDL.setLogger((x) => console.log('SDL>', x))

const window = new SDL.Window({
	title: "JavaScript",
	resizable: false,
	borderless: true,
})

const { width: w, height: h } = window
const gl = createContext(w, h)
const regl = createRegl({ gl })

const drawTriangle = regl({
	frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

	vert: `
    precision mediump float;
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0, 1);
    }`,

	attributes: {
		position: regl.buffer([
			[ 0, -0.5 ],
			[ 0.5, 0.5 ],
			[ -0.5, 0.5 ],
		]),
	},

	uniforms: {
		color: regl.prop('color'),
	},

	count: 3,
})

const buffer = new Uint8Array(w * h * 4)

const tick = regl.frame(({ time }) => {
	regl.clear({
		color: [ 0, 0, 0, 1 ],
		depth: 1,
	})

	drawTriangle({ color: [
		Math.cos(Number(time)),
		Math.sin(time * 0.8),
		Math.cos(time * 3),
		1,
	] })

	gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buffer)
	window.render(w, h, w * 4, SDL.PixelFormat.RGBA32, Buffer.from(buffer))
})

setTimeout(() => { tick.cancel() }, 5e3)
