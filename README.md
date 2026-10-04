# @kmamal/sdl

[![Package](https://img.shields.io/npm/v/%2540kmamal%252Fsdl)](https://www.npmjs.com/package/@kmamal/sdl)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@kmamal/sdl)](https://libraries.io/npm/@kmamal%2Fsdl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> [!NOTE]
> Version 1.0.0 has migrated from SDL2 to SDL3.
> Most of the API is unchanged, but several changes break compatibility.
> The [migration guide](https://github.com/kmamal/node-sdl/tree/master/docs/migrating-to-sdl3.md) lists them all.

SDL bindings for Node.js. Gives applications access to systems that Node.js does not normally provide:

- 💻 Window management
- ⌨ Keyboard
- 🖱 Mouse
- 🕹 Joysticks
- 🎮 Gamepads
- 🔈 Audio playback
- 🎤 Audio recording
- 📋 Clipboard manipulation
- 🔋 Battery status
- 🧭 Sensors

The bindings also let you use Canvas2D, WebGL, and WebGPU without a browser, through these libraries:

- __Canvas2D:__ [@napi-rs/canvas](https://www.npmjs.com/package/@napi-rs/canvas). In my experience, it is the fastest of the many canvas libraries on npm.
- __WebGL:__ [@kmamal/gl](https://github.com/kmamal/headless-gl#readme). I forked [headless-gl](https://github.com/stackgl/headless-gl#readme) and modified it to render directly to SDL windows.
- __WebGPU:__ [@kmamal/gpu](https://github.com/kmamal/gpu#readme). I forked [Google Dawn](https://dawn.googlesource.com/dawn/+/refs/heads/main/src/dawn/node/) and modified it to render directly to SDL windows.

The package officially supports Linux (X11 and Wayland), Mac, and Windows.
It should work on any system that both SDL and Node.js support, but I haven't tried others.
Prebuilt binaries exist for x64 and arm architectures on all supported platforms.

## Installation

The package is self-contained. Just run:

```bash
npm install @kmamal/sdl
```

You do __not__ need to install any other libraries or DLLs yourself. The install script downloads a compatible version of SDL and places it inside `node_modules`, next to the package's prebuilt binding binaries.

Future versions of npm will require you to approve scripts before they run. Approve this package's script with:

```bash
npm install-scripts approve @kmamal/sdl
```

If the install script fails, follow the instructions for [building the package manually](https://github.com/kmamal/node-sdl/tree/master/docs/building-from-source.md).

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

The full [API Reference](https://github.com/kmamal/node-sdl/tree/master/docs/api-reference.md) documents every function.

To get started, browse the [examples](https://github.com/kmamal/node-sdl/tree/master/examples#readme) in the repo.

