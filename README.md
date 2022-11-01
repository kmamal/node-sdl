# @kmamal/sdl

[![Package](https://img.shields.io/npm/v/%2540kmamal%252Fsdl)](https://www.npmjs.com/package/@kmamal/sdl)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@kmamal/sdl)](https://libraries.io/npm/@kmamal%2Fsdl)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/%2540kmamal%252Fsdl)](https://snyk.io/test/npm/@kmamal/sdl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SDL2 bindings for Node.js.
Provides window management, input events, audio playback/recording, and clipboard manipulation.
You can use it together with [@kmamal/gl](https://github.com/kmamal/headless-gl#readme) to get native WebGL drawing without having to use a browser.

It should work on Linux, Mac, and Windows.
Prebuilt binaries are available for x64 architectures, as well as arm-based Macs.


## Installation

SDL2 is bundled along with the binaries so a separate installation is not necessary.
This package is self-contained.
Just run:

```
npm install @kmamal/sdl
```

(But if things go wrong do look over [here](#building-from-source))


## Example

```js
const sdl = require('@kmamal/sdl')
const createContext = require('@kmamal/gl')

const window = sdl.video.createWindow({
  title: "Hello, World!"
  opengl: true,
})

// Clear screen to red
const { width, height, native } = window
const gl = createContext(width, height, { window: native })
gl.clearColor(1, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
gl.swap()
```

There are more examples [in the `examples/` folder](https://github.com/kmamal/node-sdl/tree/master/examples), covering several common use cases, including how to draw using Canvas and WebGL, as well as how to package the application for distribution.


# API Reference

## Contents

* [sdl](#sdl)
  * [Event: 'beforeQuit'](#event-beforequit)
  * [Event: 'quit'](#event-quit)
  * [sdl.info](#sdlinfo)
* [sdl.video](#sdlvideo)
  * [Image data](#image-data)
  * [Pixel formats](#pixel-formats)
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
    * [window.setSize(width, height)](#windowsetsizewidth-height)
    * [window.visible](#windowvisible)
    * [window.show([show])](#windowshowshow)
    * [window.hide()](#windowhide)
    * [window.fullscreen](#windowfullscreen)
    * [window.setFullscreen(fullscreen)](#windowsetfullscreenfullscreen)
    * [window.resizable](#windowresizable)
    * [window.setResizable(resizable)](#windowsetresizableresizable)
    * [window.borderless](#windowborderless)
    * [window.setBorderless(borderless)](#windowsetborderlessborderless)
    * [window.accelerated](#windowaccelerated)
    * [window.setAccelerated(accelerated)](#windowsetacceleratedaccelerated)
    * [window.vsync](#windowvsync)
    * [window.setVsync(vsync)](#windowsetvsyncvsync)
    * [window.opengl](#windowopengl)
    * [window.native](#windownative)
    * [window.maximized](#windowmaximized)
    * [window.maximize()](#windowmaximize)
    * [window.minimized](#windowminimized)
    * [window.minimize()](#windowminimize)
    * [window.restore()](#windowrestore)
    * [window.focused](#windowfocused)
    * [window.focus()](#windowfocus)
    * [window.hovered](#windowhovered)
    * [window.render(width, height, stride, format, buffer)](#windowrenderwidth-height-stride-format-buffer)
    * [window.setIcon(width, height, stride, format, buffer)](#windowseticonwidth-height-stride-format-buffer)
    * [window.destroyed](#windowdestroyed)
    * [window.destroy()](#windowdestroy)
* [sdl.audio](#sdlaudio)
  * [Audio data](#audio-data)
  * [Sample formats](#sample-formats)
  * [Event: 'deviceAdd'](#event-deviceadd)
  * [Event: 'deviceRemove'](#event-deviceremove)
  * [sdl.audio.bytesPerSample(format)](#sdlaudiobytespersampleformat)
  * [sdl.audio.minSampleValue(format)](#sdlaudiominsamplevalueformat)
  * [sdl.audio.maxSampleValue(format)](#sdlaudiomaxsamplevalueformat)
  * [sdl.audio.zeroSampleValue(format)](#sdlaudiozerosamplevalueformat)
  * [sdl.audio.readSample(format, buffer[, offset])](#sdlaudioreadsampleformat-buffer-offset)
  * [sdl.audio.writeSample(format, buffer, value[, offset])](#sdlaudiowritesampleformat-buffer-value-offset)
  * [sdl.audio.devices](#sdlaudiodevices)
  * [sdl.audio.openDevice(device[, options])](#sdlaudioopendevicedevice-options)
  * [class AudioInstance](#class-audioinstance)
    * [audioInstance.id](#audioinstanceid)
    * [audioInstance.name](#audioinstancename)
    * [audioInstance.channels](#audioinstancechannels)
    * [audioInstance.frequency](#audioinstancefrequency)
    * [audioInstance.format](#audioinstanceformat)
    * [audioInstance.bytesPerSample](#audioinstancebytespersample)
    * [audioInstance.minSampleValue](#audioinstanceminsamplevalue)
    * [audioInstance.maxSampleValue](#audioinstancemaxsamplevalue)
    * [audioInstance.zeroSampleValue](#audioinstancezerosamplevalue)
    * [audioInstance.readSample(buffer[, offset])](#audioinstancereadsamplebuffer-offset)
    * [audioInstance.writeSample(buffer, value[, offset])](#audioinstancewritesamplebuffer-value-offset)
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
* [sdl.keyboard](#sdlkeyboard)
  * [Virtual keys](#virtual-keys)
  * [Enum: SCANCODE](#enum-scancode)
  * [sdl.keyboard.getKey(scancode)](#sdlkeyboardgetkeyscancode)
  * [sdl.keyboard.getScancode(key)](#sdlkeyboardgetscancodekey)
  * [sdl.keyboard.getState()](#sdlkeyboardgetstate)
* [sdl.mouse](#sdlmouse)
  * [Mouse cursors](#mouse-cursors)
  * [Enum: BUTTON](#enum-buttons)
  * [sdl.mouse.getButton(button)](#sdlmousegetbuttonbutton)
  * [sdl.mouse.position](#sdlmouseposition)
  * [sdl.mouse.setPosition(x, y)](#sdlmousesetpositionx-y)
  * [sdl.mouse.setCursor(cursor)](#sdlmousesetcursor)
  * [sdl.mouse.setCursorImage(width, height, stride, format, buffer, x, y)](#sdlmousesetcursorimagewidth-height-stride-format-buffer-x-y)
  * [sdl.mouse.showCursor([show])](#sdlmouseshowcursorshow)
  * [sdl.mouse.hideCursor()](#sdlmousehidecursor)
  * [sdl.mouse.capture([capture])](#sdlmousecapturecapture)
  * [sdl.mouse.uncapture()](#sdlmousecapture)
* [sdl.clipboard](#sdlclipboard)
  * [Event: 'update'](#event-update)
  * [sdl.clipboard.text](#sdlclipboardtext)
  * [sdl.clipboard.setText(text)](#sdlclipboardsettexttext)


## sdl

### Event: 'beforeQuit'

* `prevent: <function (void) => void>` Call this to prevent the application from closing.

Fired to indicate that the user has requested the application to close (usually by closing the last window).
If you need to display any confirmation dialogs you should call `event.prevent()` and handle termination manually.
If `prevent` is not called, then this event will be followed by a [`'quit'`](#event-quit) event.

### Event: 'quit'

Indicates that the application is about to close.
Handle any cleanup here.
This event will be followed by a call to `process.exit()`.

### sdl.info

* `<object>`
  * `version: <object>`
    * `compile: <object>` The SDL2 version the bindings were compiled against.
      * `major, minor, patch: <semver>` The components of the version.
    * `runtime: <object>` The SDL2 version of the dynamic library the is loaded.
      * `major, minor, patch: <semver>` The components of the version.
  * `platform: <string>` The name of the platform we are running on. Possible values are: `'Linux'`, `'Windows'`, and `'Mac OS X'`.
  * `drivers: <object>`
    * `video: <object>`
      * `all: <string>[]` A list of all video drivers.
      * `current: <string>` The video driver that is currently selected.
    * `audio: <object>`
      * `all: <string>[]` A list of all audio drivers.
      * `current: <string>` The audio driver that is currently selected.

This object is filled with the information produced during the initialization of SDL2.
All the values will remain constant throughout the execution of the program.
If you want to initialize SDL2 with drivers other than the default ones, you can do so via its [environment variables](https://wiki.libsdl.org/FAQUsingSDL).

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
const { width, height } = window
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
  * `accelerated: <boolean>` Set to `false` to disable hardware accelerated rendering. Default: `true`
  * `vsync: <boolean>` Set to `false` to disable frame rate synchronization. Default: `true`
  * `opengl: <boolean>` Set to `true` to create an OpenGL-compatible window (for use with [@kmamal/gl](https://github.com/kmamal/headless-gl#readme)). Default: `false`
* Returns: [`<Window>`](#class-window) an object representing the new window.

Creates a new window.

The following restrictions apply:
* If you specify the `display` option, you can't also specify the `x` or `y` options, and vice-versa.
* The `resizable` and `borderless` options can't both be true.
* The `vsync` option only applies to windows that are also `accelerated`.

If you set the `opengl` option, then you can only render to the window with OpenGL calls.
Calls to [`render()`](#windowrenderwidth-height-stride-format-buffer) will fail.

## class Window

This class is not directly exposed by the API so you can't use it with the `new` operator.
Instead, objects returned by [`sdl.video.createWindow()`](#sdlvideocreatewindowoptions) are of this type.

### Event: 'show'

Fired when a window becomes visible.

### Event: 'hide'

Fired when a window becomes hidden.

### Event: 'expose'

Fired when a window becomes exposed.

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
This event will be followed by a call to [`window.destroy()`](#windowdestroy).

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

When dropping a set of items onto a window, first the `'drop-begin'` event will be fired, then a number of `'drop-text'` and/or `'drop-file'` events will be fired corresponding to the contents of the drop, then finally the `'drop-complete'` event will be fired.

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

### window.setSize(width, height)

* `width: <number>`: The new width.
* `height: <number>`: The new height.

Changes the size of the window.

### window.visible

* `<boolean>`

Will be `true` if the window is visible.

### window.show([show])

* `show: <boolean>` Set to `true` to make the window visible, `false` to hide it.
Default: `true`

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

### window.accelerated

* `<boolean>`

Will be `true` if the window is using hardware accelerated rendering.

### window.setAccelerated(accelerated)

* `accelerated: <boolean>` The new value of the property.

Changes the window's accelerated property.

### window.vsync

* `<boolean>`

Will be `true` if the window is using vsync.
A window with vsync enabled will have its frame rate synchronized to the display's refresh rate to prevent tearing.
Note that vsync can only be used if that window is also [`accelerated`](#windowaccelerated)

### window.setVsync(vsync)

* `vsync: <boolean>` The new value of the property.

Changes the window's vsync property.

### window.opengl

* `<boolean>`

Will be `true` if the window was created in OpenGl mode.
In OpenGL mode, you can only render to the window with OpenGL calls.
Calls to [`render()`](#windowrenderwidth-height-stride-format-buffer) will fail.

### window.native

* `<any>`

Holds a copy of the native (platform-specific) representation of the window.
Only used for passing to [@kmamal/gl](https://github.com/kmamal/headless-gl#readme).

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

### window.render(width, height, stride, format, buffer)

* `width, height, stride, format, buffer: `[`<Image>`](#image-data) The image to display on the window.

Displays an image in the window.
The provided image will be stretched over the entire window.

### window.setIcon(width, height, stride, format, buffer)

* `width, height, stride, format, buffer: `[`<Image>`](#image-data) The image to display as the icon of the window.

Set's the window's icon, usually displayed in the title bar and the taskbar.

### window.destroyed

* `<boolean>`

Will be `true` if the window is destroyed.
A destroyed window object should not be used any further.

### window.destroy()

Destroys the window.


## sdl.audio

### Audio data

The [`playbackInstance.enqueue()`](#playbackinstanceenqueuebuffer-bytes) function expects a buffer of audio data as input and the [`recordingInstance.dequeue()`](#recordinginstancedequeuebuffer-bytes) function returns a buffer of audio data as output.
The format of the data in these buffers depends on the options you passed to [`sdl.audio.openDevice()`](#sdlaudioopendevicedevice-options).

Audio data are a sequence of frames, with each frame being a sequence of samples.
A _sample_ is a single number representing the intensity of a single audio channel at a specific point in time.
For audio with multiple channels, each point in time is represented by one sample per channel.
This is called a _frame_.
The samples in a frame are arranged as follows:
* For 1 channel (mono) a frame contains just the one sample.
* For 2 channels (stereo) the frame's first sample will be the one for the left channel, followed by the one for the right channel.
* For 4 channels (quad) the layout is front-left, front-right, rear-left, rear-right.
* For 6 channels (5.1) the layout is front-left, front-right, center, low-freq, rear-left, rear-right.

So for example, to fill a buffer with 3 seconds of a 440Hz sine wave, you could do:

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

### Event: 'deviceAdd'

* `device: <object>`: An object from [`sdl.audio.devices`](#sdlaudioinstances) indicating the device that caused the event.

Fired when a new audio device becomes available.
Check [`sdl.audio.devices`](#sdlaudioinstances) to get the new list of audio devices.

### Event: 'deviceRemove'

* `device: <object>`: An object from [`sdl.audio.devices`](#sdlaudioinstances) indicating the device that caused the event.

Fired when an existing audio device is removed.
Check [`sdl.audio.devices`](#sdlaudioinstances) to get the new list of audio devices.
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

### sdl.audio.writeSample(format, buffer, value[, offset])

* `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
* `buffer: <Buffer>` The buffer to write the sample to.
* `value: <number>` The value of the sample to write.
* `offset: <number>` The position at which to write the sample. Default: `0`
* Returns: `<number>` The updated `offset`.

Helper function which calls the appropriate `write*` method of `Buffer` based on the format argument.
For example, a call to `sdl.audio.writeSample('f32', buffer, value, offset)` would be equivalent to `buffer.writeFloatLE(value, offset)`.

### sdl.audio.devices

* `<object>[]`
  * `name: <string>` The name of the device.
  * `recording: <boolean>` Will be `true` if this is a recording device.

A list of all the detected audio devices.
Sample output for PulseAudio:

```js
[
  { name: 'Built-in Audio Analog Stereo', recording: false },
  { name: 'Built-in Audio Analog Stereo', recording: true }
]
```

### sdl.audio.openDevice(device[, options])

* `device: <object>` An object from [`sdl.audio.devices`](#sdlaudiodevices) that should be opened.
* `options: <object>`
  * `name: <string>`: Some drivers accept custom names, such as a hostname/IP address for a remote audio server, or a filename in the diskaudio driver. Default: `device.name`.
  * `channels: <number>`: Number of audio channels. Valid values: `1`, `2`, `4`, `6`. Default `1`.
  * `frequency: <number>`: The sampling frequency in frames per second. Default `48e3`.
  * `format: `[`<SampleFormat>`](#sample-formats): The binary format for each sample. Default `'f32'`.
  * `buffered: <number>`: Number of frames that will be buffered by the driver. Must be a power of `2`. Default `4096`.
* Returns: [`<AudioInstance>`](#class-audioinstance) an object representing the opened audio device instance.

Initializes an audio device for playback/recording and returns a corresponding instance.
If the opened device is a playback device, then the returned object will be an [`AudioPlaybackInstance`](#class-audioplaybackinstance-extends-audioinstance), otherwise it will be an [`AudioRecordingInstance`](#class-audiorecordinginstance-extends-audioinstance).

The `channels`, `frequency` and `format` options together define what the data in the `Buffer` objects you read from or write to the instance will look like.
See also the section on [audio data](#audio-data).

The `buffered` option specifies the "delay" that you will experience between the application and the audio driver.
With smaller values you will have smaller delays, but you will also have to read/write data from/to the driver more frequently.
Applications such as virtual instruments that need to play audio in reaction to user input will want to change this option to lower values.


## class AudioInstance

This class is not directly exposed by the API so you can't use it with the `new` operator.
It only serves as the base class for [`AudioPlaybackInstance`](#class-audioplaybackinstance-extends-audioinstance) and [`AudioRecordingInstance`](#class-audiorecordinginstance-extends-audioinstance).

### audioInstance.id

* `<number>`

A unique identifier for the instance.

### audioInstance.device

* `<object>`

The [device](#sdlaudiodevices) from which this instance was opened.

### audioInstance.name

* `<string>`

The name the instance was opened with.

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

### audioInstance.writeSample(buffer, value[, offset])

* `buffer: <Buffer>` The buffer to write the sample to.
* `value: <number>` The value of the sample to write.
* `offset: <number>` The position at which to write the sample. Default: `0`
* Returns: `<number>` The updated `offset`.

Helper function which calls the appropriate `write*` method of `Buffer` based on the format the instance was opened with.
For example, for an instance opened with the `'f32'` sample format, a call to `audioinstance.writeSample(buffer, value, offset)` would be equivalent to `buffer.writeFloatLE(value, offset)`.

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
Pressed keys will correspond to `true` values.


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

* `show: <boolean>` If `true` then the mouse cursor will be visible.
Default `true`.

Changes the visibility of the mouse cursor.

### sdl.mouse.hideCursor()

Equivalent to [`sdl.mouse.showCursor(false)`](#sdlmouseshowcursorshow).

### sdl.mouse.capture([capture])

* `capture: <boolean>` If `true` the mouse will be captured by the current window.
Default `true`.

When the mouse has been captured you will continue receiving mouse events even if the mouse is not over a window.

### sdl.mouse.uncapture()

Equivalent to [`sdl.mouse.capture(false)`](#sdlmousecapturecapture).


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


## Building from source

If there are no prebuilt binaries available for your platform, `@kmamal/sdl` will try to compile itself during installation.
A few prerequisites are necessary for that to work:

First, make sure you have installed [node-gyp](https://github.com/nodejs/node-gyp#installation) as well as its dependencies.

On Mac, you will also need to install `xquartz` so that SDL2 can find the X11 headers it needs.
You can do that via `brew install xquartz`.

You don't need to install any SDL2 libraries or headers.
These will be downloaded automatically through the [@kmamal/build-sdl](https://github.com/kmamal/build-sdl) package.
If `@kmamal/build-sdl` has no prebuilt library for your platform, it will try to compile one on the spot.
You will need to have cmake installed for that to work.

Other than the obvious `npm install` command which will build the package, there are a number of npm scripts that could be useful:
* `npm run clean` deletes all folders that are created during the build, as well as `node_modules`.
* `npm run download-release` downloads the prebuilt binaries. This is the first thing the install script tries to do. You are here because this failed.
* `npm run download-sdl` downloads the SDL2 headers and libraries from `@kmamal/build-sdl` so you can compile against them in later steps. This is the second step in the install script, after `download-release` has failed.
* `npm run build` prepares the environment variables and calls `node-gyp`.
