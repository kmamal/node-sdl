# @kmamal/sdl

[![Package](https://img.shields.io/npm/v/%2540kmamal%252Fsdl)](https://www.npmjs.com/package/@kmamal/sdl)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@kmamal/sdl)](https://libraries.io/npm/@kmamal%2Fsdl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SDL bindings for Node.js. Provides access to systems that are not normally available to Node.js applications:

- 💻 Window management
- ⌨ Keyboard
- 🖱 Mouse
- 🕹 Joysticks
- 🎮 Controllers
- 🔈 Audio playback
- 🎤 Audio recording
- 📋 Clipboard manipulation
- 🔋 Battery status
- 🧭 Sensors

Also allows using Canvas2D, WebGL, and WebGPU without a browser, through these libraries:

- __Canvas2D:__ [@napi-rs/canvas](https://www.npmjs.com/package/@napi-rs/canvas). In my experience, this is the fastest library out of the many available on npm.
- __WebGL:__ [@kmamal/gl](https://github.com/kmamal/headless-gl#readme). This is a fork of [headless-gl](https://github.com/stackgl/headless-gl#readme) that I've modified to render directly to SDL windows.
- __WebGPU:__ [@kmamal/gpu](https://github.com/kmamal/gpu#readme). This is a fork of [Google Dawn](https://dawn.googlesource.com/dawn/+/refs/heads/main/src/dawn/node/) that I've modified to render directly to SDL windows.

Officially supports Linux (x64, arm64), Mac (x64, arm64), and Windows (x64, arm64).
Should theoretically work on any system supported by both SDL and Node.js, but I haven't tried any others.
Prebuilt binaries are available for the supported architectures.

## Installation

This package is self-contained. Just run:

```bash
npm install @kmamal/sdl
```

You do __not__ have to manually install any other libs or DLLs to your system. A compatible version of SDL will be automatically downloaded by the install script and placed inside `node_modules` along with this lib's prebuilt binding binaries.

In future versions of npm you will have to manually approve scripts before they can run. You can do this via:

```bash
npm install-scripts approve @kmamal/sdl
```

If the install script fails, have a look at the instructions for [building the package manually](#building-from-source)

## Examples

### "Hello, World!"

```js
import sdl from '@kmamal/sdl'

const window = sdl.video.createWindow({ title: "Hello, World!" })
window.on('*', console.log)
```

### Canvas2D

```js
import sdl from '@kmamal/sdl'
import { createCanvas } from '@napi-rs/canvas'

// Setup
const window = sdl.video.createWindow({ title: "Canvas2D" })
const { pixelWidth: width, pixelHeight: height } = window
const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')

// Clear screen to red
ctx.fillStyle = 'red'
ctx.fillRect(0, 0, width, height)

// Render to window
const buffer = Buffer.from(ctx.getImageData(0, 0, width, height).data)
window.render(width, height, width * 4, 'rgba32', buffer)
```

### WebGL

```js
import sdl from '@kmamal/sdl'
import createContext from '@kmamal/gl'

// Setup
const window = sdl.video.createWindow({ title: "WebGL", opengl: true })
const { pixelWidth: width, pixelHeight: height, native } = window
const gl = createContext(width, height, { window: native })

// Clear screen to red
gl.clearColor(1, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)

// Render to window
gl.swap()
```

### WebGPU

```js
import sdl from '@kmamal/sdl'
import gpu from '@kmamal/gpu'

// Setup
const window = sdl.video.createWindow({ title: "WebGPU", webgpu: true })
const instance = gpu.create([])
const adapter = await instance.requestAdapter()
const device = await adapter.requestDevice()
const renderer = gpu.renderGPUDeviceToWindow({ device, window })

// Clear screen to red
const commandEncoder = device.createCommandEncoder()
const renderPass = commandEncoder.beginRenderPass({
  colorAttachments: [
    {
      view: renderer.getCurrentTextureView(),
      clearValue: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
      loadOp: 'clear',
      storeOp: 'store',
    },
  ],
})
renderPass.end()
device.queue.submit([ commandEncoder.finish() ])

// Render to window
renderer.swap()

```

# Documentation

Link to the full [API Reference](https://github.com/kmamal/node-sdl/tree/master/docs/api-reference.md).

The repo contains a [folder full of examples](https://github.com/kmamal/node-sdl/tree/master/examples#readme) to get you started.

