# @kmamal/sdl

[![Package](https://img.shields.io/npm/v/%2540kmamal%252Fsdl)](https://www.npmjs.com/package/@kmamal/sdl)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@kmamal/sdl)](https://libraries.io/npm/@kmamal%2Fsdl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SDL bindings for Node.js.
Provides window management, input events (keyboard, mouse, joysticks, controllers, sensors), audio playback and recording, clipboard manipulation, and battery status.

It should work on Linux, Mac, and Windows.
Prebuilt binaries are available for x64 architectures, arm-based Macs, and Raspberry Pi.

#### Canvas, WebGL, and WebGPU

One goal of this project is to allow using Canvas, WebGL, and WebGPU without a browser.
You can use the [canvas](https://www.npmjs.com/package/canvas) package to render using the canvas API.
For WebGL you can use [@kmamal/gl](https://github.com/kmamal/headless-gl#readme) and for WebGPU you can use [@kmamal/gpu](https://github.com/kmamal/gpu#readme).
Both WebGL and WebGPU support rendering directly to the window (without any intermediate buffer copying).
Canvas still uses an intermediate buffer, but that might change in the future.


## Installation

SDL is bundled along with the binaries so a separate installation is not necessary.
This package is self-contained.
Just run:

```
npm install @kmamal/sdl
```

(But if things go wrong do look over [here](#building-from-source))


## Examples

### "Hello, World!"

```js
import sdl from '@kmamal/sdl'

const window = sdl.video.createWindow({ title: "Hello, World!" })
window.on('*', console.log)
```

### Canvas
```js
import sdl from '@kmamal/sdl'
import { createCanvas } from 'canvas'

const window = sdl.video.createWindow({ title: "Canvas" })
const { pixelWidth: width, pixelHeight: height } = window
const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')

// Clear screen to red
ctx.fillStyle = 'red'
ctx.fillRect(0, 0, width, height)
const buffer = canvas.toBuffer('raw')
window.render(width, height, width * 4, 'bgra32', buffer)
```

### WebGL
```js
import sdl from '@kmamal/sdl'
import createContext from '@kmamal/gl'

const window = sdl.video.createWindow({ title: "WebGL", opengl: true })
const { pixelWidth: width, pixelHeight: height, native } = window
const gl = createContext(width, height, { window: native })

// Clear screen to red
gl.clearColor(1, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
gl.swap()
```

### WebGPU
```js
import sdl from '@kmamal/sdl'
import gpu from '@kmamal/gpu'

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

renderer.swap()

```

There are more examples [in the `examples/` folder](https://github.com/kmamal/node-sdl/tree/master/examples).


# API Reference

## Contents

* [sdl](#sdl)
  * [sdl.info](#sdlinfo)
* [sdl.video](#sdlvideo)
  * [Image data](#image-data)
  * [Pixel formats](#pixel-formats)
  * [High-DPI](#highdpi)
  * [Event: 'displayAdd'](#event-displayadd)
  * [Event: 'displayRemove'](#event-displayremove)
  * [Event: 'displayOrient'](#event-displayorient)
  * [sdl.video.displays](#sdlvideodisplays)
  * [sdl.video.windows](#sdlvideowindows)
  * [sdl.video.focused](#sdlvideofocused)
  * [sdl.video.hovered](#sdlvideohovered)
  * [sdl.video.createWindow([options])](#sdlvideocreatewindowoptions)
  * [class Window](#class-window)
    * [Event: 'show'](#event-show)
    * [Event: 'hide'](#event-hide)
    * [Event: 'expose'](#event-expose)
    * [Event: 'minimize'](#event-minimize)
    * [Event: 'maximize'](#event-maximize)
    * [Event: 'restore'](#event-restore)
    * [Event: 'move'](#event-move)
    * [Event: 'resize'](#event-resize)
    * [Event: 'focus'](#event-focus)
    * [Event: 'blur'](#event-blur)
    * [Event: 'hover'](#event-hover)
    * [Event: 'leave'](#event-leave)
    * [Event: 'beforeClose'](#event-beforeclose)
    * [Event: 'close'](#event-close)
    * [Event: 'keyDown'](#event-keydown)
    * [Event: 'keyUp'](#event-keyup)
    * [Event: 'textInput'](#event-textinput)
    * [Event: 'mouseButtonDown'](#event-mousebuttondown)
    * [Event: 'mouseButtonUp'](#event-mousebuttonup)
    * [Event: 'mouseMove'](#event-mousemove)
    * [Event: 'mouseWheel'](#event-mousewheel)
    * [Event: 'dropBegin'](#event-dropbegin)
    * [Event: 'dropText'](#event-droptext)
    * [Event: 'dropFile'](#event-dropfile)
    * [Event: 'dropComplete'](#event-dropcomplete)
    * [window.id](#windowid)
    * [window.title](#windowtitle)
    * [window.setTitle(title)](#windowsettitletitle)
    * [window.x](#windowx)
    * [window.y](#windowy)
    * [window.setPosition(x, y)](#windowsetpositionx-y)
    * [window.width](#windowwidth)
    * [window.height](#windowheight)
    * [window.pixelWidth](#windowpixelwidth)
    * [window.pixelHeight](#windowpixelheight)
    * [window.setSize(width, height)](#windowsetsizewidth-height)
    * [window.visible](#windowvisible)
    * [window.show([show])](#windowshowshow)
    * [window.hide()](#windowhide)
    * [window.fullscreen](#windowfullscreen)
    * [window.setFullscreen(fullscreen)](#windowsetfullscreenfullscreen)
    * [window.resizable](#windowresizable)
    * [window.setResizable(resizable)](#windowsetresizableresizable)
    * [window.borderless](#windowborderless)
    * [window.alwaysOnTop](#windowalwaysontop)
    * [window.setBorderless(borderless)](#windowsetborderlessborderless)
    * [window.accelerated](#windowaccelerated)
    * [window.setAccelerated(accelerated)](#windowsetacceleratedaccelerated)
    * [window.vsync](#windowvsync)
    * [window.setVsync(vsync)](#windowsetvsyncvsync)
    * [window.opengl](#windowopengl)
    * [window.webgpu](#windowwebgpu)
    * [window.native](#windownative)
    * [window.maximized](#windowmaximized)
    * [window.maximize()](#windowmaximize)
    * [window.minimized](#windowminimized)
    * [window.minimize()](#windowminimize)
    * [window.restore()](#windowrestore)
    * [window.focused](#windowfocused)
    * [window.focus()](#windowfocus)
    * [window.hovered](#windowhovered)
    * [window.skipTaskbar](#windowskiptaskbar)
    * [window.popupMenu](#windowpopupmenu)
    * [window.tooltip](#windowtooltip)
    * [window.utility](#windowutility)
    * [window.render(width, height, stride, format, buffer)](#windowrenderwidth-height-stride-format-buffer)
    * [window.setIcon(width, height, stride, format, buffer)](#windowseticonwidth-height-stride-format-buffer)
    * [window.flash(untilFocused)](#windowflashuntilfocused)
    * [window.stopFlashing()](#windowstopflashing)
    * [window.destroyed](#windowdestroyed)
    * [window.destroy()](#windowdestroy)
* [sdl.keyboard](#sdlkeyboard)
  * [Virtual keys](#virtual-keys)
  * [Enum: SCANCODE](#enum-scancode)
  * [sdl.keyboard.getKey(scancode)](#sdlkeyboardgetkeyscancode)
  * [sdl.keyboard.getScancode(key)](#sdlkeyboardgetscancodekey)
  * [sdl.keyboard.getState()](#sdlkeyboardgetstate)
* [sdl.mouse](#sdlmouse)
  * [Mouse cursors](#mouse-cursors)
  * [Enum: BUTTON](#enum-button)
  * [sdl.mouse.getButton(button)](#sdlmousegetbuttonbutton)
  * [sdl.mouse.position](#sdlmouseposition)
  * [sdl.mouse.setPosition(x, y)](#sdlmousesetpositionx-y)
  * [sdl.mouse.setCursor(cursor)](#sdlmousesetcursorcursor)
  * [sdl.mouse.setCursorImage(width, height, stride, format, buffer, x, y)](#sdlmousesetcursorimagewidth-height-stride-format-buffer-x-y)
  * [sdl.mouse.showCursor([show])](#sdlmouseshowcursorshow)
  * [sdl.mouse.hideCursor()](#sdlmousehidecursor)
  * [sdl.mouse.capture([capture])](#sdlmousecapturecapture)
  * [sdl.mouse.uncapture()](#sdlmouseuncapture)
* [sdl.joystick](#sdljoystick)
  * [Joystick types](#joystick-types)
  * [Hat positions](#hat-positions)
  * [Power levels](#power-levels)
  * [Event: 'deviceAdd'](#joystick-event-deviceadd)
  * [Event: 'deviceRemove'](#joystick-event-deviceremove)
  * [sdl.joystick.devices](#sdljoystickdevices)
  * [sdl.joystick.openDevice(device)](#sdljoystickopendevicedevice)
  * [class JoystickInstance](#class-joystickinstance)
    * [Event: 'axisMotion'](#joystick-instance-event-axismotion)
    * [Event: 'ballMotion'](#event-ballmotion)
    * [Event: 'buttonDown'](#joystick-instance-event-buttondown)
    * [Event: 'buttonUp'](#joystick-instance-event-buttonup)
    * [Event: 'hatMotion'](#event-hatmotion)
    * [Event: 'close'](#joystick-instance-event-close)
    * [joystickInstance.device](#joystickinstancedevice)
    * [joystickInstance.firmwareVersion](#joystickinstancefirmwareversion)
    * [joystickInstance.serialNumber](#joystickinstanceserialnumber)
    * [joystickInstance.axes](#joystickinstanceaxes)
    * [joystickInstance.balls](#joystickinstanceballs)
    * [joystickInstance.buttons](#joystickinstancebuttons)
    * [joystickInstance.hats](#joystickinstancehats)
    * [joystickInstance.power](#joystickinstancepower)
    * [joystickInstance.setPlayer(index)](#joystickinstancesetplayerindex)
    * [joystickInstance.hasLed](#joystickinstancehasled)
    * [joystickInstance.setLed(red, green, blue)](#joystickinstancesetledred-green-blue)
    * [joystickInstance.hasRumble](#joystickinstancehasrumble)
    * [joystickInstance.rumble([low[, high[, duration]]])](#joystickinstancerumblelow-high-duration)
    * [joystickInstance.stopRumble()](#joystickinstancestoprumble)
    * [joystickInstance.hasRumbleTriggers](#joystickinstancehasrumbletriggers)
    * [joystickInstance.rumbleTriggers([left[, right[, duration]]])](#joystickinstancerumbletriggersleft-right-duration)
    * [joystickInstance.stopRumbleTriggers()](#joystickinstancestoprumbletriggers)
    * [joystickInstance.closed](#joystickinstanceclosed)
    * [joystickInstance.close()](#joystickinstanceclose)
* [sdl.controller](#sdlcontroller)
  * [Event: 'deviceAdd'](#controller-event-deviceadd)
  * [Event: 'deviceRemove'](#controller-event-deviceremove)
  * [sdl.controller.addMappings(mappings)](#sdlcontrolleraddmappingsmappings)
  * [sdl.controller.devices](#sdlcontrollerdevices)
  * [sdl.controller.openDevice(device)](#sdlcontrolleropendevicedevice)
  * [class ControllerInstance](#class-controllerinstance)
    * [Event: 'axisMotion'](#controller-instance-event-axismotion)
    * [Event: 'buttonDown'](#controller-instance-event-buttondown)
    * [Event: 'buttonUp'](#controller-instance-event-buttonup)
    * [Event: 'remap'](#event-remap)
    * [Event: 'close'](#controller-instance-event-close)
    * [controllerInstance.device](#controllerinstancedevice)
    * [controllerInstance.firmwareVersion](#controllerinstancefirmwareversion)
    * [controllerInstance.serialNumber](#controllerinstanceserialnumber)
    * [controllerInstance.axes](#controllerinstanceaxes)
    * [controllerInstance.buttons](#controllerinstancebuttons)
    * [controllerInstance.power](#controllerinstancepower)
    * [controllerInstance.setPlayer(index)](#controllerinstancesetplayerindex)
    * [controllerInstance.hasLed](#controllerinstancehasled)
    * [controllerInstance.setLed(red, green, blue)](#controllerinstancesetledred-green-blue)
    * [controllerInstance.hasRumble](#controllerinstancehasrumble)
    * [controllerInstance.rumble([low[, high[, duration]]])](#controllerinstancerumblelow-high-duration)
    * [controllerInstance.stopRumble()](#controllerinstancestoprumble)
    * [controllerInstance.hasRumbleTriggers](#controllerinstancehasrumbletriggers)
    * [controllerInstance.rumbleTriggers([left[, right[, duration]]])](#controllerinstancerumbletriggersleft-right-duration)
    * [controllerInstance.stopRumbleTriggers()](#controllerinstancestoprumbletriggers)
    * [controllerInstance.closed](#controllerinstanceclosed)
    * [controllerInstance.close()](#controllerinstanceclose)
* [sdl.sensor](#sdlsensor)
  * [sdl.sensor.STANDARD_GRAVITY](#sdlsensorstandardgravity)
  * [sdl.sensor.devices](#sdlsensordevices)
  * [sdl.sensor.openDevice(device)](#sdlsensoropendevicedevice)
  * [class SensorInstance](#class-sensorinstance)
    * [Event: 'update'](#sensor-instance-event-update)
    * [sensorInstance.device](#sensorinstancedevice)
    * [sensorInstance.data](#sensorinstancedata)
    * [sensorInstance.closed](#sensorinstanceclosed)
    * [sensorInstance.close()](#sensorinstanceclose)
* [sdl.audio](#sdlaudio)
  * [Audio data](#audio-data)
  * [Sample formats](#sample-formats)
  * [Event: 'deviceAdd'](#audio-event-deviceadd)
  * [Event: 'deviceRemove'](#audio-event-deviceremove)
  * [sdl.audio.bytesPerSample(format)](#sdlaudiobytespersampleformat)
  * [sdl.audio.minSampleValue(format)](#sdlaudiominsamplevalueformat)
  * [sdl.audio.maxSampleValue(format)](#sdlaudiomaxsamplevalueformat)
  * [sdl.audio.zeroSampleValue(format)](#sdlaudiozerosamplevalueformat)
  * [sdl.audio.readSample(format, buffer[, offset])](#sdlaudioreadsampleformat-buffer-offset)
  * [sdl.audio.readerName(format)](#sdlaudioreadernameformat)
  * [sdl.audio.writeSample(format, buffer, value[, offset])](#sdlaudiowritesampleformat-buffer-value-offset)
  * [sdl.audio.writerName(format)](#sdlaudiowriternameformat)
  * [sdl.audio.devices](#sdlaudiodevices)
  * [sdl.audio.openDevice(device[, options])](#sdlaudioopendevicedevice-options)
  * [class AudioInstance](#class-audioinstance)
    * [Event: 'close'](#audio-instance-event-close)
    * [audioInstance.id](#audioinstanceid)
    * [audioInstance.channels](#audioinstancechannels)
    * [audioInstance.frequency](#audioinstancefrequency)
    * [audioInstance.format](#audioinstanceformat)
    * [audioInstance.bytesPerSample](#audioinstancebytespersample)
    * [audioInstance.minSampleValue](#audioinstanceminsamplevalue)
    * [audioInstance.maxSampleValue](#audioinstancemaxsamplevalue)
    * [audioInstance.zeroSampleValue](#audioinstancezerosamplevalue)
    * [audioInstance.readSample(buffer[, offset])](#audioinstancereadsamplebuffer-offset)
    * [audioInstance.readerName](#audioinstancereadername)
    * [audioInstance.writeSample(buffer, value[, offset])](#audioinstancewritesamplebuffer-value-offset)
    * [audioInstance.writerName](#audioinstancewritername)
    * [audioInstance.buffered](#audioinstancebuffered)
    * [audioInstance.playing](#audioinstanceplaying)
    * [audioInstance.play([play])](#audioinstanceplayplay)
    * [audioInstance.pause()](#audioinstancepause)
    * [audioInstance.queued](#audioinstancequeued)
    * [audioInstance.clearQueue()](#audioinstanceclearqueue)
    * [audioInstance.closed](#audioinstanceclosed)
    * [audioInstance.close()](#audioinstanceclose)
  * [class AudioPlaybackInstance extends AudioInstance](#class-audioplaybackinstance-extends-audioinstance)
    * [playbackInstance.enqueue(buffer[, bytes])](#playbackinstanceenqueuebuffer-bytes)
  * [class AudioRecordingInstance extends AudioInstance](#class-audiorecordinginstance-extends-audioinstance)
    * [recordingInstance.dequeue(buffer[, bytes])](#recordinginstancedequeuebuffer-bytes)
* [sdl.clipboard](#sdlclipboard)
  * [Event: 'update'](#event-update)
  * [sdl.clipboard.text](#sdlclipboardtext)
  * [sdl.clipboard.setText(text)](#sdlclipboardsettexttext)
* [sdl.power](#sdlpower)
  * [sdl.power.info](#sdlpowerinfo)


## sdl

### sdl.info

* `<object>`
  * `version: <object>`
    * `compile: <object>` The SDL version the bindings were compiled against.
      * `major, minor, patch: <semver>` The components of the version.
    * `runtime: <object>` The SDL version of the dynamic library the is loaded.
      * `major, minor, patch: <semver>` The components of the version.
  * `platform: <string>` The name of the platform we are running on. Possible values are: `'Linux'`, `'Windows'`, and `'Mac OS X'`.
  * `drivers: <object>`
    * `video: <object>`
      * `all: <string>[]` A list of all video drivers.
      * `current: <string>|<null>` The video driver that is currently selected.
    * `audio: <object>`
      * `all: <string>[]` A list of all audio drivers.
      * `current: <string>|<null>` The audio driver that is currently selected.

This object is filled with the information produced during the initialization of SDL.
All the values will remain constant throughout the execution of the program.
If you want to initialize SDL with drivers other than the default ones, you can do so via its [environment variables](https://wiki.libsdl.org/FAQUsingSDL).

Note that the `current` video or audio driver can be `null`.
This can happen on systems that don't have any compatible devices, such as on a CI pipeline.

Sample data for Ubuntu:

```js
{
  version: {
    compile: { major: 2, minor: 0, patch: 10 },
    runtime: { major: 2, minor: 0, patch: 10 },
  },
  platform: 'Linux',
  drivers: {
    video: {
      all: [ 'x11', 'wayland', 'dummy' ],
      current: 'x11',
    },
    audio: {
      all: [ 'pulseaudio', 'alsa', 'sndio', 'dsp', 'disk', 'dummy' ],
      current: 'pulseaudio',
    },
  },
}
```


## sdl.video

### Image data

There are 3 places in the API where you will need to provide an image to the library:
* [`window.render()`](#windowrenderwidth-height-stride-format-buffer)
* [`window.setIcon()`](#windowseticonwidth-height-stride-format-buffer)
* [`mouse.setCursorImage()`](#sdlmousesetcursorimagewidth-height-stride-format-buffer-x-y)

All three of these functions accept the image as a series of arguments:
* `width: <number>` The width of the image in pixels.
* `height: <number>` The height of the image in pixels.
* `stride: <number>` How many bytes each row of the image takes up in the buffer. This is usually equal to `width * bytesPerPixel`, but can be larger if the rows of the buffer are padded to always be some multiple of bytes.
* `format: `[`<PixelFormat>`](#pixel-formats) The binary representation of the data in the buffer.
* `buffer: <Buffer>` Holds the actual pixel data for the image, in the format and layout specified by all the above arguments.

So for example, to fill the window with a red+green gradient you could do:

```js
const { pixelWidth: width, pixelHeight: height } = window
const stride = width * 4
const buffer = Buffer.alloc(stride * height)

let offset = 0
for (let i = 0; i < height; i++) {
  for (let j = 0; j < width; j++) {
    buffer[offset++] = Math.floor(256 * i / height) // R
    buffer[offset++] = Math.floor(256 * j / width)  // G
    buffer[offset++] = 0                            // B
    buffer[offset++] = 255                          // A
  }
}

window.render(width, height, stride, 'rgba32', buffer)
```

### Pixel formats

String values used to represent how the pixels of an image are stored in a Buffer.

| Value | Corresponding `SDL_PixelFormatEnum` | Comment |
| --- | --- | --- |
| `'rgb332'` | `SDL_PIXELFORMAT_RGB332` | |
| `'rgb444'` | `SDL_PIXELFORMAT_RGB444` | |
| `'rgb555'` | `SDL_PIXELFORMAT_RGB555` | |
| `'bgr555'` | `SDL_PIXELFORMAT_BGR555` | |
| `'argb4444'` | `SDL_PIXELFORMAT_ARGB4444` | |
| `'rgba4444'` | `SDL_PIXELFORMAT_RGBA4444` | |
| `'abgr4444'` | `SDL_PIXELFORMAT_ABGR4444` | |
| `'bgra4444'` | `SDL_PIXELFORMAT_BGRA4444` | |
| `'argb1555'` | `SDL_PIXELFORMAT_ARGB1555` | |
| `'rgba5551'` | `SDL_PIXELFORMAT_RGBA5551` | |
| `'abgr1555'` | `SDL_PIXELFORMAT_ABGR1555` | |
| `'bgra5551'` | `SDL_PIXELFORMAT_BGRA5551` | |
| `'rgb565'` | `SDL_PIXELFORMAT_RGB565` | |
| `'bgr565'` | `SDL_PIXELFORMAT_BGR565` | |
| `'rgb24'` | `SDL_PIXELFORMAT_RGB24` | |
| `'bgr24'` | `SDL_PIXELFORMAT_BGR24` | |
| `'rgb888'` | `SDL_PIXELFORMAT_RGB888` | |
| `'rgbx8888'` | `SDL_PIXELFORMAT_RGBX8888` | |
| `'bgr888'` | `SDL_PIXELFORMAT_BGR888` | |
| `'bgrx8888'` | `SDL_PIXELFORMAT_BGRX8888` | |
| `'argb8888'` | `SDL_PIXELFORMAT_ARGB8888` | |
| `'rgba8888'` | `SDL_PIXELFORMAT_RGBA8888` | |
| `'abgr8888'` | `SDL_PIXELFORMAT_ABGR8888` | |
| `'bgra8888'` | `SDL_PIXELFORMAT_BGRA8888` | |
| `'argb2101010'` | `SDL_PIXELFORMAT_ARGB2101010` | |
| `'rgba32'` | `SDL_PIXELFORMAT_RGBA32` | alias for `'rgba8888'` on big endian machines and for `'abgr8888'` on little endian machines |
| `'argb32'` | `SDL_PIXELFORMAT_ARGB32` | alias for `'argb8888'` on big endian machines and for `'bgra8888'` on little endian machines |
| `'bgra32'` | `SDL_PIXELFORMAT_BGRA32` | alias for `'bgra8888'` on big endian machines and for `'argb8888'` on little endian machines |
| `'abgr32'` | `SDL_PIXELFORMAT_ABGR32` | alias for `'abgr8888'` on big endian machines and for `'rgba8888'` on little endian machines |
| `'yv12'` | `SDL_PIXELFORMAT_YV12` | planar mode: Y + V + U (3 planes) |
| `'iyuv'` | `SDL_PIXELFORMAT_IYUV` | planar mode: Y + U + V (3 planes) |
| `'yuy2'` | `SDL_PIXELFORMAT_YUY2` | packed mode: Y0+U0+Y1+V0 (1 plane) |
| `'uyvy'` | `SDL_PIXELFORMAT_UYVY` | packed mode: U0+Y0+V0+Y1 (1 plane) |
| `'yvyu'` | `SDL_PIXELFORMAT_YVYU` | packed mode: Y0+V0+Y1+U0 (1 plane) |
| `'nv12'` | `SDL_PIXELFORMAT_NV12` | planar mode: Y + U/V interleaved (2 planes) |
| `'nv21'` | `SDL_PIXELFORMAT_NV21` | planar mode: Y + V/U interleaved (2 planes) |


### High-DPI

On a high-dpi display, windows have more pixels that their `width` and `height` would indicate.
On such systems `width` and `height` (and all other measurements such as `x` and `y`) are in "points".
Points are abstract and don't have to correspond to pixels.
If you need to know a window's width and height in pixels, you should use the `pixelWidth` and `pixelHeight` properties.
You should be doing this always, since you don't know beforehand if your program will be running on a high-dpi system.


### Event: 'displayAdd'

* `device: <object>`: An object from [`sdl.video.displays`](#sdlvideodisplays) indicating the display that caused the event.

Fired when a display is added to the system.
Check [`sdl.video.displays`](#sdlvideodisplays) to get the new list of displays.


### Event: 'displayRemove'

* `device: <object>`: An object from [`sdl.video.displays`](#sdlvideodisplays) indicating the display that caused the event.

Fired when a display is removed from the system.
Check [`sdl.video.displays`](#sdlvideodisplays) to get the new list of displays.


### Event: 'displayOrient'

* `device: <object>`: An object from [`sdl.video.displays`](#sdlvideodisplays) indicating the display that caused the event.

Fired when a display changes orientation.
Check [`sdl.video.displays`](#sdlvideodisplays) to get the new list of displays.


### sdl.video.displays

* `<object>[]`
  * `name: <string>` The name of the display.
  * `format: `[`<PixelFormat>`](#pixel-formats) The pixel format of the display.
  * `frequency: <number>` The refresh rate of the display.
  * `geometry: <object>` The desktop region represented by the display.
    * `x, y, width, height: <Rect>` The position and size of the display's geometry.
  * `usable: <object>` Similar to `geometry`, but excludes areas taken up by the OS or window manager such as menus, docks, e.t.c.
    * `x, y, width, height: <Rect>` The position and size of the display's usable region.
  * `dpi: <object>` Return pixel density for the display in dots/pixels-per-inch units.
    * `horizontal: <number>` The horizontal density.
    * `vertical: <number>` The vertical density.
    * `diagonal: <number>` The diagonal density.

A list of all detected displays.
Sample output for two side-to-side monitors is below.
Notice how the geometries don't overlap:

```js
[
  {
    name: '0',
    format: 'rgb888',
    frequency: 60,
    geometry: { x: 0, y: 0, width: 1920, height: 1080 },
    usable: { x: 0, y: 27, width: 1920, height: 1053 },
    dpi: { horizontal: 141.76, vertical: 142.13, diagonal: 141.85 }
  },
  {
    name: '1',
    format: 'rgb888',
    frequency: 60,
    geometry: { x: 1920, y: 0, width: 1920, height: 1080 },
    usable: { x: 1920, y: 27, width: 1920, height: 1053 },
    dpi: { horizontal: 141.76, vertical: 142.13, diagonal: 141.85 }
  },
]
```

### sdl.video.windows

* [`<Window>`](#class-window)`[]`

A list of all open windows.

### sdl.video.focused

* [`<Window>`](#class-window)`|<null>`

The window that has the current keyboard focus, or `null` if no window has the keyboard focus.

### sdl.video.hovered

* [`<Window>`](#class-window)`|<null>`

The window that the mouse is hovered over, or `null` if the mouse is not over a window.

### sdl.video.createWindow([options])

* `options: <object>`
  * `title: <string>` Will appear in the window's title bar. Default: `''`
  * `display: <number>` An object from `sdl.video.displays` to specify in which display the window will appear (if you have multiple displays). Default: `sdl.video.displays[0]`
  * `x: <number>` The x position in which the window will appear relative to the screen, or `null` for centered. Default: `null`
  * `y: <number>` The y position in which the window will appear relative to the screen, or `null` for centered. Default: `null`
  * `width: <number>` The width of the window. Default: `640`
  * `height: <number>` The height of the window. Default: `480`
  * `visible: <boolean>` Set to `false` to create a hidden window that will only be shown when you call [`window.show()`](#windowshowshow). Default: `true`
  * `fullscreen: <boolean>` Set to `true` to create the window in fullscreen mode. Default: `false`
  * `resizable: <boolean>` Set to `true` to allow resizing the window by dragging its borders. Default: `false`
  * `borderless: <boolean>` Set to `true` to completely hide the window's borders and title bar. Default: `false`
  * `alwaysOnTop: <boolean>` Set to `true` to always show this window above others. Default: `false`
  * `accelerated: <boolean>` Set to `false` to disable hardware accelerated rendering. Default: `true`
  * `vsync: <boolean>` Set to `false` to disable frame rate synchronization. Default: `true`
  * `opengl: <boolean>` Set to `true` to create an OpenGL-compatible window (for use with [@kmamal/gl](https://github.com/kmamal/headless-gl#readme)). Default: `false`
  * `webgpu: <boolean>` Set to `true` to create an WebGPU-compatible window (for use with [@kmamal/gpu](https://github.com/kmamal/gpu#readme)). Default: `false`
  * `skipTaskbar: <boolean>` X11 only. Set to `true` to not add this window to the taskbar. Default: `false`
  * `popupMenu: <boolean>` X11 only. Set to `true` to treat this window like a popup menu. Default: `false`
  * `tooltip: <boolean>` X11 only. Set to `true` to treat this window like a tooltip. Default: `false`
  * `utility: <boolean>` X11 only. Set to `true` to treat this window like a utility window. Default: `false`
* Returns: [`<Window>`](#class-window) an object representing the new window.

Creates a new window.

The following restrictions apply:
* If you specify the `display` option, you can't also specify the `x` or `y` options, and vice-versa.
* The `resizable` and `borderless` options are mutually exclusive.
* The `opengl` and `webgpu` options are mutually exclusive.
* The `vsync` option only applies to windows that are also `accelerated`.
* The `accelerated` and `vsync` options have no effect if either `opengl` or `webgpu` is also specified.

If you set the `opengl` or `webgpu` options, then you can only render to the window with OpenGL/WebGPU calls.
Calls to [`render()`](#windowrenderwidth-height-stride-format-buffer) will fail.

## class Window

This class is not directly exposed by the API so you can't use it with the `new` operator.
Instead, objects returned by [`sdl.video.createWindow()`](#sdlvideocreatewindowoptions) are of this type.

### Event: 'show'

Fired when a window becomes visible.

### Event: 'hide'

Fired when a window becomes hidden.

### Event: 'expose'

Fired when a window becomes exposed and should be redrawn.

### Event: 'minimize'

Fired when a window becomes minimized.

### Event: 'maximize'

Fired when a window becomes maximized.

### Event: 'restore'

Fired when a window gets restored.

### Event: 'move'

* `x: <number>` The window's new x position, relative to the screen.
* `y: <number>` The window's new y position, relative to the screen.

Fired when the window changes position.

### Event: 'resize'

* `width: <number>` The window's new width.
* `height: <number>` The window's new height.
* `pixelWidth: <number>` The window's new width in pixels. See [high-dpi](#high-dpi).
* `pixelHeight: <number>` The window's new height in pixels. See [high-dpi](#high-dpi).

Fired when the window changes size.

### Event: 'focus'

Fired when a window gains the keyboard focus.

### Event: 'blur'

Fired when a window loses the keyboard focus.

### Event: 'hover'

Fired when the mouse enters the window.

### Event: 'leave'

Fired when the mouse leaves the window.

### Event: 'beforeClose'

* `prevent: <function (void) => void>` Call this to prevent the window from closing.

Fired to indicate that the user has requested the window to close (usually by clicking the "x" button).
If you need to display any confirmation dialogs you should call `event.prevent()` and handle destruction manually.
If `prevent` is not called, then this event will be followed by a [`'close'`](#event-close) event.

### Event: 'close'

Indicates that the window is about to be destroyed.
Handle any cleanup here.

### Event: 'keyDown'

* `scancode: `[`<Scancode>`](#enum-scancode) The scancode of the key that caused the event.
* `key: `[`<Key>`](#virtual-keys)`|<null>` The virtual key that caused the event, or `null` if the physical key does not correspond to any virtual key.
* `repeat: <boolean>` Is `true` if the event was generated by holding down a key for a long time.
* `shift: <boolean>` Is `true` if the Shift key was pressed when the event was generated.
* `ctrl: <boolean>` Is `true` if the Ctrl key was pressed when the event was generated.
* `alt: <boolean>` Is `true` if the Alt key was pressed when the event was generated.
* `super: <boolean>` Is `true` if the "Windows" key was pressed when the event was generated.
* `altgr: <boolean>` Is `true` if the AltGr key was pressed when the event was generated.
* `capslock: <boolean>` Is `true` if CapsLock was active when the event was generated.
* `numlock: <boolean>` Is `true` if NumLock was active when the event was generated.

Fired when a key is pressed, and will also be fired repeatedly afterwards if the key is held down.

### Event: 'keyUp'

* `scancode: `[`<Scancode>`](#enum-scancode) The scancode of the key that caused the event.
* `key: `[`<Key>`](#virtual-keys)`|<null>` The virtual key that caused the event, or `null` if the physical key does not correspond to any virtual key.
* `shift: <boolean>` Is `true` if the Shift key was pressed when the event was generated.
* `ctrl: <boolean>` Is `true` if the Ctrl key was pressed when the event was generated.
* `alt: <boolean>` Is `true` if the Alt key was pressed when the event was generated.
* `super: <boolean>` Is `true` if the "Windows" key was pressed when the event was generated.
* `altgr: <boolean>` Is `true` if the AltGr key was pressed when the event was generated.
* `capslock: <boolean>` Is `true` if CapsLock was active when the event was generated.
* `numlock: <boolean>` Is `true` if NumLock was active when the event was generated.

Fired when a key is released.

### Event: 'textInput'

* `text: <string>` The unicode representation of the character that was entered.

Fired when the user enters text via the keyboard.

### Event: 'mouseButtonDown'

* `x: <number>` The mouse's x position when the event happened, relative to the window.
* `y: <number>` The mouse's y position when the event happened, relative to the window.
* `touch: <boolean>` Will be `true` if the event was caused by a touch event.
* `button: `[`<sdl.mouse.BUTTON>`](#enum-button) The button that was pressed.

Fired when a mouse button is pressed.

### Event: 'mouseButtonUp'

* `x: <number>` The mouse's x position when the event happened, relative to the window.
* `y: <number>` The mouse's y position when the event happened, relative to the window.
* `touch: <boolean>` Will be `true` if the event was caused by a touch event.
* `button: `[`<sdl.mouse.BUTTON>`](#enum-button) The button that was released.

Fired when a mouse button is released.

### Event: 'mouseMove'

* `x: <number>` The mouse's x position when the event happened, relative to the window.
* `y: <number>` The mouse's y position when the event happened, relative to the window.
* `touch: <boolean>` Will be `true` if the event was caused by a touch event.

Fired when the mouse moves.

### Event: 'mouseWheel'

* `x: <number>` The mouse's x position when the event happened, relative to the window.
* `y: <number>` The mouse's y position when the event happened, relative to the window.
* `touch: <boolean>` Will be `true` if the event was caused by a touch event.
* `dx: <number>` The wheel's x movement, relative to its last position.
* `dy: <number>` The wheel's y movement, relative to its last position.
* `flipped: <boolean>` Will be `true` if the underlying platform reverses the mouse wheel's scroll direction. Multiply `dx` and `dy` by `-1` to get the correct values.

Fired when the mouse wheel is scrolled.

### Event: 'dropBegin'

When dropping a set of items onto a window, first the [`'dropBegin'`](#event-dropbegin) event will be fired, then a number of [`'dropText'`](#event-droptext) and/or [`'dropFile'`](#event-dropfile) events will be fired, corresponding to the contents of the drop, then finally the [`'dropComplete'`](#event-dropcomplete) event will be fired.

### Event: 'dropText'

* `text: <string>`: The text that was dropped onto the window.

Fired when one of the drops is a text item.

### Event: 'dropFile'

* `file: <string>`: The path to the file that was dropped onto the window.

Fired when one of the drops is a file.

### Event: 'dropComplete'

Fired after a set of items has been dropped on a window.

### window.id

* `<number>`

A unique identifier for the window.

### window.title

* `<string>`

The text that appears in the window's title bar.

### window.setTitle(title)

* `title: <string>`: The new title.

Changes the text that appears in the window's title bar.

### window.x

* `<number>`

The window's x position, relative to the screen.

### window.y

* `<number>`

The window's y position, relative to the screen.

### window.setPosition(x, y)

* `x: <number>`: The new x position, relative to the screen.
* `y: <number>`: The new y position, relative to the screen.

Moves the window to a new position on the screen.

### window.width

* `<number>`

The window's width.

### window.height

* `<number>`

The window's height.

### window.pixelWidth

* `<number>`

The window's width in pixels. This will be larger than `width` on [high-dpi](#high-dpi) displays.

### window.pixelHeight

* `<number>`

The window's height in pixels. This will be larger than `height` on [high-dpi](#high-dpi) displays.

### window.setSize(width, height)

* `width: <number>`: The new width.
* `height: <number>`: The new height.

Changes the size of the window.

### window.visible

* `<boolean>`

Will be `true` if the window is visible.

### window.show([show])

* `show: <boolean>` Set to `true` to make the window visible, `false` to hide it. Default: `true`

Shows or hides the window.

### window.hide()

Equivalent to [`window.show(false)`](#windowshowshow).

### window.fullscreen

* `<boolean>`

Will be `true` if the window is fullscreen.
A fullscreen window is displayed over the entire screen.

### window.setFullscreen(fullscreen)

* `fullscreen: <boolean>` The new value of the property.

Changes the window's fullscreen property.

### window.resizable

* `<boolean>`

Will be `true` if the window is resizable.
A resizable window can be resized by dragging it's borders.

### window.setResizable(resizable)

* `resizable: <boolean>` The new value of the property.

Changes the window's resizable property.

### window.borderless

* `<boolean>`

Will be `true` if the window is borderless.
A borderless window has no borders or title bar.

### window.setBorderless(borderless)

* `borderless: <boolean>` The new value of the property.

Changes the window's borderless property.

### window.alwaysOnTop

* `<boolean>`

Will be `true` if the window was created with `alwaysOnTop: true`.
Such a window will always be shown above other windows.

### window.accelerated

* `<boolean>`

Will be `true` if the window is using hardware accelerated rendering.

### window.setAccelerated(accelerated)

* `accelerated: <boolean>` The new value of the property.

Changes the window's accelerated property.

If you have set the `opengl` or `webgpu` options, then calls to this function will fail.

### window.vsync

* `<boolean>`

Will be `true` if the window is using vsync.
A window with vsync enabled will have its frame rate synchronized to the display's refresh rate to prevent tearing.
Note that vsync can only be used if that window is also [`accelerated`](#windowaccelerated)

### window.setVsync(vsync)

* `vsync: <boolean>` The new value of the property.

Changes the window's vsync property.

If you have set the `opengl` or `webgpu` options, then calls to this function will fail.

### window.opengl

* `<boolean>`

Will be `true` if the window was created in OpenGl mode.
In OpenGL mode, you can only render to the window with OpenGL calls.
Calls to [`render()`](#windowrenderwidth-height-stride-format-buffer) will fail.

### window.webgpu

* `<boolean>`

Will be `true` if the window was created in WebGPU mode.
In WebGPU mode, you can only render to the window with WebGPU calls.
Calls to [`render()`](#windowrenderwidth-height-stride-format-buffer) will fail.

### window.native

* `<any>`

Holds a copy of the native (platform-specific) representation of the window.
Only used for passing to [@kmamal/gl](https://github.com/kmamal/headless-gl#readme) or [@kmamal/gpu](https://github.com/kmamal/gpu#readme).

### window.maximized

* `<boolean>`

Will be `true` if the window is maximized.

### window.maximize()

Maximizes the window.

### window.minimized

* `<boolean>`

Will be `true` if the window is minimized.

### window.minimize()

Minimizes the window.

### window.restore()

Restores the window so it's neither minimized nor maximized.

### window.focused

* `<boolean>`

Will be `true` if the window has keyboard input.

### window.focus()

Gives the window the keyboard focus.

### window.hovered

* `<boolean>`

Will be `true` if the mouse is over the window.

### window.skipTaskbar

* `<boolean>`

X11 only.
Will be `true` if the window was created with `skipTaskbar: true`.
Such a window will not be added to the taskbar.

### window.popupMenu

* `<boolean>`

X11 only.
Will be `true` if the window was created with `popupMenu: true`.
Such a window will always be treated as a popup menu.

### window.tooltip

* `<boolean>`

X11 only.
Will be `true` if the window was created with `tooltip: true`.
Such a window will always be treated as a tooltip.

### window.utility

* `<boolean>`

X11 only.
Will be `true` if the window was created with `utility: true`.
Such a window will always be treated as a utility window.

### window.render(width, height, stride, format, buffer)

* `width, height, stride, format, buffer: `[`<Image>`](#image-data) The image to display on the window.

Displays an image in the window.
The provided image will be stretched over the entire window.

If you set the `opengl` or `webgpu` options, then you can only render to the window with OpenGL/WebGPU calls.
Calls to [`render()`](#windowrenderwidth-height-stride-format-buffer) will fail.

### window.setIcon(width, height, stride, format, buffer)

* `width, height, stride, format, buffer: `[`<Image>`](#image-data) The image to display as the icon of the window.

Set's the window's icon, usually displayed in the title bar and the taskbar.

### window.flash(untilFocused)

* `untilFocused: <boolean>` Whether to keep flashing the window until the user focuses it. Default: `false`

Flash the window briefly to get attention.
If `untilFocused` is set, the window will flash until the user focuses it.

### window.stopFlashing()

Stop the window from flashing.

### window.destroyed

* `<boolean>`

Will be `true` if the window is destroyed.
A destroyed window object should not be used any further.

### window.destroy()

Destroys the window.


## sdl.keyboard

There are three levels at which you can deal with the keyboard: physical keys ([scancodes](#enum-scancode)), virtual keys ([keys](#virtual-keys)), and text ([`'textInput'`](#event-textinput) events).

On the physical level, each of the physical keys corresponds to a number: the key's scancode.
For any given keyboard, the same key will always produce the same scancode.
If your application cares about the layout of the keyboard (for example using the "WASD" keys as a substitute for arrow keys), then you should handle key events at this level using the `scancode` property of [`'keyDown'`](#event-keydown) and [`'keyUp'`](#event-keyup) events.

For the most part it's better to treat scancode values as arbitrary/meaningless, but SDL does provide a scancode enumeration with values based on the [USB usage page standard](https://www.usb.org/sites/default/files/documents/hut1_12v2.pdf) so you should be able to derive some meaning from the scancodes if your keyboard is compatible.

More commonly, you don't care about the physical key itself but about the "meaning" associated with each key: the character that it produces ("a", "b", "@", " ", .e.t.c) or the function that it corresponds to ("Esc", "F4", "Ctrl",  e.t.c.).
Your operating system provides a "keyboard mapping" that associates physical keys with their corresponding meaning.
Changing the keyboard mapping (for example by changing the language from English to German) will also change the corresponding meaning for each key (in the English-German example: the "y" and "z" keys will be switched).
These meanings are represented as [virtual key strings](#virtual-keys).
If your application cares about the meaning associated with individual keys then you should handle key events at this level using the `key` property of [`'keyDown'`](#event-keydown) and [`'keyUp'`](#event-keyup) events.

Note that not all physical keys correspond to a well-defined meaning and thus don't have a virtual key value associated with them.
The key events for these keys will have a `null` value for the `key` property.

But sometimes the application doesn't care about individual keys at all, but about the resulting text that the user is entering.
Consider for example what happens when a user on a Greek keyboard layout enters an accent mark "´" followed by the letter "α" to produce the character "ά": Two keys were pressed, but only a single character was produced.
Trying to handle text input by manually translating key presses to text is not a very viable solution.
It's better to let the OS handle all the text logic, and get the final text by handling the rasulting ([`'textInput'`](#event-textinput)) events.


### Enum: SCANCODE

Used to represent physical keys on the keyboard.
The same key will always produce the same scancode.
Values are based on the [USB usage page standard](https://www.usb.org/sites/default/files/documents/hut1_12v2.pdf).

<details>
  <summary>Click to expand table</summary>

  | Value | Corresponding `SDL_Scancode` | Comment |
  | --- | --- | --- |
  | `sdl.keyboard.SCANCODE.UNKNOWN` | `SDL_SCANCODE_UNKNOWN` | value `0` |
  | `sdl.keyboard.SCANCODE.A` | `SDL_SCANCODE_A` | |
  | `sdl.keyboard.SCANCODE.B` | `SDL_SCANCODE_B` | |
  | `sdl.keyboard.SCANCODE.C` | `SDL_SCANCODE_C` | |
  | `sdl.keyboard.SCANCODE.D` | `SDL_SCANCODE_D` | |
  | `sdl.keyboard.SCANCODE.E` | `SDL_SCANCODE_E` | |
  | `sdl.keyboard.SCANCODE.F` | `SDL_SCANCODE_F` | |
  | `sdl.keyboard.SCANCODE.G` | `SDL_SCANCODE_G` | |
  | `sdl.keyboard.SCANCODE.H` | `SDL_SCANCODE_H` | |
  | `sdl.keyboard.SCANCODE.I` | `SDL_SCANCODE_I` | |
  | `sdl.keyboard.SCANCODE.J` | `SDL_SCANCODE_J` | |
  | `sdl.keyboard.SCANCODE.K` | `SDL_SCANCODE_K` | |
  | `sdl.keyboard.SCANCODE.L` | `SDL_SCANCODE_L` | |
  | `sdl.keyboard.SCANCODE.M` | `SDL_SCANCODE_M` | |
  | `sdl.keyboard.SCANCODE.N` | `SDL_SCANCODE_N` | |
  | `sdl.keyboard.SCANCODE.O` | `SDL_SCANCODE_O` | |
  | `sdl.keyboard.SCANCODE.P` | `SDL_SCANCODE_P` | |
  | `sdl.keyboard.SCANCODE.Q` | `SDL_SCANCODE_Q` | |
  | `sdl.keyboard.SCANCODE.R` | `SDL_SCANCODE_R` | |
  | `sdl.keyboard.SCANCODE.S` | `SDL_SCANCODE_S` | |
  | `sdl.keyboard.SCANCODE.T` | `SDL_SCANCODE_T` | |
  | `sdl.keyboard.SCANCODE.U` | `SDL_SCANCODE_U` | |
  | `sdl.keyboard.SCANCODE.V` | `SDL_SCANCODE_V` | |
  | `sdl.keyboard.SCANCODE.W` | `SDL_SCANCODE_W` | |
  | `sdl.keyboard.SCANCODE.X` | `SDL_SCANCODE_X` | |
  | `sdl.keyboard.SCANCODE.Y` | `SDL_SCANCODE_Y` | |
  | `sdl.keyboard.SCANCODE.Z` | `SDL_SCANCODE_Z` | |
  | `sdl.keyboard.SCANCODE.1` | `SDL_SCANCODE_1` | |
  | `sdl.keyboard.SCANCODE.2` | `SDL_SCANCODE_2` | |
  | `sdl.keyboard.SCANCODE.3` | `SDL_SCANCODE_3` | |
  | `sdl.keyboard.SCANCODE.4` | `SDL_SCANCODE_4` | |
  | `sdl.keyboard.SCANCODE.5` | `SDL_SCANCODE_5` | |
  | `sdl.keyboard.SCANCODE.6` | `SDL_SCANCODE_6` | |
  | `sdl.keyboard.SCANCODE.7` | `SDL_SCANCODE_7` | |
  | `sdl.keyboard.SCANCODE.8` | `SDL_SCANCODE_8` | |
  | `sdl.keyboard.SCANCODE.9` | `SDL_SCANCODE_9` | |
  | `sdl.keyboard.SCANCODE.0` | `SDL_SCANCODE_0` | |
  | `sdl.keyboard.SCANCODE.RETURN` | `SDL_SCANCODE_RETURN` | |
  | `sdl.keyboard.SCANCODE.ESCAPE` | `SDL_SCANCODE_ESCAPE` | |
  | `sdl.keyboard.SCANCODE.BACKSPACE` | `SDL_SCANCODE_BACKSPACE` | |
  | `sdl.keyboard.SCANCODE.TAB` | `SDL_SCANCODE_TAB` | |
  | `sdl.keyboard.SCANCODE.SPACE` | `SDL_SCANCODE_SPACE` | |
  | `sdl.keyboard.SCANCODE.MINUS` | `SDL_SCANCODE_MINUS` | |
  | `sdl.keyboard.SCANCODE.EQUALS` | `SDL_SCANCODE_EQUALS` | |
  | `sdl.keyboard.SCANCODE.LEFTBRACKET` | `SDL_SCANCODE_LEFTBRACKET` | |
  | `sdl.keyboard.SCANCODE.RIGHTBRACKET` | `SDL_SCANCODE_RIGHTBRACKET` | |
  | `sdl.keyboard.SCANCODE.BACKSLASH` | `SDL_SCANCODE_BACKSLASH` | Located at the lower left of the return key on ISO keyboards and at the right end of the QWERTY row on ANSI keyboards. Produces REVERSE SOLIDUS (backslash) and VERTICAL LINE in a US layout, REVERSE SOLIDUS and VERTICAL LINE in a UK Mac layout, NUMBER SIGN and TILDE in a UK Windows layout, DOLLAR SIGN and POUND SIGN in a Swiss German layout, NUMBER SIGN and APOSTROPHE in a German layout, GRAVE ACCENT and POUND SIGN in a French Mac layout, and ASTERISK and MICRO SIGN in a French Windows layout. |
  | `sdl.keyboard.SCANCODE.NONUSHASH` | `SDL_SCANCODE_NONUSHASH` | ISO USB keyboards actually use this code instead of 49 for the same key, but all OSes I've seen treat the two codes identically. So, as an implementor, unless your keyboard generates both of those codes and your OS treats them differently, you should generate SDL_SCANCODE_BACKSLASH instead of this code. As a user, you should not rely on this code because SDL will never generate it with most (all?) keyboards. |
  | `sdl.keyboard.SCANCODE.SEMICOLON` | `SDL_SCANCODE_SEMICOLON` | |
  | `sdl.keyboard.SCANCODE.APOSTROPHE` | `SDL_SCANCODE_APOSTROPHE` | |
  | `sdl.keyboard.SCANCODE.GRAVE` | `SDL_SCANCODE_GRAVE` | Located in the top left corner (on both ANSI and ISO keyboards). Produces GRAVE ACCENT and TILDE in a US Windows layout and in US and UK Mac layouts on ANSI keyboards, GRAVE ACCENT and NOT SIGN in a UK Windows layout, SECTION SIGN and PLUS-MINUS SIGN in US and UK Mac layouts on ISO keyboards, SECTION SIGN and DEGREE SIGN in a Swiss German layout (Mac: only on ISO keyboards), CIRCUMFLEX ACCENT and DEGREE SIGN in a German layout (Mac: only on ISO keyboards), SUPERSCRIPT TWO and TILDE in a French Windows layout, COMMERCIAL AT and NUMBER SIGN in a French Mac layout on ISO keyboards, and LESS-THAN SIGN and GREATER-THAN SIGN in a Swiss German, German, or French Mac layout on ANSI keyboards. |
  | `sdl.keyboard.SCANCODE.COMMA` | `SDL_SCANCODE_COMMA` | |
  | `sdl.keyboard.SCANCODE.PERIOD` | `SDL_SCANCODE_PERIOD` | |
  | `sdl.keyboard.SCANCODE.SLASH` | `SDL_SCANCODE_SLASH` | |
  | `sdl.keyboard.SCANCODE.CAPSLOCK` | `SDL_SCANCODE_CAPSLOCK` | |
  | `sdl.keyboard.SCANCODE.F1` | `SDL_SCANCODE_F1` | |
  | `sdl.keyboard.SCANCODE.F2` | `SDL_SCANCODE_F2` | |
  | `sdl.keyboard.SCANCODE.F3` | `SDL_SCANCODE_F3` | |
  | `sdl.keyboard.SCANCODE.F4` | `SDL_SCANCODE_F4` | |
  | `sdl.keyboard.SCANCODE.F5` | `SDL_SCANCODE_F5` | |
  | `sdl.keyboard.SCANCODE.F6` | `SDL_SCANCODE_F6` | |
  | `sdl.keyboard.SCANCODE.F7` | `SDL_SCANCODE_F7` | |
  | `sdl.keyboard.SCANCODE.F8` | `SDL_SCANCODE_F8` | |
  | `sdl.keyboard.SCANCODE.F9` | `SDL_SCANCODE_F9` | |
  | `sdl.keyboard.SCANCODE.F10` | `SDL_SCANCODE_F10` | |
  | `sdl.keyboard.SCANCODE.F11` | `SDL_SCANCODE_F11` | |
  | `sdl.keyboard.SCANCODE.F12` | `SDL_SCANCODE_F12` | |
  | `sdl.keyboard.SCANCODE.PRINTSCREEN` | `SDL_SCANCODE_PRINTSCREEN` | |
  | `sdl.keyboard.SCANCODE.SCROLLLOCK` | `SDL_SCANCODE_SCROLLLOCK` | |
  | `sdl.keyboard.SCANCODE.PAUSE` | `SDL_SCANCODE_PAUSE` | |
  | `sdl.keyboard.SCANCODE.INSERT` | `SDL_SCANCODE_INSERT` | insert on PC, help on some Mac keyboards |
  | `sdl.keyboard.SCANCODE.HOME` | `SDL_SCANCODE_HOME` | |
  | `sdl.keyboard.SCANCODE.PAGEUP` | `SDL_SCANCODE_PAGEUP` | |
  | `sdl.keyboard.SCANCODE.DELETE` | `SDL_SCANCODE_DELETE` | |
  | `sdl.keyboard.SCANCODE.END` | `SDL_SCANCODE_END` | |
  | `sdl.keyboard.SCANCODE.PAGEDOWN` | `SDL_SCANCODE_PAGEDOWN` | |
  | `sdl.keyboard.SCANCODE.RIGHT` | `SDL_SCANCODE_RIGHT` | |
  | `sdl.keyboard.SCANCODE.LEFT` | `SDL_SCANCODE_LEFT` | |
  | `sdl.keyboard.SCANCODE.DOWN` | `SDL_SCANCODE_DOWN` | |
  | `sdl.keyboard.SCANCODE.UP` | `SDL_SCANCODE_UP` | |
  | `sdl.keyboard.SCANCODE.NUMLOCKCLEAR` | `SDL_SCANCODE_NUMLOCKCLEAR` | num lock on PC, clear on Mac keyboards |
  | `sdl.keyboard.SCANCODE.KP_DIVIDE` | `SDL_SCANCODE_KP_DIVIDE` | |
  | `sdl.keyboard.SCANCODE.KP_MULTIPLY` | `SDL_SCANCODE_KP_MULTIPLY` | |
  | `sdl.keyboard.SCANCODE.KP_MINUS` | `SDL_SCANCODE_KP_MINUS` | |
  | `sdl.keyboard.SCANCODE.KP_PLUS` | `SDL_SCANCODE_KP_PLUS` | |
  | `sdl.keyboard.SCANCODE.KP_ENTER` | `SDL_SCANCODE_KP_ENTER` | |
  | `sdl.keyboard.SCANCODE.KP_1` | `SDL_SCANCODE_KP_1` | |
  | `sdl.keyboard.SCANCODE.KP_2` | `SDL_SCANCODE_KP_2` | |
  | `sdl.keyboard.SCANCODE.KP_3` | `SDL_SCANCODE_KP_3` | |
  | `sdl.keyboard.SCANCODE.KP_4` | `SDL_SCANCODE_KP_4` | |
  | `sdl.keyboard.SCANCODE.KP_5` | `SDL_SCANCODE_KP_5` | |
  | `sdl.keyboard.SCANCODE.KP_6` | `SDL_SCANCODE_KP_6` | |
  | `sdl.keyboard.SCANCODE.KP_7` | `SDL_SCANCODE_KP_7` | |
  | `sdl.keyboard.SCANCODE.KP_8` | `SDL_SCANCODE_KP_8` | |
  | `sdl.keyboard.SCANCODE.KP_9` | `SDL_SCANCODE_KP_9` | |
  | `sdl.keyboard.SCANCODE.KP_0` | `SDL_SCANCODE_KP_0` | |
  | `sdl.keyboard.SCANCODE.KP_PERIOD` | `SDL_SCANCODE_KP_PERIOD` | |
  | `sdl.keyboard.SCANCODE.NONUSBACKSLASH` | `SDL_SCANCODE_NONUSBACKSLASH` | This is the additional key that ISO keyboards have over ANSI ones, located between left shift and Y. Produces GRAVE ACCENT and TILDE in a US or UK Mac layout, REVERSE SOLIDUS (backslash) and VERTICAL LINE in a US or UK Windows layout, and LESS-THAN SIGN and GREATER-THAN SIGN in a Swiss German, German, or French layout. |
  | `sdl.keyboard.SCANCODE.APPLICATION` | `SDL_SCANCODE_APPLICATION` | windows contextual menu, compose |
  | `sdl.keyboard.SCANCODE.POWER` | `SDL_SCANCODE_POWER` | The USB document says this is a status flag, not a physical key - but some Mac keyboards do have a power key. |
  | `sdl.keyboard.SCANCODE.KP_EQUALS` | `SDL_SCANCODE_KP_EQUALS` | |
  | `sdl.keyboard.SCANCODE.F13` | `SDL_SCANCODE_F13` | |
  | `sdl.keyboard.SCANCODE.F14` | `SDL_SCANCODE_F14` | |
  | `sdl.keyboard.SCANCODE.F15` | `SDL_SCANCODE_F15` | |
  | `sdl.keyboard.SCANCODE.F16` | `SDL_SCANCODE_F16` | |
  | `sdl.keyboard.SCANCODE.F17` | `SDL_SCANCODE_F17` | |
  | `sdl.keyboard.SCANCODE.F18` | `SDL_SCANCODE_F18` | |
  | `sdl.keyboard.SCANCODE.F19` | `SDL_SCANCODE_F19` | |
  | `sdl.keyboard.SCANCODE.F20` | `SDL_SCANCODE_F20` | |
  | `sdl.keyboard.SCANCODE.F21` | `SDL_SCANCODE_F21` | |
  | `sdl.keyboard.SCANCODE.F22` | `SDL_SCANCODE_F22` | |
  | `sdl.keyboard.SCANCODE.F23` | `SDL_SCANCODE_F23` | |
  | `sdl.keyboard.SCANCODE.F24` | `SDL_SCANCODE_F24` | |
  | `sdl.keyboard.SCANCODE.EXECUTE` | `SDL_SCANCODE_EXECUTE` | |
  | `sdl.keyboard.SCANCODE.HELP` | `SDL_SCANCODE_HELP` | |
  | `sdl.keyboard.SCANCODE.MENU` | `SDL_SCANCODE_MENU` | |
  | `sdl.keyboard.SCANCODE.SELECT` | `SDL_SCANCODE_SELECT` | |
  | `sdl.keyboard.SCANCODE.STOP` | `SDL_SCANCODE_STOP` | |
  | `sdl.keyboard.SCANCODE.AGAIN` | `SDL_SCANCODE_AGAIN` | redo |
  | `sdl.keyboard.SCANCODE.UNDO` | `SDL_SCANCODE_UNDO` | |
  | `sdl.keyboard.SCANCODE.CUT` | `SDL_SCANCODE_CUT` | |
  | `sdl.keyboard.SCANCODE.COPY` | `SDL_SCANCODE_COPY` | |
  | `sdl.keyboard.SCANCODE.PASTE` | `SDL_SCANCODE_PASTE` | |
  | `sdl.keyboard.SCANCODE.FIND` | `SDL_SCANCODE_FIND` | |
  | `sdl.keyboard.SCANCODE.MUTE` | `SDL_SCANCODE_MUTE` | |
  | `sdl.keyboard.SCANCODE.VOLUMEUP` | `SDL_SCANCODE_VOLUMEUP` | |
  | `sdl.keyboard.SCANCODE.VOLUMEDOWN` | `SDL_SCANCODE_VOLUMEDOWN` | |
  | `sdl.keyboard.SCANCODE.KP_COMMA` | `SDL_SCANCODE_KP_COMMA` | |
  | `sdl.keyboard.SCANCODE.KP_EQUALSAS400` | `SDL_SCANCODE_KP_EQUALSAS400` | |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL1` | `SDL_SCANCODE_INTERNATIONAL1` | used on Asian keyboards, see footnotes in USB doc |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL2` | `SDL_SCANCODE_INTERNATIONAL2` | |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL3` | `SDL_SCANCODE_INTERNATIONAL3` | Yen |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL4` | `SDL_SCANCODE_INTERNATIONAL4` | |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL5` | `SDL_SCANCODE_INTERNATIONAL5` | |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL6` | `SDL_SCANCODE_INTERNATIONAL6` | |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL7` | `SDL_SCANCODE_INTERNATIONAL7` | |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL8` | `SDL_SCANCODE_INTERNATIONAL8` | |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL9` | `SDL_SCANCODE_INTERNATIONAL9` | |
  | `sdl.keyboard.SCANCODE.LANG1` | `SDL_SCANCODE_LANG1` | Hangul/English toggle |
  | `sdl.keyboard.SCANCODE.LANG2` | `SDL_SCANCODE_LANG2` | Hanja conversion |
  | `sdl.keyboard.SCANCODE.LANG3` | `SDL_SCANCODE_LANG3` | Katakana |
  | `sdl.keyboard.SCANCODE.LANG4` | `SDL_SCANCODE_LANG4` | Hiragana |
  | `sdl.keyboard.SCANCODE.LANG5` | `SDL_SCANCODE_LANG5` | Zenkaku/Hankaku |
  | `sdl.keyboard.SCANCODE.LANG6` | `SDL_SCANCODE_LANG6` | |
  | `sdl.keyboard.SCANCODE.LANG7` | `SDL_SCANCODE_LANG7` | |
  | `sdl.keyboard.SCANCODE.LANG8` | `SDL_SCANCODE_LANG8` | |
  | `sdl.keyboard.SCANCODE.LANG9` | `SDL_SCANCODE_LANG9` | |
  | `sdl.keyboard.SCANCODE.ALTERASE` | `SDL_SCANCODE_ALTERASE` | Erase-Eaze |
  | `sdl.keyboard.SCANCODE.SYSREQ` | `SDL_SCANCODE_SYSREQ` | |
  | `sdl.keyboard.SCANCODE.CANCEL` | `SDL_SCANCODE_CANCEL` | |
  | `sdl.keyboard.SCANCODE.CLEAR` | `SDL_SCANCODE_CLEAR` | |
  | `sdl.keyboard.SCANCODE.PRIOR` | `SDL_SCANCODE_PRIOR` | |
  | `sdl.keyboard.SCANCODE.RETURN2` | `SDL_SCANCODE_RETURN2` | |
  | `sdl.keyboard.SCANCODE.SEPARATOR` | `SDL_SCANCODE_SEPARATOR` | |
  | `sdl.keyboard.SCANCODE.OUT` | `SDL_SCANCODE_OUT` | |
  | `sdl.keyboard.SCANCODE.OPER` | `SDL_SCANCODE_OPER` | |
  | `sdl.keyboard.SCANCODE.CLEARAGAIN` | `SDL_SCANCODE_CLEARAGAIN` | |
  | `sdl.keyboard.SCANCODE.CRSEL` | `SDL_SCANCODE_CRSEL` | |
  | `sdl.keyboard.SCANCODE.EXSEL` | `SDL_SCANCODE_EXSEL` | |
  | `sdl.keyboard.SCANCODE.KP_00` | `SDL_SCANCODE_KP_00` | |
  | `sdl.keyboard.SCANCODE.KP_000` | `SDL_SCANCODE_KP_000` | |
  | `sdl.keyboard.SCANCODE.THOUSANDSSEPARATOR` | `SDL_SCANCODE_THOUSANDSSEPARATOR` | |
  | `sdl.keyboard.SCANCODE.DECIMALSEPARATOR` | `SDL_SCANCODE_DECIMALSEPARATOR` | |
  | `sdl.keyboard.SCANCODE.CURRENCYUNIT` | `SDL_SCANCODE_CURRENCYUNIT` | |
  | `sdl.keyboard.SCANCODE.CURRENCYSUBUNIT` | `SDL_SCANCODE_CURRENCYSUBUNIT` | |
  | `sdl.keyboard.SCANCODE.KP_LEFTPAREN` | `SDL_SCANCODE_KP_LEFTPAREN` | |
  | `sdl.keyboard.SCANCODE.KP_RIGHTPAREN` | `SDL_SCANCODE_KP_RIGHTPAREN` | |
  | `sdl.keyboard.SCANCODE.KP_LEFTBRACE` | `SDL_SCANCODE_KP_LEFTBRACE` | |
  | `sdl.keyboard.SCANCODE.KP_RIGHTBRACE` | `SDL_SCANCODE_KP_RIGHTBRACE` | |
  | `sdl.keyboard.SCANCODE.KP_TAB` | `SDL_SCANCODE_KP_TAB` | |
  | `sdl.keyboard.SCANCODE.KP_BACKSPACE` | `SDL_SCANCODE_KP_BACKSPACE` | |
  | `sdl.keyboard.SCANCODE.KP_A` | `SDL_SCANCODE_KP_A` | |
  | `sdl.keyboard.SCANCODE.KP_B` | `SDL_SCANCODE_KP_B` | |
  | `sdl.keyboard.SCANCODE.KP_C` | `SDL_SCANCODE_KP_C` | |
  | `sdl.keyboard.SCANCODE.KP_D` | `SDL_SCANCODE_KP_D` | |
  | `sdl.keyboard.SCANCODE.KP_E` | `SDL_SCANCODE_KP_E` | |
  | `sdl.keyboard.SCANCODE.KP_F` | `SDL_SCANCODE_KP_F` | |
  | `sdl.keyboard.SCANCODE.KP_XOR` | `SDL_SCANCODE_KP_XOR` | |
  | `sdl.keyboard.SCANCODE.KP_POWER` | `SDL_SCANCODE_KP_POWER` | |
  | `sdl.keyboard.SCANCODE.KP_PERCENT` | `SDL_SCANCODE_KP_PERCENT` | |
  | `sdl.keyboard.SCANCODE.KP_LESS` | `SDL_SCANCODE_KP_LESS` | |
  | `sdl.keyboard.SCANCODE.KP_GREATER` | `SDL_SCANCODE_KP_GREATER` | |
  | `sdl.keyboard.SCANCODE.KP_AMPERSAND` | `SDL_SCANCODE_KP_AMPERSAND` | |
  | `sdl.keyboard.SCANCODE.KP_DBLAMPERSAND` | `SDL_SCANCODE_KP_DBLAMPERSAND` | |
  | `sdl.keyboard.SCANCODE.KP_VERTICALBAR` | `SDL_SCANCODE_KP_VERTICALBAR` | |
  | `sdl.keyboard.SCANCODE.KP_DBLVERTICALBAR` | `SDL_SCANCODE_KP_DBLVERTICALBAR` | |
  | `sdl.keyboard.SCANCODE.KP_COLON` | `SDL_SCANCODE_KP_COLON` | |
  | `sdl.keyboard.SCANCODE.KP_HASH` | `SDL_SCANCODE_KP_HASH` | |
  | `sdl.keyboard.SCANCODE.KP_SPACE` | `SDL_SCANCODE_KP_SPACE` | |
  | `sdl.keyboard.SCANCODE.KP_AT` | `SDL_SCANCODE_KP_AT` | |
  | `sdl.keyboard.SCANCODE.KP_EXCLAM` | `SDL_SCANCODE_KP_EXCLAM` | |
  | `sdl.keyboard.SCANCODE.KP_MEMSTORE` | `SDL_SCANCODE_KP_MEMSTORE` | |
  | `sdl.keyboard.SCANCODE.KP_MEMRECALL` | `SDL_SCANCODE_KP_MEMRECALL` | |
  | `sdl.keyboard.SCANCODE.KP_MEMCLEAR` | `SDL_SCANCODE_KP_MEMCLEAR` | |
  | `sdl.keyboard.SCANCODE.KP_MEMADD` | `SDL_SCANCODE_KP_MEMADD` | |
  | `sdl.keyboard.SCANCODE.KP_MEMSUBTRACT` | `SDL_SCANCODE_KP_MEMSUBTRACT` | |
  | `sdl.keyboard.SCANCODE.KP_MEMMULTIPLY` | `SDL_SCANCODE_KP_MEMMULTIPLY` | |
  | `sdl.keyboard.SCANCODE.KP_MEMDIVIDE` | `SDL_SCANCODE_KP_MEMDIVIDE` | |
  | `sdl.keyboard.SCANCODE.KP_PLUSMINUS` | `SDL_SCANCODE_KP_PLUSMINUS` | |
  | `sdl.keyboard.SCANCODE.KP_CLEAR` | `SDL_SCANCODE_KP_CLEAR` | |
  | `sdl.keyboard.SCANCODE.KP_CLEARENTRY` | `SDL_SCANCODE_KP_CLEARENTRY` | |
  | `sdl.keyboard.SCANCODE.KP_BINARY` | `SDL_SCANCODE_KP_BINARY` | |
  | `sdl.keyboard.SCANCODE.KP_OCTAL` | `SDL_SCANCODE_KP_OCTAL` | |
  | `sdl.keyboard.SCANCODE.KP_DECIMAL` | `SDL_SCANCODE_KP_DECIMAL` | |
  | `sdl.keyboard.SCANCODE.KP_HEXADECIMAL` | `SDL_SCANCODE_KP_HEXADECIMAL` | |
  | `sdl.keyboard.SCANCODE.LCTRL` | `SDL_SCANCODE_LCTRL` | |
  | `sdl.keyboard.SCANCODE.LSHIFT` | `SDL_SCANCODE_LSHIFT` | |
  | `sdl.keyboard.SCANCODE.LALT` | `SDL_SCANCODE_LALT` | alt, option |
  | `sdl.keyboard.SCANCODE.LGUI` | `SDL_SCANCODE_LGUI` | windows, command (apple), meta |
  | `sdl.keyboard.SCANCODE.RCTRL` | `SDL_SCANCODE_RCTRL` | |
  | `sdl.keyboard.SCANCODE.RSHIFT` | `SDL_SCANCODE_RSHIFT` | |
  | `sdl.keyboard.SCANCODE.RALT` | `SDL_SCANCODE_RALT` | alt gr, option |
  | `sdl.keyboard.SCANCODE.RGUI` | `SDL_SCANCODE_RGUI` | windows, command (apple), meta |
  | `sdl.keyboard.SCANCODE.MODE` | `SDL_SCANCODE_MODE` | |
  | `sdl.keyboard.SCANCODE.AUDIONEXT` | `SDL_SCANCODE_AUDIONEXT` | |
  | `sdl.keyboard.SCANCODE.AUDIOPREV` | `SDL_SCANCODE_AUDIOPREV` | |
  | `sdl.keyboard.SCANCODE.AUDIOSTOP` | `SDL_SCANCODE_AUDIOSTOP` | |
  | `sdl.keyboard.SCANCODE.AUDIOPLAY` | `SDL_SCANCODE_AUDIOPLAY` | |
  | `sdl.keyboard.SCANCODE.AUDIOMUTE` | `SDL_SCANCODE_AUDIOMUTE` | |
  | `sdl.keyboard.SCANCODE.MEDIASELECT` | `SDL_SCANCODE_MEDIASELECT` | |
  | `sdl.keyboard.SCANCODE.WWW` | `SDL_SCANCODE_WWW` | |
  | `sdl.keyboard.SCANCODE.MAIL` | `SDL_SCANCODE_MAIL` | |
  | `sdl.keyboard.SCANCODE.CALCULATOR` | `SDL_SCANCODE_CALCULATOR` | |
  | `sdl.keyboard.SCANCODE.COMPUTER` | `SDL_SCANCODE_COMPUTER` | |
  | `sdl.keyboard.SCANCODE.AC_SEARCH` | `SDL_SCANCODE_AC_SEARCH` | |
  | `sdl.keyboard.SCANCODE.AC_HOME` | `SDL_SCANCODE_AC_HOME` | |
  | `sdl.keyboard.SCANCODE.AC_BACK` | `SDL_SCANCODE_AC_BACK` | |
  | `sdl.keyboard.SCANCODE.AC_FORWARD` | `SDL_SCANCODE_AC_FORWARD` | |
  | `sdl.keyboard.SCANCODE.AC_STOP` | `SDL_SCANCODE_AC_STOP` | |
  | `sdl.keyboard.SCANCODE.AC_REFRESH` | `SDL_SCANCODE_AC_REFRESH` | |
  | `sdl.keyboard.SCANCODE.AC_BOOKMARKS` | `SDL_SCANCODE_AC_BOOKMARKS` | |
  | `sdl.keyboard.SCANCODE.BRIGHTNESSDOWN` | `SDL_SCANCODE_BRIGHTNESSDOWN` | |
  | `sdl.keyboard.SCANCODE.BRIGHTNESSUP` | `SDL_SCANCODE_BRIGHTNESSUP` | |
  | `sdl.keyboard.SCANCODE.DISPLAYSWITCH` | `SDL_SCANCODE_DISPLAYSWITCH` | display mirroring/dual display switch, video mode switch |
  | `sdl.keyboard.SCANCODE.KBDILLUMTOGGLE` | `SDL_SCANCODE_KBDILLUMTOGGLE` | |
  | `sdl.keyboard.SCANCODE.KBDILLUMDOWN` | `SDL_SCANCODE_KBDILLUMDOWN` | |
  | `sdl.keyboard.SCANCODE.KBDILLUMUP` | `SDL_SCANCODE_KBDILLUMUP` | |
  | `sdl.keyboard.SCANCODE.EJECT` | `SDL_SCANCODE_EJECT` | |
  | `sdl.keyboard.SCANCODE.SLEEP` | `SDL_SCANCODE_SLEEP` | |
  | `sdl.keyboard.SCANCODE.APP1` | `SDL_SCANCODE_APP1` | |
  | `sdl.keyboard.SCANCODE.APP2` | `SDL_SCANCODE_APP2` | |
  | `sdl.keyboard.SCANCODE.AUDIOREWIND` | `SDL_SCANCODE_AUDIOREWIND` | |
  | `sdl.keyboard.SCANCODE.AUDIOFASTFORWARD` | `SDL_SCANCODE_AUDIOFASTFORWARD` | |
</details>

### Virtual keys

String values used to represent virtual keys in the context of the current keyboard mapping.
Note that some keys do not correspond to any virtual key.
A Key can be either one of the values below __or__ any unicode character.
Keys that produce characters are represented by that character.
All others are represented by one of these values:

`'&&'`, `'+/-'`, `'||'`, `'00'`, `'000'`, `'again'`, `'alt'`, `'altErase'`, `'app1'`, `'app2'`, `'application'`, `'audioFastForward'`, `'audioMute'`, `'audioNext'`, `'audioPlay'`, `'audioPrev'`, `'audioRewind'`, `'audioStop'`, `'back'`, `'backspace'`, `'binary'`, `'bookmarks'`, `'brightnessDown'`, `'brightnessUp'`, `'calculator'`, `'cancel'`, `'capsLock'`, `'clear'`, `'clearEntry'`, `'computer'`, `'copy'`, `'crSel'`, `'ctrl'`, `'currencySubUnit'`, `'currencyUnit'`, `'cut'`, `'decimal'`, `'decimalSeparator'`, `'delete'`, `'displaySwitch'`, `'down'`, `'eject'`, `'end'`, `'enter'`, `'escape'`, `'execute'`, `'exSel'`, `'f1'`, `'f2'`, `'f3'`, `'f4'`, `'f5'`, `'f6'`, `'f7'`, `'f8'`, `'f9'`, `'f10'`, `'f11'`, `'f12'`, `'f13'`, `'f14'`, `'f15'`, `'f16'`, `'f17'`, `'f18'`, `'f19'`, `'f20'`, `'f21'`, `'f22'`, `'f23'`, `'f24'`, `'find'`, `'forward'`, `'gui'`, `'help'`, `'hexadecimal'`, `'home'`, `'illumDown'`, `'illumToggle'`, `'illumUp'`, `'insert'`, `'left'`, `'mail'`, `'mediaSelect'`, `'memAdd'`, `'memClear'`, `'memDivide'`, `'memMultiply'`, `'memRecall'`, `'memStore'`, `'memSubtract'`, `'menu'`, `'modeSwitch'`, `'mute'`, `'numlock'`, `'octal'`, `'oper'`, `'out'`, `'pageDown'`, `'pageUp'`, `'paste'`, `'pause'`, `'power'`, `'printScreen'`, `'prior'`, `'refresh'`, `'return'`, `'right'`, `'scrollLock'`, `'search'`, `'select'`, `'separator'`, `'shift'`, `'sleep'`, `'space'`, `'stop'`, `'sysReq'`, `'tab'`, `'thousandsSeparator'`, `'undo'`, `'up'`, `'volumeDown'`, `'volumeUp'`, `'www'`, `'xor'`.

### sdl.keyboard.getKey(scancode)

* `scancode: `[`<Scancode>`](#enum-scancode)
* Returns: [`<Key>`](#virtual-keys)`|<null>`

Maps a scancode to the corresponding key based on the current keyboard mapping.

### sdl.keyboard.getScancode(key)

* `key: `[`<Key>`](#virtual-keys)
* Returns: [`<Scancode>`](#enum-scancode)

Maps a key to the corresponding scancode based on the current keyboard mapping.
If multiple physical keys produce the same virtual key, then only the first one will be returned.

### sdl.keyboard.getState()

* Returns: `<boolean[]>` an object representing the state of each key.

The returned array can be indexed with [`Scancode`](#enum-scancode) values.
The values will be `true` for keys that are pressed and `false` otherwise.


## sdl.mouse

### Mouse cursors

String values used to represent the types of cursors available on most systems.

| Value | Corresponding `SDL_SystemCursor` | Description |
| --- | --- | --- |
| `'arrow'` | `SDL_SYSTEM_CURSOR_ARROW` | arrow |
| `'ibeam'` | `SDL_SYSTEM_CURSOR_IBEAM` | i-beam |
| `'wait'` | `SDL_SYSTEM_CURSOR_WAIT` | wait |
| `'crosshair'` | `SDL_SYSTEM_CURSOR_CROSSHAIR` | crosshair |
| `'waitarrow'` | `SDL_SYSTEM_CURSOR_WAITARROW` | small wait cursor (or wait if not available) |
| `'sizenwse'` | `SDL_SYSTEM_CURSOR_SIZENWSE` | double arrow pointing northwest and southeast |
| `'sizenesw'` | `SDL_SYSTEM_CURSOR_SIZENESW` | double arrow pointing northeast and southwest |
| `'sizewe'` | `SDL_SYSTEM_CURSOR_SIZEWE` | double arrow pointing west and east |
| `'sizens'` | `SDL_SYSTEM_CURSOR_SIZENS` | double arrow pointing north and south |
| `'sizeall'` | `SDL_SYSTEM_CURSOR_SIZEALL` | four pointed arrow pointing north, south, east, and west |
| `'no'` | `SDL_SYSTEM_CURSOR_NO` | slashed circle or crossbones |
| `'hand'` | `SDL_SYSTEM_CURSOR_HAND` | hand |

### Enum: BUTTON

Used to represent the buttons on a mouse.
A mouse can have many buttons, but the values for the three most common ones are represented in this enum.

| Value | Corresponding `SDL_BUTTON_*` |
| --- | --- |
| `sdl.mouse.BUTTON.LEFT` | `SDL_BUTTON_LEFT` |
| `sdl.mouse.BUTTON.MIDDLE` | `SDL_BUTTON_MIDDLE` |
| `sdl.mouse.BUTTON.RIGHT` | `SDL_BUTTON_RIGHT` |

### sdl.mouse.getButton(button)

* `button: <number>` The index of the button.
* Returns: `<boolean>` Will be `true` if the button is pressed.

Queries the state of a single mouse button.

### sdl.mouse.position

* `<object>`
  * `x: <number>` The x position of the mouse, relative to the screen.
  * `y: <number>` The y position of the mouse, relative to the screen.

The position of the mouse on the screen.

### sdl.mouse.setPosition(x, y)

* `x: <number>` The new x position of the mouse, relative to the screen.
* `y: <number>` The new y position of the mouse, relative to the screen.

Moves the mouse to the specified position.

### sdl.mouse.setCursor(cursor)

* `cursor: `[`<MouseCursor>`](#mouse-cursors) The icon to use for the cursor.

Changes the icon that is displayed for the mouse cursor.

### sdl.mouse.setCursorImage(width, height, stride, format, buffer, x, y)

* `width, height, stride, format, buffer: `[`<Image>`](#image-data) The image to use as a cursor.
* `x: <number>` The x position of the cursor image's hotspot.
* `y: <number>` The y position of the cursor image's hotspot.

Sets a image to be the mouse cursor.
The hotspot represents the pixel that is considered to be under the mouse.

### sdl.mouse.showCursor([show])

* `show: <boolean>` If `true` then the mouse cursor will be visible. Default: `true`

Changes the visibility of the mouse cursor.

### sdl.mouse.hideCursor()

Equivalent to [`sdl.mouse.showCursor(false)`](#sdlmouseshowcursorshow).

### sdl.mouse.capture([capture])

* `capture: <boolean>` If `true` the mouse will be captured by the current window. Default: `true`

When the mouse has been captured you will continue receiving mouse events even if the mouse is not over a window.

### sdl.mouse.uncapture()

Equivalent to [`sdl.mouse.capture(false)`](#sdlmousecapturecapture).


## sdl.joystick

### Joystick types

String values used to represent the type of a joystick device.

| Value | Corresponding `SDL_JoystickType` |
| --- | --- |
| `'unknown'` | `SDL_JOYSTICK_TYPE_UNKNOWN` |
| `'gamecontroller'` | `SDL_JOYSTICK_TYPE_GAMECONTROLLER` |
| `'wheel'` | `SDL_JOYSTICK_TYPE_WHEEL` |
| `'arcadestick'` | `SDL_JOYSTICK_TYPE_ARCADE_STICK` |
| `'flightstick'` | `SDL_JOYSTICK_TYPE_FLIGHT_STICK` |
| `'dancepad'` | `SDL_JOYSTICK_TYPE_DANCE_PAD` |
| `'guitar'` | `SDL_JOYSTICK_TYPE_GUITAR` |
| `'drumkit'` | `SDL_JOYSTICK_TYPE_DRUM_KIT` |
| `'arcadepad'` | `SDL_JOYSTICK_TYPE_ARCADE_PAD` |
| `'throttle'` | `SDL_JOYSTICK_TYPE_THROTTLE` |

### Hat positions

String values used to represent the positions of a joystick hat

| Value | Corresponding SDL enum |
| --- | --- |
| `'centered'` | `SDL_HAT_CENTERED` |
| `'up'` | `SDL_HAT_UP` |
| `'right'` | `SDL_HAT_RIGHT` |
| `'down'` | `SDL_HAT_DOWN` |
| `'left'` | `SDL_HAT_LEFT` |
| `'rightup'` | `SDL_HAT_RIGHTUP` |
| `'rightdown'` | `SDL_HAT_RIGHTDOWN` |
| `'leftup'` | `SDL_HAT_LEFTUP` |
| `'leftdown'` | `SDL_HAT_LEFTDOWN` |

### Power levels

String values used to represent the power level of a joystick device.

| Value | Corresponding `SDL_JoystickPowerLevel` |
| --- | --- |
| `'unknown'` | `SDL_JOYSTICK_POWER_UNKNOWN` |
| `'empty'` | `SDL_JOYSTICK_POWER_EMPTY` |
| `'low'` | `SDL_JOYSTICK_POWER_LOW` |
| `'medium'` | `SDL_JOYSTICK_POWER_MEDIUM` |
| `'full'` | `SDL_JOYSTICK_POWER_FULL` |
| `'wired'` | `SDL_JOYSTICK_POWER_WIRED` |
| `'max'` | `SDL_JOYSTICK_POWER_MAX` |

<a id="joystick-event-deviceadd"></a>

### Event: 'deviceAdd'

* `device: <object>`: An object from [`sdl.joystick.devices`](#sdljoystickdevices) indicating the device that caused the event.

Fired when a new joystick device becomes available.
Check [`sdl.joystick.devices`](#sdljoystickdevices) to get the new list of joystick devices.

<a id="joystick-event-deviceremove"></a>

### Event: 'deviceRemove'

* `device: <object>`: An object from [`sdl.joystick.devices`](#sdljoystickdevices) indicating the device that caused the event.

Fired when an existing joystick device is removed.
Check [`sdl.joystick.devices`](#sdljoystickdevices) to get the new list of joystick devices.
When this event is emitted, all instances that were opened from the removed device are closed automatically.

### sdl.joystick.devices

* `<object>[]`
  * `id: <number>` The unique id for the device.
  * `type:`[`<JoystickType>`](#joystick-types) The type of the device.
  * `name: <string>` The name of the device.
  * `path: <string>` The implementation dependent path of the device.
  * `guid: <string>` The GUID of the device.
  * `vendor: <number>` The USB vendor ID of the device.
  * `product: <number>` The USB product ID of the device.
  * `version: <number>` The USB product version of the device.
  * `player: <number>` The player index for the device.

A list of all the detected joystick devices.
Sample output:

```js
[
  {
    id: 0,
    type: 'gamecontroller',
    name: 'DragonRise Inc. Generic USB Joystick',
    path: '/dev/input/event21',
    guid: '03000000790000000600000010010000',
    vendor: 121,
    product: 6,
    version: 272,
    player: 0,
  },
]
```

### sdl.joystick.openDevice(device)

* `device: <object>` An object from [`sdl.joystick.devices`](#sdljoystickdevices) that should be opened.
* Returns: [`<joystickInstance>`](#class-joystickinstance) an object representing the opened joystick device instance.

Initializes a joystick device and returns a corresponding instance.

## class JoystickInstance

This class is not directly exposed by the API so you can't use it with the `new` operator.
Instead, objects returned by [`sdl.joystick.openDevice()`](#sdljoystickopendevicedevice) are of this type.

<a id="joystick-instance-event-axismotion"></a>

### Event: 'axisMotion'

* `axis: <number>` The index of the axis that moved.
* `value: <number>` The new axis position.

Fired when one of the joystick's axes moves.

### Event: 'ballMotion'

* `ball: <number>` The index of the ball that moved.
* `x: <number>` The new x-position of the ball.
* `y: <number>` The new y-position of the ball.

Fired when one of the joystick's balls moves.

<a id="joystick-instance-event-buttondown"></a>

### Event: 'buttonDown'

* `button: <number>` The index of the button that was pressed.

Fired when one of the joystick's buttons is pressed.

<a id="joystick-instance-event-buttonup"></a>

### Event: 'buttonUp'

* `button: <number>` The index of the button that was released.

Fired when one of the joystick's buttons is released.

### Event: 'hatMotion'

* `hat: <number>` The index of the hat that was moved.
* `value: `[`<HatPosition>`](#hat-positions) The new hat position.

Fired when one of the joystick's hats is moved.

<a id="joystick-instance-event-close"></a>

### Event: 'close'

Fired when the instance is about to close.
Handle cleanup here.

### joystickInstance.device

* `<object>`

The [device](#sdljoystickdevices) from which this instance was opened.

### joystickInstance.firmwareVersion

* `<number>`

The joystick's firmware version.

### joystickInstance.serialNumber

* `<string>|<null>`

The joystick's serial number, or `null` if it's not available.

### joystickInstance.axes

* `<number>[]`

An array of values, each corresponding to the position of one of the joystick's axes.
The values are normalized from `-1` to `+1`.
It may be necessary to impose certain tolerances on these values to account for jitter.

### joystickInstance.balls

* `<object>[]`
  * `x: <number>` The horizontal position of the joystick's ball.
  * `y: <number>` The vertical position of the joystick's ball.

An array of values, each corresponding to the position of one of the joystick's balls.

### joystickInstance.buttons

* `<boolean>[]`

An array of values, each corresponding to the state of one of the joystick's buttons.
The values will be `true` for buttons that are pressed and `false` otherwise.

### joystickInstance.hats

* [`<HatPosition>`](#hat-positions)`[]`

An array of values, each corresponding to the position of one of the joystick's hats.

### joystickInstance.power

* [`<PowerLevel>`](#power-levels)

The current power level of the joystick device.

### joystickInstance.setPlayer(index)

* `index: <number>` The player index to assign to the joystick.

Sets the player index of this joystick.

### joystickInstance.hasLed

* `<boolean>`

Will be `true` if there is a LED light on the joystick, whose color can be controlled.

### joystickInstance.setLed(red, green, blue)

* `red: <number>` The red component of the led color, from `0` to `1`.
* `green: <number>` The green component of the led color, from `0` to `1`.
* `blue: <number>` The blue component of the led color, from `0` to `1`.

Sets the color of the LED light on the joystick.

### joystickInstance.hasRumble

* `<boolean>`

Will be `true` if the joystick has rumble motors.

### joystickInstance.rumble([low, [high, [duration]]])

* `low: <number>` The intensity of the low frequency rumble motor, from `0` to `1`. Default: `1`
* `high: <number>` The intensity of the high frequency rumble motor, from `0` to `1`. Default: `1`
* `duration: <number>` The duration of the rumble, in ms. Default: `1e3`

Makes the joystick rumble for a set `duration`.
Calling this function again before `duration` has ran out, overrides the previous call.

### joystickInstance.stopRumble()

Stops the joystick rumbling.
Equivalent to `joystickInstance.rumble(0, 0)`.

### joystickInstance.hasRumbleTriggers

* `<boolean>`

Will be `true` if the joystick has rumble motors on the triggers.

### joystickInstance.rumbleTriggers([left, [right, [duration]]])

* `left: <number>` The intensity of the left trigger rumble motor, from `0` to `1`. Default: `1`
* `right: <number>` The intensity of the right trigger rumble motor, from `0` to `1`. Default: `1`
* `duration: <number>` The duration of the rumble, in ms. Default: `1e3`

Makes the joystick triggers rumble for a set `duration`.
Calling this function again before `duration` has ran out, overrides the previous call.

### joystickInstance.stopRumbleTriggers()

Stops the joystick trigger rumbling.
Equivalent to `joystickInstance.rumbleTriggers(0, 0)`.

### joystickInstance.closed

* `<boolean>`

Will be `true` if the instance is closed.
A closed instance object should not be used any further.

### joystickInstance.close()

Closes the instance.


## sdl.controller

An SDL controller is an abstraction over [`joysticks`](#sdljoystick) based on the xbox360 controller: They have a dpad, two analog sticks, 4 buttons on the right (called A, B, X, Y), shoulder buttons (two of which might be axes) and 3 buttons in the middle ("Start", "Back" and usually some kind of logo-button called "Guide").
The SDL controller abstraction uses the naming-conventions of xbox360/XInput for all supported devices (for example devices that have a similar layout, like the Playstation DualShock Controller, but different button names), so you'll know that for example `controllerInstance.axes.leftStickX` is always the x-axis of the left analog stick, or `controllerInstance.buttons.b` is always the rightmost buttons of the 4 buttons on the right.
This makes it easy to provide consistent input bindings, like "press B to jump, move around with the left analog stick".
With a pure joystick instance it's impossible to know which axis or button corresponds to which physical axis/button on the device.

Because controllers are an abstraction over joysticks, they operate on the same set of devices (if a joystick device and a controller device have the same id, then they refer to the same underlying physical device).
For a joystick device to also be available as a controller device it needs a "mapping".
A mapping is a string that consists of the device's name, it's GUID, and a series of pairings between one joystick axis/button and the corresponding controller axis/button name.
See the sample output [`here`](#sdlcontrollerdevices) for an example.
SDL has pretty good default controller mappings, but if you need more, there's a community sourced database available on https://github.com/gabomdq/SDL_GameControllerDB.
You can add them via:
```js
const url = 'https://raw.githubusercontent.com/gabomdq/SDL_GameControllerDB/master/gamecontrollerdb.txt'
const result = await fetch(url)
const text = await result.text()
const mappings = text.split('\n')
sdl.controller.addMappings(mappings)
```

<a id="controller-event-deviceadd"></a>

### Event: 'deviceAdd'

* `device: <object>`: An object from [`sdl.controller.devices`](#sdlcontrollerdevices) indicating the device that caused the event.

Fired when a new controller device becomes available.
Check [`sdl.controller.devices`](#sdlcontrollerdevices) to get the new list of controller devices.

<a id="controller-event-deviceremove"></a>

### Event: 'deviceRemove'

* `device: <object>`: An object from [`sdl.controller.devices`](#sdlcontrollerdevices) indicating the device that caused the event.

Fired when an existing controller device is removed.
Check [`sdl.controller.devices`](#sdlcontrollerdevices) to get the new list of controller devices.
When this event is emitted, all instances that were opened from the removed device are closed automatically.

### sdl.controller.addMappings(mappings)

* `mappings: <string>[]` An array of mappings to register.

Registers new mappings for controllers.
This can cause already opened controller instances to be [remapped](#event-remap).

### sdl.controller.devices

* `<object>[]`
  * `id: <number>` The unique id for the device.
  * `name: <string>` The name of the device.
  * `path: <string>` The implementation dependent path of the device.
  * `guid: <string>` The GUID of the device.
  * `vendor: <number>` The USB vendor ID of the device.
  * `product: <number>` The USB product ID of the device.
  * `version: <number>` The USB product version of the device.
  * `player: <number>` The player index for the device.
  * `mapping: <string>` The axis and button mapping for this device.

A list of all the detected controller devices.
Sample output:

```js
[
  {
    id: 0,
    name: 'DragonRise Inc. Generic USB Joystick',
    path: '/dev/input/event21',
    guid: '03000000790000000600000010010000',
    vendor: 121,
    product: 6,
    version: 272,
    player: 0,
    mapping: '03000000790000000600000010010000,DragonRise Inc. Generic USB Joystick,a:b2,b:b1,back:b8,dpdown:h0.4,dpleft:h0.8,dpright:h0.2,dpup:h0.1,leftshoulder:b4,leftstick:b10,lefttrigger:b6,leftx:a0,lefty:a1,rightshoulder:b5,rightstick:b11,righttrigger:b7,rightx:a3,righty:a4,start:b9,x:b3,y:b0,',
  },
]
```

### sdl.controller.openDevice(device)

* `device: <object>` An object from [`sdl.controller.devices`](#sdlcontrollerdevices) that should be opened.
* Returns: [`<ControllerInstance>`](#class-controllerinstance) an object representing the opened controller device instance.

Initializes an controller device and returns a corresponding instance.

## class ControllerInstance

This class is not directly exposed by the API so you can't use it with the `new` operator.
Instead, objects returned by [`sdl.controller.openDevice()`](#sdlcontrolleropendevicedevice) are of this type.

<a id="controller-instance-event-axismotion"></a>

### Event: 'axisMotion'

* `axis: <string>` The name of the axis that moved.
* `value: <number>` The new axis position.

Fired when one of the controller's axes moves.

<a id="controller-instance-event-buttondown"></a>

### Event: 'buttonDown'

* `button: <string>` The name of the button that was pressed.

Fired when one of the controller's buttons is pressed.

<a id="controller-instance-event-buttonup"></a>

### Event: 'buttonUp'

* `button: <number>` The index of the button that was released.

Fired when one of the controller's buttons is released.

### Event: 'remap'

Fired when a new mapping for this controller is applied (usually via [`sdl.controller.addMappings()`](#sdlcontrolleraddmappingsmappings)).
This can cause all of the controller's axes and buttons to aquire new values.

<a id="controller-instance-event-close"></a>

### Event: 'close'

Fired when the instance is about to close.
Handle cleanup here.

### controllerInstance.device

* `<object>`

The [device](#sdlcontrollerdevices) from which this instance was opened.

### controllerInstance.firmwareVersion

* `<number>`

The controller's firmware version.

### controllerInstance.serialNumber

* `<string>|<null>`

The controller's serial number, or `null` if it's not available.

### controllerInstance.axes

* `<object>`
  * `leftStickX: <number>` Left stick horizontal position
  * `leftStickY: <number>` Left stick vertical position
  * `rightStickX: <number>` Right stick horizontal position
  * `rightStickY: <number>` Right stick vertical position
  * `leftTrigger: <number>` Left trigger position
  * `rightTrigger: <number>` Right trigger position

An object mapping each axis of the controller's axes to its position.
The values are normalized from `-1` to `+1`.
It may be necessary to impose certain tolerances on these values to account for jitter.

### controllerInstance.buttons

* `<object>`
  * `dpadLeft: <boolean>` D-Pad left pressed
  * `dpadRight: <boolean>`  D-Pad right pressed
  * `dpadUp: <boolean>`  D-Pad up pressed
  * `dpadDown: <boolean>`  D-Pad down pressed
  * `a: <boolean>` A button pressed
  * `b: <boolean>` B button pressed
  * `x: <boolean>` X button pressed
  * `y: <boolean>` Y button pressed
  * `guide: <boolean>` Middle button pressed
  * `back: <boolean>` Back button pressed
  * `start: <boolean>` Start button pressed
  * `leftStick: <boolean>` Left stick pressed
  * `rightStick: <boolean>` Right stick pressed
  * `leftShoulder: <boolean>` Left shoulder button pressed
  * `rightShoulder: <boolean>` Right shoulder button pressed
  * `paddle1: <boolean>` Paddle 1 pressed
  * `paddle2: <boolean>` Paddle 2 pressed
  * `paddle3: <boolean>` Paddle 3 pressed
  * `paddle4: <boolean>` Paddle 4 pressed

An object mapping each of the controller's buttons to a boolean value.
The values will be `true` for buttons that are pressed and `false` otherwise.

### controllerInstance.power

* [`<PowerLevel>`](#power-levels)

The current power level of the controller device.

### controllerInstance.setPlayer(index)

* `index: <number>` The player index to assign to the controller.

Sets the player index of this controller.

### controllerInstance.hasLed

* `<boolean>`

Will be `true` if there is a LED light on the controller, whose color can be controlled.

### controllerInstance.setLed(red, green, blue)

* `red: <number>` The red component of the led color, from `0` to `1`.
* `green: <number>` The green component of the led color, from `0` to `1`.
* `blue: <number>` The blue component of the led color, from `0` to `1`.

Sets the color of the LED light on the controller.

### controllerInstance.hasRumble

* `<boolean>`

Will be `true` if the controller has rumble motors.

### controllerInstance.rumble([low, [high, [duration]]])

* `low: <number>` The intensity of the low frequency rumble motor, from `0` to `1`. Default: `1`
* `high: <number>` The intensity of the high frequency rumble motor, from `0` to `1`. Default: `1`
* `duration: <number>` The duration of the rumble, in ms. Default: `1e3`

Makes the controller rumble for a set `duration`.
Calling this function again before `duration` has ran out, overrides the previous call.

### controllerInstance.stopRumble()

Stops the controller rumbling.
Equivalent to `controllerInstance.rumble(0, 0)`.

### controllerInstance.hasRumbleTriggers

* `<boolean>`

Will be `true` if the controller has rumble motors on the triggers.

### controllerInstance.rumbleTriggers([left, [right, [duration]]])

* `left: <number>` The intensity of the left trigger rumble motor, from `0` to `1`. Default: `1`
* `right: <number>` The intensity of the right trigger rumble motor, from `0` to `1`. Default: `1`
* `duration: <number>` The duration of the rumble, in ms. Default: `1e3`

Makes the controller triggers rumble for a set `duration`.
Calling this function again before `duration` has ran out, overrides the previous call.

### controllerInstance.stopRumbleTriggers()

Stops the controller trigger rumbling.
Equivalent to `controllerInstance.rumbleTriggers(0, 0)`.

### controllerInstance.closed

* `<boolean>`

Will be `true` if the instance is closed.
A closed instance object should not be used any further.

### controllerInstance.close()

Closes the instance.


## sdl.sensor

### sdl.sensor.STANDARD_GRAVITY

* `<number>`

The readings from accelerometers will include the force of gravity, so a device at rest will have an value of `STANDARD_GRAVITY` away from the center of the earth.
Use this constant to correct for that if your application requires it.

### sdl.sensor.devices

* `<object>[]`
  * `id: <number>` The unique id of the device.
  * `name: <string>` The name of the device.
  * `type: <string>` Will be either `'accelerometer'`, `'gyroscope'`, or `'unknown'`.
  * `side: <string | null>` Some sensors (such as those on the Joy-Con controller) have a `'left'` or `'right'` side, otherwise this value will be `null`.

A list of all the detected sensor devices.
Sample output:

// TODO

### sdl.sensor.openDevice(device)

* `device: <object>` An object from [`sdl.sensor.devices`](#sdlsensordevices) that should be opened.
* Returns: [`<SensorInstance>`](#class-sensorinstance) an object representing the opened sensor device instance.

Initializes a sensor device and returns a corresponding instance.

## class SensorInstance

This class is not directly exposed by the API so you can't use it with the `new` operator.
Instead, objects returned by [`sdl.sensor.openDevice()`](#sdlsensoropendevicedevice) are of this type.

<a id="sensor-instance-event-update"></a>

### Event: 'update'

Fired when the sensor's data changes.
Get the new data by accessing [`sensorInstance.data`](#sensorInstancedata)

<a id="sensor-instance-event-close"></a>

### Event: 'close'

Fired when the instance is about to close.
Handle cleanup here.

### sensorInstance.device

* `<object>`

The [device](#sdlsensordevices) from which this instance was opened.

### sensorInstance.data

* `<object>`
  * `timestamp: <number | null>` The time this measurement was taken **in microseconds**, or `null` if that's not available.
  * `x: <number>` X axis value.
  * `y: <number>` Y axis value.
  * `z: <number>` Z axis value.

An object reporting the latest measurement from the sensor.

For accelerometers, the values correspond to the current acceleration in meters per second squared.
This measurement includes the force of gravity, so a device at rest will have an value of [`sdl.sensor.STANDARD_GRAVITY`](#sdlsensorstandard_gravity) away from the center of the earth.

For gyroscopes, the values correspond to the current rate of rotation in radians per second.
The rotation is positive in the counter-clockwise direction.
That is, an observer looking from a positive location on one of the axes would see positive rotation on that axis when it appeared to be rotating counter-clockwise.

For phones held in portrait mode and game controllers held in front of you, the axes are defined as follows:
* -X ... +X : left ... right
* -Y ... +Y : bottom ... top
* -Z ... +Z : farther ... closer

### sensorInstance.closed

* `<boolean>`

Will be `true` if the instance is closed.
A closed instance object should not be used any further.

### sensorInstance.close()

Closes the instance.


## sdl.audio

### Audio data

The [`playbackInstance.enqueue()`](#playbackinstanceenqueuebuffer-bytes) function expects a buffer of audio data as input and the [`recordingInstance.dequeue()`](#recordinginstancedequeuebuffer-bytes) function returns a buffer of audio data as output.
The format of the data in these buffers depends on the options you passed to [`sdl.audio.openDevice()`](#sdlaudioopendevicedevice-options).

An audio buffer is a sequence of frames, and each frame is a sequence of samples.
A _sample_ is a single number representing the intensity of an audio channel at a point in time.
For audio with multiple channels, each point in time is represented by multiple samples (one per channel) that together make up a _frame_.
The samples in a frame are arranged as follows:
* For 1 channel (mono) a frame contains just the one sample.
* For 2 channels (stereo) the frame's first sample will be the one for the left channel, followed by the one for the right channel.
* For 4 channels (quad) the layout is front-left, front-right, rear-left, rear-right.
* For 6 channels (5.1) the layout is front-left, front-right, center, low-freq, rear-left, rear-right.

So for example, to play 3 seconds of a 440Hz sine wave, you could do:

```js
const TWO_PI = 2 * Math.PI

const {
  channels,
  frequency,
  bytesPerSample,
  minSampleValue,
  maxSampleValue,
  zeroSampleValue,
} = playbackInstance

const range = maxSampleValue - minSampleValue
const amplitude = range / 2

const sineAmplitude = 0.3 * amplitude
const sineNote = 440
const sinePeriod = 1 / sineNote

const duration = 3
const numFrames = duration * frequency
const numSamples = numFrames * channels
const numBytes = numSamples * bytesPerSample
const buffer = Buffer.alloc(numBytes)

let offset = 0
for (let i = 0; i < numFrames; i++) {
  const time = i / frequency
  const angle = time / sinePeriod * TWO_PI
  const sample = zeroSampleValue + Math.sin(angle) * sineAmplitude
  for (let j = 0; j < channels; j++) {
    offset = playbackInstance.writeSample(buffer, sample, offset)
  }
}

playbackInstance.enqueue(buffer)
playbackInstance.play()
```

### Sample formats

String values used to represent how audio samples are stored in a Buffer.

| Value | Corresponding `SDL_AudioFormat` | Comment |
| --- | --- | --- |
| `'s8'` | `AUDIO_S8` | signed 8-bit samples |
| `'u8'` | `AUDIO_U8` | unsigned 8-bit samples |
| `'s16lsb'` | `AUDIO_S16LSB` | signed 16-bit samples in little-endian byte order |
| `'s16msb'` | `AUDIO_S16MSB` | signed 16-bit samples in big-endian byte order |
| `'s16sys'` | `AUDIO_S16SYS` | signed 16-bit samples in native byte order |
| `'s16'` | `AUDIO_S16` | alias for `'s16lsb'` |
| `'u16lsb'` | `AUDIO_U16LSB` | unsigned 16-bit samples in little-endian byte order |
| `'u16msb'` | `AUDIO_U16MSB` | unsigned 16-bit samples in big-endian byte order |
| `'u16sys'` | `AUDIO_U16SYS` | unsigned 16-bit samples in native byte order |
| `'u16'` | `AUDIO_U16` | alias for `'u16lsb'` |
| `'s32lsb'` | `AUDIO_S32LSB` | 32-bit integer samples in little-endian byte order |
| `'s32msb'` | `AUDIO_S32MSB` | 32-bit integer samples in big-endian byte order |
| `'s32sys'` | `AUDIO_S32SYS` | 32-bit integer samples in native byte order |
| `'s32'` | `AUDIO_S32` | alias for `'s32lsb'` |
| `'f32lsb'` | `AUDIO_F32LSB` | 32-bit floating point samples in little-endian byte order |
| `'f32msb'` | `AUDIO_F32MSB` | 32-bit floating point samples in big-endian byte order |
| `'f32sys'` | `AUDIO_F32SYS` | 32-bit floating point samples in native byte order |
| `'f32'` | `AUDIO_F32` | alias for `'f32lsb'` |

<a id="audio-event-deviceadd"></a>

### Event: 'deviceAdd'

* `device: <object>`: An object from [`sdl.audio.devices`](#sdlaudiodevices) indicating the device that caused the event.

Fired when a new audio device becomes available.
Check [`sdl.audio.devices`](#sdlaudiodevices) to get the new list of audio devices.

<a id="audio-event-deviceremove"></a>

### Event: 'deviceRemove'

* `device: <object>`: An object from [`sdl.audio.devices`](#sdlaudiodevices) indicating the device that caused the event.

Fired when an existing audio device is removed.
Check [`sdl.audio.devices`](#sdlaudiodevices) to get the new list of audio devices.
When this event is emitted, all instances that were opened from the removed device are closed automatically.

### sdl.audio.bytesPerSample(format)

* `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
* Returns: `<number>` The number of bytes.

Helper function which maps each sample format to the corresponding number of bytes its samples take up.

### sdl.audio.minSampleValue(format)

* `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
* Returns: `<number>` The minimum sample value.

Helper function which maps each sample format to the corresponding minimum value its samples can take.

### sdl.audio.maxSampleValue(format)

* `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
* Returns: `<number>` The maximum sample value.

Helper function which maps each sample format to the corresponding maximum value its samples can take.

### sdl.audio.zeroSampleValue(format)

* `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
* Returns: `<number>` The zero sample value.

Helper function which maps each sample format to the sample value that corresponds to silence.

### sdl.audio.readSample(format, buffer[, offset])

* `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
* `buffer: <Buffer>` The buffer to read the sample from.
* `offset: <number>` The position from which to read the sample. Default: `0`
* Returns: `<number>` The value of the sample read.

Helper function which calls the appropriate `read*` method of `Buffer` based on the format argument.
For example, a call to `sdl.audio.readSample('f32', buffer, offset)` would be equivalent to `buffer.readFloatLE(offset)`.

### sdl.audio.readerName(format)

* `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
* Returns: `<string>` The name of the read method.

Helper function which returns the name of the appropriate `read*` method of `Buffer` based on the format argument.
Most of the time you will want to use [sdl.audio.readSample](#sdlaudioreadsampleformat-buffer-offset) directly.
The method name is only really useful for passing to worker threads.

### sdl.audio.writeSample(format, buffer, value[, offset])

* `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
* `buffer: <Buffer>` The buffer to write the sample to.
* `value: <number>` The value of the sample to write.
* `offset: <number>` The position at which to write the sample. Default: `0`
* Returns: `<number>` The updated `offset`.

Helper function which calls the appropriate `write*` method of `Buffer` based on the format argument.
For example, a call to `sdl.audio.writeSample('f32', buffer, value, offset)` would be equivalent to `buffer.writeFloatLE(value, offset)`.

### sdl.audio.writerName(format)

* `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
* Returns: `<string>` The name of the write method.

Helper function which returns the name of the appropriate `write*` method of `Buffer` based on the format argument.
Most of the time you will want to use [sdl.audio.writeSample](#sdlaudiowritesampleformat-buffer-value-offset) directly.
The method name is only really useful for passing to worker threads.

### sdl.audio.devices

* `<object>[]`
  * `type: <string>` Will be either `'playback'` or `'recording'`.
  * `name: <string>` The name of the device.

A list of all the detected audio devices.
Sample output for PulseAudio:

```js
[
  { name: 'Built-in Audio Analog Stereo', type: 'playback' },
  { name: 'Built-in Audio Analog Stereo', type: 'recording' },
]
```

Note that this list can sometimes be empty.
Despite that, in many common cases, it is still possible to successfully open the default device by only passing `type` to [`sdl.audio.openDevice()`](#sdlaudioopendevicedevice-options) like this:

```js
const playbackInstance = sdl.audio.openDevice({ type: 'playback' })
```

### sdl.audio.openDevice(device[, options])

* `device: <object>` An object from [`sdl.audio.devices`](#sdlaudiodevices), or a custom device.
  * `type: <string>`: Should be either `'playback'` or `'recording'`.
  * `name: <string>|<null>`: The name of the device. Optional.
* `options: <object>`
  * `channels: <number>`: Number of audio channels. Valid values: `1`, `2`, `4`, `6`. Default: `1`
  * `frequency: <number>`: The sampling frequency in frames per second. Default: `48e3`
  * `format: `[`<SampleFormat>`](#sample-formats): The binary format for each sample. Default: `'f32'`
  * `buffered: <number>`: Number of frames that will be buffered by the driver. Must be a power of `2`. Default: `4096`
* Returns: [`<AudioInstance>`](#class-audioinstance) an object representing the opened audio device instance.

Initializes an audio device for playback/recording and returns a corresponding instance.
If the opened device is a playback device, then the returned object will be an [`AudioPlaybackInstance`](#class-audioplaybackinstance-extends-audioinstance), otherwise it will be an [`AudioRecordingInstance`](#class-audiorecordinginstance-extends-audioinstance).

Most of the time you will be passing objects from [`sdl.audio.devices`](#sdlaudiodevices) as the first argument to this function.
It is also possible to let SDL pick the most appropriate device by only passing the `type` property without a `name` like this:

```js
const playbackInstance = sdl.audio.openDevice({ type: 'playback' })
```

Some audio drivers also support arbitrary and driver-specific strings for the device `name` such as hostname/IP address for a remote audio server, or a filename in the diskaudio driver.
These drivers will usually return an empty list for [`sdl.audio.devices`](#sdlaudiodevices).

The `channels`, `frequency` and `format` options together define what the data in the `Buffer` objects you read from or write to the instance will look like.
See also the section on [audio data](#audio-data).

The `buffered` option specifies the "delay" that you will experience between the application and the audio driver.
With smaller values you will have smaller delays, but you will also have to read/write data from/to the driver more frequently.
Applications such as virtual instruments that need to play audio in reaction to user input will want to change this option to lower values.


## class AudioInstance

This class is not directly exposed by the API so you can't use it with the `new` operator.
It only serves as the base class for [`AudioPlaybackInstance`](#class-audioplaybackinstance-extends-audioinstance) and [`AudioRecordingInstance`](#class-audiorecordinginstance-extends-audioinstance).

<a id="audio-instance-event-close"></a>

### Event: 'close'

Fired when the audio instance is about to close.
Handle cleanup here.

### audioInstance.id

* `<number>`

A unique identifier for the instance.

### audioInstance.device

* `<object>`

The device passed to [`sdl.audio.openDevice()`](#sdlaudioopendevicedevice-options) when this instance was opened.

### audioInstance.channels

* `<number>`

The number of channels the instance was opened with.

### audioInstance.frequency

* `<number>`

The sampling frequency (in frames per second) the instance was opened with.

### audioInstance.format

* [`<SampleFormat>`](#sample-formats)

The audio sample format the instance was opened with.

### audioInstance.bytesPerSample

* `<number>`

The number of bytes that make up a single audio sample, based on the format the instance was opened with.

### audioInstance.minSampleValue

* `<number>`

The minimum value a sample can take, based on the format the instance was opened with.

### audioInstance.maxSampleValue

* `<number>`

The maximum value a sample can take, based on the format the instance was opened with.

### audioInstance.zeroSampleValue

* `<number>`

The sample value that corresponds to silence, based on the format the instance was opened with.

### audioInstance.readSample(buffer[, offset])

* `buffer: <Buffer>` The buffer to read the sample from.
* `offset: <number>` The position from which to read the sample. Default: `0`
* Returns: `<number>` The value of the sample read.

Helper function which calls the appropriate `read*` method of `Buffer` based on the format the instance was opened with.
For example, for an instance opened with the `'f32'` sample format, a call to `audioinstance.readSample(buffer, offset)` would be equivalent to `buffer.readFloatLE(offset)`.

### audioInstance.readerName

* `<string>`

The name of the appropriate `read*` method of `Buffer` based on the format the instance was opened with.
Most of the time you will want to use [audioInstance.readSample](#audioinstancereadsamplebuffer-offset) directly.
The method name is only really useful for passing to worker threads.

### audioInstance.writeSample(buffer, value[, offset])

* `buffer: <Buffer>` The buffer to write the sample to.
* `value: <number>` The value of the sample to write.
* `offset: <number>` The position at which to write the sample. Default: `0`
* Returns: `<number>` The updated `offset`.

Helper function which calls the appropriate `write*` method of `Buffer` based on the format the instance was opened with.
For example, for an instance opened with the `'f32'` sample format, a call to `audioinstance.writeSample(buffer, value, offset)` would be equivalent to `buffer.writeFloatLE(value, offset)`.

### audioInstance.writerName

* `<string>`

The name of the appropriate `write*` method of `Buffer` based on the format the instance was opened with.
Most of the time you will want to use [audioInstance.writeSample](#audioinstancewritesamplebuffer-value-offset) directly.
The method name is only really useful for passing to worker threads.

### audioInstance.buffered

* `<number>`

The buffer size (in frames) the instance was opened with.

### audioInstance.playing

* `<boolean>`

Will be `true` if the instance is currently playing.

### audioInstance.play([play])

* `show: <boolean>` Set to `true` to start the instance, `false` to stop. Default: `true`

Starts or stops the instance.

### audioInstance.pause()

Equivalent to [`audioInstance.play(false)`](#audioinstanceplayplay)

### audioInstance.queued

* `<number>`

The number of bytes that are currently queued up, waiting to be either played by the instance or dequeued by the user.

### audioInstance.clearQueue()

Clears the queued data.

### audioInstance.closed

* `<boolean>`

Will be `true` if the instance is closed.
A closed instance object should not be used any further.

### audioInstance.close()

Closes the instance.


## class AudioPlaybackInstance extends AudioInstance

This class is not directly exposed by the API so you can't use it with the `new` operator.
Instead, objects returned by [`sdl.audio.openDevice()`](#sdlaudioopendevicedevice-options) are of this type, if a playback device is opened.

### playbackInstance.enqueue(buffer[, bytes])

* `buffer: <Buffer>` The buffer to read data from.
* `bytes: <number>` The number of bytes to read from the buffer. Default: `buffer.length`

Takes generated audio data from the buffer, and writes it to the queue, from which it will be played back.


## class AudioRecordingInstance extends AudioInstance

This class is not directly exposed by the API so you can't use it with the `new` operator.
Instead, objects returned by [`sdl.audio.openDevice()`](#sdlaudioopendevicedevice-options) are of this type, if a recording device is opened.

### recordingInstance.dequeue(buffer[, bytes])

* `buffer: <Buffer>` The buffer to write data to.
* `bytes: <number>` The number of bytes to write to the buffer. Default: `buffer.length`
* Returns: `<number>` The actual number of bytes read.

Takes recorded audio data that has been put on the queue, and writes it to the provided buffer.


## sdl.clipboard

### Event: 'update'

Fired when the contents of the clipboard have changed.
Check [`sdl.clipboard.text`](#sdlclipboardtext) to get the new contents of the clipboard.

### sdl.clipboard.text

* `<string>`

The current text value on the clipboard.

### sdl.clipboard.setText(text)

* `text: <string>` The new value to save on the clipboard.

Changes the text contents of the clipboard.


## sdl.power

### sdl.power.info

* `<object>`
  * `state: <string>` One of `'unknown'`, `'noBattery'`, `'battery'`, `'charging'`, `'charged'`.
  * `seconds: <number | null>` Seconds of battery life left. Will be `null` if not running on battery, or if it can't be determinded.
  * `percent: <number | null>` Percentage of battery life left. Will be `null` if not running on battery, or if it can't be determinded.

The curent power information of the device.


## Building from source

If there are no prebuilt binaries available for your platform, `@kmamal/sdl` will try to compile itself during installation.
A few prerequisites are necessary for that to work:

First, make sure you have installed [node-gyp](https://github.com/nodejs/node-gyp#installation) as well as its dependencies.

On Mac, you will also need to install `xquartz` so that SDL can find the X11 headers it needs.
You can do that via `brew install xquartz`.

You don't need to install any SDL libraries or headers.
These will be downloaded automatically through the [@kmamal/build-sdl](https://github.com/kmamal/build-sdl) package.
If `@kmamal/build-sdl` has no prebuilt library for your platform, it will try to compile one on the spot.
You will need to have `cmake` installed for that to work.

---

You could also have found your way to the "Building from source" section because you are trying to contribute to this package.
There are some npm scripts in `package.json` that could be of use to you:
* `npm run clean` deletes all folders that are created during the build, as well as `node_modules`.
* `npm run download-release` downloads the prebuilt binaries. This is the first thing the install script tries to do.
* `npm run download-sdl` downloads the SDL headers and libraries from `@kmamal/build-sdl` so you can compile against them in later steps. This is the second step in the install script, after `download-release` has failed.
* `npm run build` prepares the environment variables and calls `node-gyp` to build the package.
* `NODE_SDL_FROM_SOURCE=1 npm install` runs the install script normally, but skips the inital attempt to download the binaries, and goes straight to building from source.

The SDL headers and libs get downloaded to `sdl/`, the build happens in `build/`, and the final binaries get collected into `dist/`.

The way I normally work is I run `npm run clean` to start fresh, then run `NODE_SDL_FROM_SOURCE=1 npm i` once to prepare everything, then as I make changes I run `npm run build` to re-build the package.

Have fun!
