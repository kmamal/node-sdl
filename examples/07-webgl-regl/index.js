const sdl = require('@kmamal/sdl')
const createContext = require('@kmamal/gl')
const createRegl = require('regl')

const window = sdl.video.createWindow({
	resizable: true,
	opengl: true,
})

const { width, height, native } = window
const gl = createContext(width, height, { window: native })
const ext = gl.getExtension('STACKGL_resize_drawingbuffer')
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
			[ 0, 0.5 ],
			[ 0.5, -0.5 ],
			[ -0.5, -0.5 ],
		]),
	},

	uniforms: {
		color: regl.prop('color'),
	},

	count: 3,
})

const resize = () => {
	const { width: w, height: h } = window
	ext.resize(w, h)
	regl.poll()
}

resize()

main_loop:
for (;;) {
	// Handle events
	{
		let event
		while ((event = sdl.events.poll())) {
			switch (event?.type) {
				case 'quit': { break main_loop }

				case 'window-resized': {
					resize()
					break
				}

				// No default
			}
		}
	}

	// Render
	{
		regl.clear({
			color: [ 0, 0, 0, 1 ],
			depth: 1,
		})

		const a = (Date.now() / 1000) % (2 * Math.PI)

		drawTriangle({ color: [
			Math.cos(a),
			Math.sin(a * 0.8),
			Math.cos(a * 3),
			1,
		] })

		gl.swap()
	}
}
