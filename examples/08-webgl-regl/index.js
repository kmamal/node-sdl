import sdl from '@kmamal/sdl'
import createContext from '@kmamal/gl'
import createRegl from 'regl'

const window = sdl.video.createWindow({
	resizable: true,
	opengl: true,
})

const { pixelWidth: width, pixelHeight: height, native } = window
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


let tic = Date.now()
let toc
let frames = 0

const render = () => {
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
		const elapsed = toc - tic
		if (elapsed >= 1e3) {
			const fps = Math.round(frames / (elapsed / 1e3))

			window.setTitle(`FPS: ${fps}`)

			tic = toc
			frames = 0
		}
	}
}

window.on('resize', ({ width: w, height: h, pixelWidth: pw, pixelHeight: ph }) => {
	ext.resize(pw, ph)
	gl.viewport(0, 0, w, h)
	gl.swap()

	render()
})

const interval = setInterval(render, 1e3 / 30)
