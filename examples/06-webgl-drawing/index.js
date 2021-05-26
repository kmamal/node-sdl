const sdl = require('@kmamal/sdl')
const createContext = require('@kmamal/gl')

const window = sdl.video.createWindow({
	resizable: true,
	opengl: true,
})

const { width, height, native } = window
const gl = createContext(width, height, { window: native })
const ext = gl.getExtension('STACKGL_resize_drawingbuffer')

const vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, `
	attribute vec2 position;
	void main() {
		gl_Position = vec4(position, 0.0, 1.0);
	}
`)
gl.compileShader(vertexShader)
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
	console.log("vertex shader error:", gl.getShaderInfoLog(vertexShader))
	process.exit(1)
}

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(fragmentShader, `
	precision mediump float;
	uniform float width;
	uniform float height;
	void main() {
		vec2 pos = vec2(gl_FragCoord);
		float red = 1.0 - pos.y / height;
		float green = pos.x / width;
		gl_FragColor = vec4(red, green, 0.0, 1.0);
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
gl.detachShader(program, vertexShader)
gl.detachShader(program, fragmentShader)
gl.deleteShader(vertexShader)
gl.deleteShader(fragmentShader)
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	console.log("linking error:", gl.getProgramInfoLog(program))
	process.exit()
}

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

const uniformWidth = gl.getUniformLocation(program, 'width')
const uniformHeight = gl.getUniformLocation(program, 'height')

gl.useProgram(program)

gl.clearColor(1, 0, 0, 1)

const redraw = () => {
	const { width: w, height: h } = window
	ext.resize(w, h)

	gl.clear(gl.COLOR_BUFFER_BIT)
	gl.uniform1f(uniformWidth, w)
	gl.uniform1f(uniformHeight, h)
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

	gl.swap()
}

redraw()

main_loop:
for (;;) {
	const event = sdl.events.wait()
	switch (event?.type) {
		case 'quit': { break main_loop }

		case 'window-resized': {
			redraw()
			break
		}

		// No default
	}
}
