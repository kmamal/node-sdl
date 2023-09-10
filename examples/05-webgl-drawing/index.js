import sdl from '@kmamal/sdl'
import createContext from '@kmamal/gl'

const window = sdl.video.createWindow({
	resizable: true,
	opengl: true,
})

const { pixelWidth: width, pixelHeight: height, native } = window
const gl = createContext(width, height, { window: native })
const ext = gl.getExtension('STACKGL_resize_drawingbuffer')

const vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, `
	attribute vec2 position;
	varying vec2 uv;

	void main() {
		gl_Position = vec4(position, 0.0, 1.0);
		uv = (position + vec2(1.0)) / 2.0;
	}
`)
gl.compileShader(vertexShader)
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
	console.log("vertex shader error:", gl.getShaderInfoLog(vertexShader))
	process.exit(1)
}

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(fragmentShader, `
	precision highp float;
	varying vec2 uv;

	void main() {
		gl_FragColor = vec4(uv.y, uv.x, 0.5, 1.0);
	}
`)
gl.compileShader(fragmentShader)
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
	console.log("fragment shader error:", gl.getShaderInfoLog(fragmentShader))
	process.exit(1)
}

const program = gl.createProgram()
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)
gl.linkProgram(program)
gl.validateProgram(program)
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	console.log("linking error:", gl.getProgramInfoLog(program))
	process.exit()
}
gl.detachShader(program, vertexShader)
gl.detachShader(program, fragmentShader)
gl.deleteShader(vertexShader)
gl.deleteShader(fragmentShader)

const arrayBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	...[ -1, 1 ],
	...[ 1, 1 ],
	...[ -1, -1 ],
	...[ 1, -1 ],
]), gl.STATIC_DRAW)
const attribPosition = gl.getAttribLocation(program, 'position')
gl.vertexAttribPointer(attribPosition, 2, gl.FLOAT, false, 0, 0)
gl.enableVertexAttribArray(attribPosition)

gl.useProgram(program)

gl.clearColor(1, 0, 0, 1)

window.on('resize', () => {
	const { pixelWidth: w, pixelHeight: h } = window
	ext.resize(w, h)
	gl.viewport(0, 0, w, h)
	gl.swap()

	gl.clear(gl.COLOR_BUFFER_BIT)
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
	gl.swap()
})
