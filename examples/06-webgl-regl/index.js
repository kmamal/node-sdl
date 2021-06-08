import sdl from '@kmamal/sdl'
import createContext from '@kmamal/gl'
import createRegl from 'regl'

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

window.on('resize', () => {
	const { width: w, height: h } = window
	ext.resize(w, h)
	regl.poll()
	gl.swap()
})

let tic = Date.now()
let toc
let frames = 0

const interval = setInterval(() => {
	if (window.destroyed) {
		clearInterval(interval)
		return
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

	// Count frames
	{
		frames++
		toc = Date.now()
		const ellapsed = toc - tic
		if (ellapsed >= 1e3) {
			const fps = Math.round(frames / (ellapsed / 1e3))

			window.setTitle(`FPS: ${fps}`)

			tic = toc
			frames = 0
		}
	}
}, 1e3 / 30)
