# API Reference

## Contents

- [sdl](#sdl)
  - [sdl.info](#sdlinfo)
  - [Event emitters](#event-emitters)
- [sdl.video](#sdlvideo)
  - [Image data](#image-data)
  - [High-DPI](#high-dpi)
  - [Pixel formats](#pixel-formats)
  - [Event: 'displayAdd'](#event-displayadd)
  - [Event: 'displayRemove'](#event-displayremove)
  - [Event: 'displayOrient'](#event-displayorient)
  - [Event: 'displayMove'](#event-displaymove)
  - [Event: 'displayScaleChange'](#event-displayscalechange)
  - [Event: 'displayModeChange'](#event-displaymodechange)
  - [Event: 'displayUsableChange'](#event-displayusablechange)
  - [sdl.video.bytesPerPixel(format)](#sdlvideobytesperpixelformat)
  - [sdl.video.isYuv(format)](#sdlvideoisyuvformat)
  - [sdl.video.isPlanarYuv(format)](#sdlvideoisplanaryuvformat)
  - [sdl.video.minBufferSize(format, stride, height)](#sdlvideominbuffersizeformat-stride-height)
  - [sdl.video.displays](#sdlvideodisplays)
  - [sdl.video.windows](#sdlvideowindows)
  - [sdl.video.focused](#sdlvideofocused)
  - [sdl.video.hovered](#sdlvideohovered)
  - [sdl.video.createWindow([options])](#sdlvideocreatewindowoptions)
  - [class Window](#class-window)
    - [Event: 'show'](#event-show)
    - [Event: 'hide'](#event-hide)
    - [Event: 'expose'](#event-expose)
    - [Event: 'minimize'](#event-minimize)
    - [Event: 'maximize'](#event-maximize)
    - [Event: 'restore'](#event-restore)
    - [Event: 'move'](#event-move)
    - [Event: 'resize'](#event-resize)
    - [Event: 'displayChange'](#event-displaychange)
    - [Event: 'focus'](#event-focus)
    - [Event: 'blur'](#event-blur)
    - [Event: 'hover'](#event-hover)
    - [Event: 'leave'](#event-leave)
    - [Event: 'beforeClose'](#event-beforeclose)
    - [Event: 'close'](#event-close)
    - [Event: 'keyDown'](#event-keydown)
    - [Event: 'keyUp'](#event-keyup)
    - [Event: 'textInput'](#event-textinput)
    - [Event: 'mouseButtonDown'](#event-mousebuttondown)
    - [Event: 'mouseButtonUp'](#event-mousebuttonup)
    - [Event: 'mouseMove'](#event-mousemove)
    - [Event: 'mouseWheel'](#event-mousewheel)
    - [Event: 'fingerDown'](#event-fingerdown)
    - [Event: 'fingerUp'](#event-fingerup)
    - [Event: 'fingerMove'](#event-fingermove)
    - [Event: 'dropBegin'](#event-dropbegin)
    - [Event: 'dropText'](#event-droptext)
    - [Event: 'dropFile'](#event-dropfile)
    - [Event: 'dropComplete'](#event-dropcomplete)
    - [window.id](#windowid)
    - [window.title](#windowtitle)
    - [window.setTitle(title)](#windowsettitletitle)
    - [window.x](#windowx)
    - [window.y](#windowy)
    - [window.setPosition(x, y)](#windowsetpositionx-y)
    - [window.width](#windowwidth)
    - [window.height](#windowheight)
    - [window.pixelWidth](#windowpixelwidth)
    - [window.pixelHeight](#windowpixelheight)
    - [window.setSize(width, height)](#windowsetsizewidth-height)
    - [window.setSizeInPixels(pixelWidth, pixelHeight)](#windowsetsizeinpixelspixelwidth-pixelheight)
    - [window.display](#windowdisplay)
    - [window.visible](#windowvisible)
    - [window.show([show])](#windowshowshow)
    - [window.hide()](#windowhide)
    - [window.fullscreen](#windowfullscreen)
    - [window.setFullscreen(fullscreen)](#windowsetfullscreenfullscreen)
    - [window.resizable](#windowresizable)
    - [window.setResizable(resizable)](#windowsetresizableresizable)
    - [window.borderless](#windowborderless)
    - [window.setBorderless(borderless)](#windowsetborderlessborderless)
    - [window.alwaysOnTop](#windowalwaysontop)
    - [window.accelerated](#windowaccelerated)
    - [window.setAccelerated(accelerated)](#windowsetacceleratedaccelerated)
    - [window.vsync](#windowvsync)
    - [window.setVsync(vsync)](#windowsetvsyncvsync)
    - [window.opengl](#windowopengl)
    - [window.webgpu](#windowwebgpu)
    - [window.native](#windownative)
    - [window.maximized](#windowmaximized)
    - [window.maximize()](#windowmaximize)
    - [window.minimized](#windowminimized)
    - [window.minimize()](#windowminimize)
    - [window.restore()](#windowrestore)
    - [window.focused](#windowfocused)
    - [window.focus()](#windowfocus)
    - [window.hovered](#windowhovered)
    - [window.relativeMouseMode](#windowrelativemousemode)
    - [window.setRelativeMouseMode([relative])](#windowsetrelativemousemoderelative)
    - [window.unsetRelativeMouseMode()](#windowunsetrelativemousemode)
    - [window.render(width, height, stride, format, buffer[, options])](#windowrenderwidth-height-stride-format-buffer-options)
    - [window.setIcon(width, height, stride, format, buffer)](#windowseticonwidth-height-stride-format-buffer)
    - [window.flash([untilFocused])](#windowflashuntilfocused)
    - [window.stopFlashing()](#windowstopflashing)
    - [window.destroyed](#windowdestroyed)
    - [window.destroy()](#windowdestroy)
    - [window.destroyGently()](#windowdestroygently)
- [sdl.keyboard](#sdlkeyboard)
  - [Virtual keys](#virtual-keys)
  - [Enum: SCANCODE](#enum-scancode)
  - [Event: 'keymapChange'](#event-keymapchange)
  - [sdl.keyboard.getKey(scancode)](#sdlkeyboardgetkeyscancode)
  - [sdl.keyboard.getScancode(key)](#sdlkeyboardgetscancodekey)
  - [sdl.keyboard.getState()](#sdlkeyboardgetstate)
- [sdl.mouse](#sdlmouse)
  - [Enum: BUTTON](#enum-button)
  - [sdl.mouse.getButton(button)](#sdlmousegetbuttonbutton)
  - [sdl.mouse.position](#sdlmouseposition)
  - [sdl.mouse.setPosition(x, y)](#sdlmousesetpositionx-y)
  - [sdl.mouse.setCursor(cursor)](#sdlmousesetcursorcursor)
  - [sdl.mouse.resetCursor()](#sdlmouseresetcursor)
  - [sdl.mouse.setCursorImage(width, height, stride, format, buffer, x, y)](#sdlmousesetcursorimagewidth-height-stride-format-buffer-x-y)
  - [sdl.mouse.showCursor([show])](#sdlmouseshowcursorshow)
  - [sdl.mouse.hideCursor()](#sdlmousehidecursor)
  - [sdl.mouse.redrawCursor()](#sdlmouseredrawcursor)
  - [sdl.mouse.captured](#sdlmousecaptured)
  - [sdl.mouse.capture([capture])](#sdlmousecapturecapture)
  - [sdl.mouse.uncapture()](#sdlmouseuncapture)
- [sdl.touch](#sdltouch)
  - [sdl.touch.devices](#sdltouchdevices)
- [sdl.joystick](#sdljoystick)
  - [Hat positions](#hat-positions)
  - [Event: 'deviceAdd'](#joystick-event-deviceadd)
  - [Event: 'deviceRemove'](#joystick-event-deviceremove)
  - [sdl.joystick.devices](#sdljoystickdevices)
  - [sdl.joystick.openDevice(device)](#sdljoystickopendevicedevice)
  - [class JoystickInstance](#class-joystickinstance)
    - [Event: 'axisMotion'](#joystick-instance-event-axismotion)
    - [Event: 'ballMotion'](#event-ballmotion)
    - [Event: 'buttonDown'](#joystick-instance-event-buttondown)
    - [Event: 'buttonUp'](#joystick-instance-event-buttonup)
    - [Event: 'hatMotion'](#event-hatmotion)
    - [Event: 'powerUpdate'](#joystick-instance-event-power-update)
    - [Event: 'close'](#joystick-instance-event-close)
    - [joystickInstance.device](#joystickinstancedevice)
    - [joystickInstance.firmwareVersion](#joystickinstancefirmwareversion)
    - [joystickInstance.serialNumber](#joystickinstanceserialnumber)
    - [joystickInstance.axes](#joystickinstanceaxes)
    - [joystickInstance.balls](#joystickinstanceballs)
    - [joystickInstance.buttons](#joystickinstancebuttons)
    - [joystickInstance.hats](#joystickinstancehats)
    - [joystickInstance.power](#joystickinstancepower)
    - [joystickInstance.setPlayer(index)](#joystickinstancesetplayerindex)
    - [joystickInstance.resetPlayer()](#joystickinstanceresetplayer)
    - [joystickInstance.hasLed](#joystickinstancehasled)
    - [joystickInstance.setLed(red, green, blue)](#joystickinstancesetledred-green-blue)
    - [joystickInstance.hasRumble](#joystickinstancehasrumble)
    - [joystickInstance.rumble([low[, high[, duration]]])](#joystickinstancerumblelow-high-duration)
    - [joystickInstance.stopRumble()](#joystickinstancestoprumble)
    - [joystickInstance.hasRumbleTriggers](#joystickinstancehasrumbletriggers)
    - [joystickInstance.rumbleTriggers([left[, right[, duration]]])](#joystickinstancerumbletriggersleft-right-duration)
    - [joystickInstance.stopRumbleTriggers()](#joystickinstancestoprumbletriggers)
    - [joystickInstance.closed](#joystickinstanceclosed)
    - [joystickInstance.close()](#joystickinstanceclose)
- [sdl.gamepad](#sdlgamepad)
  - [Event: 'deviceAdd'](#gamepad-event-deviceadd)
  - [Event: 'deviceRemove'](#gamepad-event-deviceremove)
  - [sdl.gamepad.addMappings(mappings)](#sdlgamepadaddmappingsmappings)
  - [sdl.gamepad.devices](#sdlgamepaddevices)
  - [sdl.gamepad.openDevice(device)](#sdlgamepadopendevicedevice)
  - [class GamepadInstance](#class-gamepadinstance)
    - [Event: 'axisMotion'](#gamepad-instance-event-axismotion)
    - [Event: 'buttonDown'](#gamepad-instance-event-buttondown)
    - [Event: 'buttonUp'](#gamepad-instance-event-buttonup)
    - [Event: 'powerUpdate'](#gamepad-instance-event-power-update)
    - [Event: 'steamHandleUpdate'](#event-steamhandleupdate)
    - [Event: 'remap'](#event-remap)
    - [Event: 'close'](#gamepad-instance-event-close)
    - [gamepadInstance.device](#gamepadinstancedevice)
    - [gamepadInstance.firmwareVersion](#gamepadinstancefirmwareversion)
    - [gamepadInstance.serialNumber](#gamepadinstanceserialnumber)
    - [gamepadInstance.steamHandle](#gamepadinstancesteamhandle)
    - [gamepadInstance.axes](#gamepadinstanceaxes)
    - [gamepadInstance.buttons](#gamepadinstancebuttons)
    - [gamepadInstance.buttonLabels](#gamepadinstancebuttonlabels)
    - [gamepadInstance.power](#gamepadinstancepower)
    - [gamepadInstance.setPlayer(index)](#gamepadinstancesetplayerindex)
    - [gamepadInstance.resetPlayer()](#gamepadinstanceresetplayer)
    - [gamepadInstance.hasLed](#gamepadinstancehasled)
    - [gamepadInstance.setLed(red, green, blue)](#gamepadinstancesetledred-green-blue)
    - [gamepadInstance.hasRumble](#gamepadinstancehasrumble)
    - [gamepadInstance.rumble([low[, high[, duration]]])](#gamepadinstancerumblelow-high-duration)
    - [gamepadInstance.stopRumble()](#gamepadinstancestoprumble)
    - [gamepadInstance.hasRumbleTriggers](#gamepadinstancehasrumbletriggers)
    - [gamepadInstance.rumbleTriggers([left[, right[, duration]]])](#gamepadinstancerumbletriggersleft-right-duration)
    - [gamepadInstance.stopRumbleTriggers()](#gamepadinstancestoprumbletriggers)
    - [gamepadInstance.closed](#gamepadinstanceclosed)
    - [gamepadInstance.close()](#gamepadinstanceclose)
- [sdl.sensor](#sdlsensor)
  - [sdl.sensor.STANDARD_GRAVITY](#sdlsensorstandard_gravity)
  - [sdl.sensor.devices](#sdlsensordevices)
  - [sdl.sensor.openDevice(device)](#sdlsensoropendevicedevice)
  - [class SensorInstance](#class-sensorinstance)
    - [Event: 'update'](#sensor-instance-event-update)
    - [Event: 'close'](#sensor-instance-event-close)
    - [sensorInstance.device](#sensorinstancedevice)
    - [sensorInstance.data](#sensorinstancedata)
    - [sensorInstance.closed](#sensorinstanceclosed)
    - [sensorInstance.close()](#sensorinstanceclose)
- [sdl.audio](#sdlaudio)
  - [Audio data](#audio-data)
  - [Sample formats](#sample-formats)
  - [sdl.audio.bytesPerSample(format)](#sdlaudiobytespersampleformat)
  - [sdl.audio.minSampleValue(format)](#sdlaudiominsamplevalueformat)
  - [sdl.audio.maxSampleValue(format)](#sdlaudiomaxsamplevalueformat)
  - [sdl.audio.zeroSampleValue(format)](#sdlaudiozerosamplevalueformat)
  - [sdl.audio.readSample(format, buffer[, offset])](#sdlaudioreadsampleformat-buffer-offset)
  - [sdl.audio.writeSample(format, buffer, value[, offset])](#sdlaudiowritesampleformat-buffer-value-offset)
  - [sdl.audio.playback](#sdlaudioplayback)
    - [Event: 'deviceAdd'](#audio-playback-event-deviceadd)
    - [Event: 'deviceRemove'](#audio-playback-event-deviceremove)
    - [sdl.audio.playback.devices](#sdlaudioplaybackdevices)
    - [sdl.audio.playback.openDevice([device[, options]])](#sdlaudioplaybackopendevicedevice-options)
  - [sdl.audio.recording](#sdlaudiorecording)
    - [Event: 'deviceAdd'](#audio-recording-event-deviceadd)
    - [Event: 'deviceRemove'](#audio-recording-event-deviceremove)
    - [sdl.audio.recording.devices](#sdlaudiorecordingdevices)
    - [sdl.audio.recording.openDevice([device[, options]])](#sdlaudiorecordingopendevicedevice-options)
  - [class AudioStream](#class-audiostream)
    - [Event: 'close'](#audio-stream-event-close)
    - [audioStream.id](#audiostreamid)
    - [audioStream.device](#audiostreamdevice)
    - [audioStream.channels](#audiostreamchannels)
    - [audioStream.frequency](#audiostreamfrequency)
    - [audioStream.format](#audiostreamformat)
    - [audioStream.bytesPerSample](#audiostreambytespersample)
    - [audioStream.minSampleValue](#audiostreamminsamplevalue)
    - [audioStream.maxSampleValue](#audiostreammaxsamplevalue)
    - [audioStream.zeroSampleValue](#audiostreamzerosamplevalue)
    - [audioStream.readSample(buffer[, offset])](#audiostreamreadsamplebuffer-offset)
    - [audioStream.writeSample(buffer, value[, offset])](#audiostreamwritesamplebuffer-value-offset)
    - [audioStream.buffered](#audiostreambuffered)
    - [audioStream.playing](#audiostreamplaying)
    - [audioStream.play([play])](#audiostreamplayplay)
    - [audioStream.pause()](#audiostreampause)
    - [audioStream.clear()](#audiostreamclear)
    - [audioStream.closed](#audiostreamclosed)
    - [audioStream.close()](#audiostreamclose)
  - [class AudioPlaybackStream extends AudioStream](#class-audioplaybackstream-extends-audiostream)
    - [playbackStream.queued](#playbackstreamqueued)
    - [playbackStream.putData(buffer[, bytes])](#playbackstreamputdatabuffer-bytes)
  - [class AudioRecordingStream extends AudioStream](#class-audiorecordingstream-extends-audiostream)
    - [recordingStream.available](#recordingstreamavailable)
    - [recordingStream.getData(buffer[, bytes])](#recordingstreamgetdatabuffer-bytes)
- [sdl.clipboard](#sdlclipboard)
  - [Event: 'update'](#clipboard-event-update)
  - [sdl.clipboard.text](#sdlclipboardtext)
  - [sdl.clipboard.setText(text)](#sdlclipboardsettexttext)
- [sdl.power](#sdlpower)
  - [sdl.power.info](#sdlpowerinfo)
- [helpers](#helpers)

## sdl

Unless noted otherwise, wherever the API expects a whole-number quantity (positions, sizes, strides, indices, durations), the value must be an integer that fits in 32 bits.

### sdl.info

- `<object>`
  - `version: <object>`
    - `compile: <object>` The version of the SDL library that this package was compiled against.
      - `major, minor, patch: <Semver>` The components of the version.
    - `runtime: <object>` The version of the SDL library that was found and loaded at runtime.
      - `major, minor, patch: <Semver>` The components of the version.
  - `platform: <string>` The name of the platform we are running on. Possible values are: `'Linux'`, `'Windows'`, and `'Mac OS X'`.
  - `drivers: <object>`
    - `video: <object>`
      - `all: <string>[]` A list of all video drivers.
      - `current: <string>|<null>` The video driver that is currently selected.
    - `audio: <object>`
      - `all: <string>[]` A list of all audio drivers.
      - `current: <string>|<null>` The audio driver that is currently selected.
  - `initialized: <object>`
    - `video: <boolean>`: Is `true` if the video subsystem was successfully initialized, or `false` otherwise.
    - `audio: <boolean>`: Is `true` if the audio subsystem was successfully initialized, or `false` otherwise.
    - `joystick: <boolean>`: Is `true` if the joystick subsystem was successfully initialized, or `false` otherwise.
    - `gamepad: <boolean>`: Is `true` if the gamepad subsystem was successfully initialized, or `false` otherwise.
    - `haptic: <boolean>`: Is `true` if the haptic subsystem was successfully initialized, or `false` otherwise.
    - `sensor: <boolean>`: Is `true` if the sensor subsystem was successfully initialized, or `false` otherwise.

The `sdl.info` object is filled with information produced during the initialization of SDL.
All the values remain constant throughout the execution of the program.

To initialize SDL with video/audio drivers other than the default ones, set the appropriate [environment variables](https://wiki.libsdl.org/FAQUsingSDL) to the desired value.

Note that the `current` video or audio driver may be `null`.
This usually happens on systems that don't have any compatible devices, such as on a CI pipeline.

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
  initialized: {
    video: true,
    audio: true,
    joystick: true,
    gamepad: true,
    haptic: true,
    sensor: true,
  },
}
```

### Event Emitters

Objects that emit events (`sdl.video`, `sdl.keyboard`, `sdl.joystick`, `sdl.gamepad`, `sdl.audio.playback`, `sdl.audio.recording`, `sdl.clipboard`, [`Windows`](#class-window), and opened device instances and audio streams) are Node.js [`EventEmitters`](https://nodejs.org/api/events.html), so the usual `on()`, `once()`, `off()`, `removeAllListeners()`, e.t.c. all work.
Only the event names listed in this document are valid for each object.
Attaching a listener for any other event name throws.

Every emitter additionally supports the special `'*'` event.
Listeners registered for `'*'` receive every event the object emits, with the event's name as an extra first argument:

```js
window.on('*', (type, event) => { console.log(type, event) })
```

If one of your listeners throws, the exception is caught and re-emitted as an `'error'` event on the same object.
As with any `EventEmitter`, if there is no `'error'` listener the exception is rethrown, usually ending up as an uncaught exception.

## sdl.video

### Image data

There are 3 places in the API where you must provide an image to the library:

- [`window.render()`](#windowrenderwidth-height-stride-format-buffer-options)
- [`window.setIcon()`](#windowseticonwidth-height-stride-format-buffer)
- [`mouse.setCursorImage()`](#sdlmousesetcursorimagewidth-height-stride-format-buffer-x-y)

All three of these functions accept the image as a series of arguments:

- `width: <number>` The width of the image in pixels.
- `height: <number>` The height of the image in pixels.
- `stride: <number>` How many bytes each row of the image takes up in the buffer. Usually equal to `width * bytesPerPixel`, but may be larger if the rows of the buffer are padded to always be some multiple of bytes.
- `format: `[`<PixelFormat>`](#pixel-formats) The binary representation of the data in the buffer.
- `buffer: <Buffer>` Holds the actual pixel data for the image, in the format and layout specified by all the above arguments.

The `stride` must be at least `width * `[`sdl.video.bytesPerPixel(format)`](#sdlvideobytesperpixelformat), and the `buffer` must be at least [`sdl.video.minBufferSize(format, stride, height)`](#sdlvideominbuffersizeformat-stride-height) bytes long, otherwise the call throws.

So, for example, to fill the window with a red+green gradient you could do:

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

### High-DPI

On a high-dpi display, windows have more pixels than their `width` and `height` would indicate.
On such systems `width` and `height` (and all other measurements such as `x` and `y`) are measured in "points" instead of pixels.
Points are an abstract unit of measurement and don't necessarily correspond to pixels.
If you need to work with pixels, you can use the window's `pixelWidth` and `pixelHeight` properties.
You usually need these values when creating a "surface" that will be displayed on the window, such as a Buffer, Canvas, or 3D rendering viewport.
I recommend that in these cases you always use `pixelWidth` and `pixelHeight`, since you don't know beforehand if your program will be running on a high-dpi system or not.

### Pixel formats

String values used to represent how the pixels of an image are stored in a Buffer.

| Value           | Corresponding `SDL_PixelFormat`     | Comment                                                                                      |
| ---             | ---                                 | ---                                                                                          |
| `'rgb332'`      | `SDL_PIXELFORMAT_RGB332`            |                                                                                              |
| `'xrgb4444'`    | `SDL_PIXELFORMAT_XRGB4444`          |                                                                                              |
| `'xbgr4444'`    | `SDL_PIXELFORMAT_XBGR4444`          |                                                                                              |
| `'xrgb1555'`    | `SDL_PIXELFORMAT_XRGB1555`          |                                                                                              |
| `'xbgr1555'`    | `SDL_PIXELFORMAT_XBGR1555`          |                                                                                              |
| `'argb4444'`    | `SDL_PIXELFORMAT_ARGB4444`          |                                                                                              |
| `'rgba4444'`    | `SDL_PIXELFORMAT_RGBA4444`          |                                                                                              |
| `'abgr4444'`    | `SDL_PIXELFORMAT_ABGR4444`          |                                                                                              |
| `'bgra4444'`    | `SDL_PIXELFORMAT_BGRA4444`          |                                                                                              |
| `'argb1555'`    | `SDL_PIXELFORMAT_ARGB1555`          |                                                                                              |
| `'rgba5551'`    | `SDL_PIXELFORMAT_RGBA5551`          |                                                                                              |
| `'abgr1555'`    | `SDL_PIXELFORMAT_ABGR1555`          |                                                                                              |
| `'bgra5551'`    | `SDL_PIXELFORMAT_BGRA5551`          |                                                                                              |
| `'rgb565'`      | `SDL_PIXELFORMAT_RGB565`            |                                                                                              |
| `'bgr565'`      | `SDL_PIXELFORMAT_BGR565`            |                                                                                              |
| `'rgb24'`       | `SDL_PIXELFORMAT_RGB24`             |                                                                                              |
| `'bgr24'`       | `SDL_PIXELFORMAT_BGR24`             |                                                                                              |
| `'xrgb8888'`    | `SDL_PIXELFORMAT_XRGB8888`          |                                                                                              |
| `'rgbx8888'`    | `SDL_PIXELFORMAT_RGBX8888`          |                                                                                              |
| `'xbgr8888'`    | `SDL_PIXELFORMAT_XBGR8888`          |                                                                                              |
| `'bgrx8888'`    | `SDL_PIXELFORMAT_BGRX8888`          |                                                                                              |
| `'argb8888'`    | `SDL_PIXELFORMAT_ARGB8888`          |                                                                                              |
| `'rgba8888'`    | `SDL_PIXELFORMAT_RGBA8888`          |                                                                                              |
| `'abgr8888'`    | `SDL_PIXELFORMAT_ABGR8888`          |                                                                                              |
| `'bgra8888'`    | `SDL_PIXELFORMAT_BGRA8888`          |                                                                                              |
| `'argb2101010'` | `SDL_PIXELFORMAT_ARGB2101010`       |                                                                                              |
| `'xrgb2101010'` | `SDL_PIXELFORMAT_XRGB2101010`       |                                                                                              |
| `'xbgr2101010'` | `SDL_PIXELFORMAT_XBGR2101010`       |                                                                                              |
| `'abgr2101010'` | `SDL_PIXELFORMAT_ABGR2101010`       |                                                                                              |
| `'rgb48'`       | `SDL_PIXELFORMAT_RGB48`             | 16-bit integer per channel                                                                   |
| `'bgr48'`       | `SDL_PIXELFORMAT_BGR48`             | 16-bit integer per channel                                                                   |
| `'rgba64'`      | `SDL_PIXELFORMAT_RGBA64`            | 16-bit integer per channel                                                                   |
| `'argb64'`      | `SDL_PIXELFORMAT_ARGB64`            | 16-bit integer per channel                                                                   |
| `'bgra64'`      | `SDL_PIXELFORMAT_BGRA64`            | 16-bit integer per channel                                                                   |
| `'abgr64'`      | `SDL_PIXELFORMAT_ABGR64`            | 16-bit integer per channel                                                                   |
| `'rgb48f'`      | `SDL_PIXELFORMAT_RGB48_FLOAT`       | 16-bit float per channel                                                                     |
| `'bgr48f'`      | `SDL_PIXELFORMAT_BGR48_FLOAT`       | 16-bit float per channel                                                                     |
| `'rgba64f'`     | `SDL_PIXELFORMAT_RGBA64_FLOAT`      | 16-bit float per channel                                                                     |
| `'argb64f'`     | `SDL_PIXELFORMAT_ARGB64_FLOAT`      | 16-bit float per channel                                                                     |
| `'bgra64f'`     | `SDL_PIXELFORMAT_BGRA64_FLOAT`      | 16-bit float per channel                                                                     |
| `'abgr64f'`     | `SDL_PIXELFORMAT_ABGR64_FLOAT`      | 16-bit float per channel                                                                     |
| `'rgb96f'`      | `SDL_PIXELFORMAT_RGB96_FLOAT`       | 32-bit float per channel                                                                     |
| `'bgr96f'`      | `SDL_PIXELFORMAT_BGR96_FLOAT`       | 32-bit float per channel                                                                     |
| `'rgba128f'`    | `SDL_PIXELFORMAT_RGBA128_FLOAT`     | 32-bit float per channel                                                                     |
| `'argb128f'`    | `SDL_PIXELFORMAT_ARGB128_FLOAT`     | 32-bit float per channel                                                                     |
| `'bgra128f'`    | `SDL_PIXELFORMAT_BGRA128_FLOAT`     | 32-bit float per channel                                                                     |
| `'abgr128f'`    | `SDL_PIXELFORMAT_ABGR128_FLOAT`     | 32-bit float per channel                                                                     |
| `'rgba32'`      | `SDL_PIXELFORMAT_RGBA32`            | alias for `'rgba8888'` on big endian machines and for `'abgr8888'` on little endian machines |
| `'argb32'`      | `SDL_PIXELFORMAT_ARGB32`            | alias for `'argb8888'` on big endian machines and for `'bgra8888'` on little endian machines |
| `'bgra32'`      | `SDL_PIXELFORMAT_BGRA32`            | alias for `'bgra8888'` on big endian machines and for `'argb8888'` on little endian machines |
| `'abgr32'`      | `SDL_PIXELFORMAT_ABGR32`            | alias for `'abgr8888'` on big endian machines and for `'rgba8888'` on little endian machines |
| `'rgbx32'`      | `SDL_PIXELFORMAT_RGBX32`            | alias for `'rgbx8888'` on big endian machines and for `'xbgr8888'` on little endian machines |
| `'xrgb32'`      | `SDL_PIXELFORMAT_XRGB32`            | alias for `'xrgb8888'` on big endian machines and for `'bgrx8888'` on little endian machines |
| `'bgrx32'`      | `SDL_PIXELFORMAT_BGRX32`            | alias for `'bgrx8888'` on big endian machines and for `'xrgb8888'` on little endian machines |
| `'xbgr32'`      | `SDL_PIXELFORMAT_XBGR32`            | alias for `'xbgr8888'` on big endian machines and for `'rgbx8888'` on little endian machines |
| `'yv12'`        | `SDL_PIXELFORMAT_YV12`              | planar mode: Y + V + U (3 planes)                                                            |
| `'iyuv'`        | `SDL_PIXELFORMAT_IYUV`              | planar mode: Y + U + V (3 planes)                                                            |
| `'yuy2'`        | `SDL_PIXELFORMAT_YUY2`              | packed mode: Y0+U0+Y1+V0 (1 plane)                                                           |
| `'uyvy'`        | `SDL_PIXELFORMAT_UYVY`              | packed mode: U0+Y0+V0+Y1 (1 plane)                                                           |
| `'yvyu'`        | `SDL_PIXELFORMAT_YVYU`              | packed mode: Y0+V0+Y1+U0 (1 plane)                                                           |
| `'nv12'`        | `SDL_PIXELFORMAT_NV12`              | planar mode: Y + U/V interleaved (2 planes)                                                  |
| `'nv21'`        | `SDL_PIXELFORMAT_NV21`              | planar mode: Y + V/U interleaved (2 planes)                                                  |
| `'p010'`        | `SDL_PIXELFORMAT_P010`              | planar mode: 10-bit Y + U/V interleaved in 16-bit samples (2 planes), rejected by `window.render()` |

### Event: 'displayAdd'

- `device: <object>`: An object from [`sdl.video.displays`](#sdlvideodisplays) indicating the display that caused the event.

Fired when a display is added to the system.
Check [`sdl.video.displays`](#sdlvideodisplays) to get the new list of displays.

### Event: 'displayRemove'

- `device: <object>`: An object from [`sdl.video.displays`](#sdlvideodisplays) indicating the display that caused the event.

Fired when a display is removed from the system.
Check [`sdl.video.displays`](#sdlvideodisplays) to get the new list of displays.

### Event: 'displayOrient'

- `device: <object>`: An object from [`sdl.video.displays`](#sdlvideodisplays) indicating the display that caused the event.
- `orientation: <string>|<null>`: The display's new orientation, or `null` if it is unknown.

Fired when a display changes orientation.

### Event: 'displayMove'

- `device: <object>`: An object from [`sdl.video.displays`](#sdlvideodisplays) indicating the display that caused the event.

Fired when a display changes position.

### Event: 'displayScaleChange'

- `device: <object>`: An object from [`sdl.video.displays`](#sdlvideodisplays) indicating the display that caused the event.
- `scale: <number>|<null>`: The display's new `scale`, or `null` if it can't be determined.

Fired when a display changes content scale.

### Event: 'displayModeChange'

- `device: <object>`: An object from [`sdl.video.displays`](#sdlvideodisplays) indicating the display that caused the event.
- `format: `[`<PixelFormat>`](#pixel-formats)`|<null>`: The display's new pixel format, or `null` if it can't be determined.
- `frequency: <number>`: The display's new refresh rate.
- `geometry: <object>`: The display's new `geometry`, since the mode determines its size.
  - `x, y, width, height: <Rect>` The position and size of the display's geometry.

Fired when a display changes its current mode.

### Event: 'displayUsableChange'

- `device: <object>`: An object from [`sdl.video.displays`](#sdlvideodisplays) indicating the display that caused the event.

Fired when a display's `usable` region changes, for example when a dock or taskbar is shown, hidden, or moved.

### sdl.video.bytesPerPixel(format)

- `format: `[`<PixelFormat>`](#pixel-formats): The pixel format.
- Returns: `<number>` The number of bytes.

Helper function which maps each pixel format to the number of bytes each of its pixels takes up.
For planar YUV formats this refers to the Y plane, so it is `1`.

This function is also available from `@kmamal/sdl/helpers`.

### sdl.video.isYuv(format)

- `format: `[`<PixelFormat>`](#pixel-formats): The pixel format.
- Returns: `<boolean>` Is `true` if the format is one of the YUV formats.

Helper function which tells RGB formats apart from YUV ones.
Only RGB formats can be used with [`window.setIcon()`](#windowseticonwidth-height-stride-format-buffer) and [`sdl.mouse.setCursorImage()`](#sdlmousesetcursorimagewidth-height-stride-format-buffer-x-y).

This function is also available from `@kmamal/sdl/helpers`.

### sdl.video.isPlanarYuv(format)

- `format: `[`<PixelFormat>`](#pixel-formats): The pixel format.
- Returns: `<boolean>` Is `true` if the format is a planar YUV format.

Helper function which tells planar YUV formats (where the Y, U, and V components are stored in separate planes) apart from all others.

This function is also available from `@kmamal/sdl/helpers`.

### sdl.video.minBufferSize(format, stride, height)

- `format: `[`<PixelFormat>`](#pixel-formats): The pixel format.
- `stride: <number>` How many bytes each row of the image takes up.
- `height: <number>` The height of the image in pixels.
- Returns: `<number>` The minimum number of bytes.

Helper function which computes the smallest buffer that can hold an image with the given format, stride, and height.
For most formats this is just `stride * height`.
For planar YUV formats it also accounts for the chroma planes.
The functions that accept [image data](#image-data) throw if the buffer they are given is smaller than this.

This function is also available from `@kmamal/sdl/helpers`.

### sdl.video.displays

- `<object>[]`
  - `id: <number>` The unique id of the display. Ids are never reused: a display that is disconnected and reconnected gets a new id.
  - `name: <string>|<null>` The name of the display, or `null` if it can't be determined.
  - `format: `[`<PixelFormat>`](#pixel-formats)`|<null>` The pixel format of the display. Is `null` if it can't be determined.
  - `frequency: <number>` The refresh rate of the display.
  - `geometry: <object>` The desktop region represented by the display.
    - `x, y, width, height: <Rect>` The position and size of the display's geometry.
  - `usable: <object>` Similar to `geometry`, but excludes areas taken up by the OS or window manager such as menus, docks, e.t.c.
    - `x, y, width, height: <Rect>` The position and size of the display's usable region.
  - `scale: <number>|<null>` The content scale of the display: how much larger UI elements should be drawn to appear at their intended size, where `1` is the 96dpi baseline. Might be `null` on some devices if it can't be retrieved.
  - `orientation: <string>|<null>` The orientation of the display.

A list of all detected displays.

Possible values for `orientation` are `null` if it is unknown, or one of:

| Value                | Corresponding `SDL_DisplayOrientation` |
| ---                  | ---                                    |
| `'landscape'`        | `SDL_ORIENTATION_LANDSCAPE`            |
| `'landscapeFlipped'` | `SDL_ORIENTATION_LANDSCAPE_FLIPPED`    |
| `'portrait'`         | `SDL_ORIENTATION_PORTRAIT`             |
| `'portraitFlipped'`  | `SDL_ORIENTATION_PORTRAIT_FLIPPED`     |

Sample output for two side-to-side monitors is below.
Notice how the geometries don't overlap:

```js
[
  {
    name: '0',
    format: 'xrgb8888',
    frequency: 60,
    geometry: { x: 0, y: 0, width: 1920, height: 1080 },
    usable: { x: 0, y: 27, width: 1920, height: 1053 },
    scale: 1.5,
    orientation: 'landscape',
  },
  {
    name: '1',
    format: 'xrgb8888',
    frequency: 60,
    geometry: { x: 1920, y: 0, width: 1920, height: 1080 },
    usable: { x: 1920, y: 27, width: 1920, height: 1053 },
    scale: 1.5,
    orientation: 'landscape',
  },
]
```

### sdl.video.windows

- [`<Window>`](#class-window)`[]`

A list of all open windows.

### sdl.video.focused

- [`<Window>`](#class-window)`|<null>`

The window that has the current keyboard focus, or `null` if no window has the keyboard focus.

### sdl.video.hovered

- [`<Window>`](#class-window)`|<null>`

The window that the mouse is hovered over, or `null` if the mouse is not over a window.

### sdl.video.createWindow([options])

- `options: <object>`
  - `title: <string>` Appears in the window's title bar. Default: `''`
  - `display: <object>` An object from `sdl.video.displays` to specify in which display the window should appear (if you have multiple displays). Default: `sdl.video.displays[0]`
  - `x: <number>` The x position in which the window should appear relative to the screen, or `null` for centered. Default: `null`
  - `y: <number>` The y position in which the window should appear relative to the screen, or `null` for centered. Default: `null`
  - `width: <number>` The width of the window. Default: `640`
  - `height: <number>` The height of the window. Default: `480`
  - `visible: <boolean>` Set to `false` to create a hidden window that will only be shown when you call [`window.show()`](#windowshowshow). Default: `true`
  - `fullscreen: <boolean>` Set to `true` to create the window in fullscreen mode. Default: `false`
  - `resizable: <boolean>` Set to `true` to allow resizing the window by dragging its borders. Default: `false`
  - `borderless: <boolean>` Set to `true` to completely hide the window's borders and title bar. Default: `false`
  - `alwaysOnTop: <boolean>` Set to `true` to always show the window above others. Default: `false`
  - `accelerated: <boolean>` Set to `false` to disable hardware accelerated rendering. Default: `true`
  - `vsync: <boolean>` Set to `false` to disable frame rate synchronization. Default: `true`
  - `opengl: <boolean>` Set to `true` to create an OpenGL-compatible window (for use with [@kmamal/gl](https://github.com/kmamal/headless-gl#readme)). Default: `false`
  - `webgpu: <boolean>` Set to `true` to create an WebGPU-compatible window (for use with [@kmamal/gpu](https://github.com/kmamal/gpu#readme)). Default: `false`
- Returns: [`<Window>`](#class-window) an object representing the new window.

Creates a new window.

The following restrictions apply:

- The `display` option is mutually exclusive with the `x` and `y` options.
- The `resizable` and `borderless` options are mutually exclusive.
- The `opengl` and `webgpu` options are mutually exclusive.
- The `vsync` option only applies to windows that are also `accelerated`.
- The `accelerated` and `vsync` options have no effect if either `opengl` or `webgpu` is also specified.

If you set the `opengl` or `webgpu` options, then you must use OpenGL/WebGPU calls to render to the window.
Calls to [`render()`](#windowrenderwidth-height-stride-format-buffer-options) will fail.

## class Window

The `Window` class is not directly exposed by the API so you can't (and shouldn't) use it with the `new` operator.
Instead, objects returned by [`sdl.video.createWindow()`](#sdlvideocreatewindowoptions) are of type `Window`.

### Event: 'show'

Fired when the window becomes visible.

### Event: 'hide'

Fired when the window becomes hidden.

### Event: 'expose'

Fired when the window becomes exposed and should be redrawn.

### Event: 'minimize'

Fired when the window becomes minimized.

### Event: 'maximize'

Fired when the window becomes maximized.

### Event: 'restore'

Fired when the window gets restored.

### Event: 'move'

- `x: <number>` The window's new x position, relative to the screen.
- `y: <number>` The window's new y position, relative to the screen.

Fired when the window changes position.

### Event: 'resize'

- `width: <number>` The window's new width.
- `height: <number>` The window's new height.
- `pixelWidth: <number>` The window's new width in pixels. See [high-dpi](#high-dpi).
- `pixelHeight: <number>` The window's new height in pixels. See [high-dpi](#high-dpi).

Fired when the window changes size.

### Event: 'displayChange'

- `display: <object>|<null>` An object from [`sdl.video.displays`](#sdlvideodisplays) indicating the window's new display, or `null` if that display has been removed.

Fired when the window moves from one display to another.

### Event: 'focus'

Fired when the window gains the keyboard focus.

### Event: 'blur'

Fired when the window loses the keyboard focus.

### Event: 'hover'

Fired when the mouse enters the window.

### Event: 'leave'

Fired when the mouse leaves the window.

### Event: 'beforeClose'

- `prevent: <function (void) => void>` Call this function to prevent the window from closing.

Fired to indicate that the user requested that the window should close (usually by clicking the "x" button).
If you need to display any confirmation dialogs, call `event.prevent()` and afterwards handle destruction manually.
If `prevent` is not called, then the `beforeClose` event will be followed by a [`'close'`](#event-close) event.

### Event: 'close'

Indicates that the window is about to be destroyed.
Handle any cleanup here.

### Event: 'keyDown'

- `scancode: `[`<Scancode>`](#enum-scancode) The scancode of the key that caused the event.
- `key: `[`<Key>`](#virtual-keys)`|<null>` The virtual key that caused the event, or `null` if the physical key does not correspond to any virtual key.
- `repeat: <boolean>` Is `true` if the event was generated by holding down a key for a long time.
- `shift: <boolean>` Is `true` if the Shift key was pressed when the event was generated.
- `ctrl: <boolean>` Is `true` if the Ctrl key was pressed when the event was generated.
- `alt: <boolean>` Is `true` if the Alt key was pressed when the event was generated.
- `super: <boolean>` Is `true` if the "Windows" key was pressed when the event was generated.
- `altgr: <boolean>` Is `true` if the AltGr key was pressed when the event was generated.
- `capslock: <boolean>` Is `true` if CapsLock was active when the event was generated.
- `numlock: <boolean>` Is `true` if NumLock was active when the event was generated.

Fired when a key is pressed, and will also be fired repeatedly afterwards if the key is held down.

### Event: 'keyUp'

- `scancode: `[`<Scancode>`](#enum-scancode) The scancode of the key that caused the event.
- `key: `[`<Key>`](#virtual-keys)`|<null>` The virtual key that caused the event, or `null` if the physical key does not correspond to any virtual key.
- `shift: <boolean>` Is `true` if the Shift key was pressed when the event was generated.
- `ctrl: <boolean>` Is `true` if the Ctrl key was pressed when the event was generated.
- `alt: <boolean>` Is `true` if the Alt key was pressed when the event was generated.
- `super: <boolean>` Is `true` if the "Windows" key was pressed when the event was generated.
- `altgr: <boolean>` Is `true` if the AltGr key was pressed when the event was generated.
- `capslock: <boolean>` Is `true` if CapsLock was active when the event was generated.
- `numlock: <boolean>` Is `true` if NumLock was active when the event was generated.

Fired when a key is released.

### Event: 'textInput'

- `text: <string>` The unicode representation of the character that was entered.

Fired when text is entered via the keyboard.

### Event: 'mouseButtonDown'

- `x: <number>` The mouse's x position when the event happened, relative to the window.
- `y: <number>` The mouse's y position when the event happened, relative to the window.
- `touch: <boolean>` Is `true` if the event was caused by a touch event.
- `button: `[`<sdl.mouse.BUTTON>`](#enum-button) The button that was pressed.

Fired when a mouse button is pressed.

### Event: 'mouseButtonUp'

- `x: <number>` The mouse's x position when the event happened, relative to the window.
- `y: <number>` The mouse's y position when the event happened, relative to the window.
- `touch: <boolean>` Is `true` if the event was caused by a touch event.
- `button: `[`<sdl.mouse.BUTTON>`](#enum-button) The button that was released.

Fired when a mouse button is released.

### Event: 'mouseMove'

- `x: <number>` The mouse's x position when the event happened, relative to the window.
- `y: <number>` The mouse's y position when the event happened, relative to the window.
- `dx: <number>` The mouse's x movement, relative to its last position.
- `dy: <number>` The mouse's y movement, relative to its last position.
- `touch: <boolean>` Is `true` if the event was caused by a touch event.

Fired when the mouse moves.

### Event: 'mouseWheel'

- `x: <number>` The mouse's x position when the event happened, relative to the window.
- `y: <number>` The mouse's y position when the event happened, relative to the window.
- `touch: <boolean>` Is `true` if the event was caused by a touch event.
- `dx: <number>` The wheel's x movement, relative to its last position.
- `dy: <number>` The wheel's y movement, relative to its last position.
- `flipped: <boolean>` Is `true` if the underlying platform reverses the mouse wheel's scroll direction. Multiply `dx` and `dy` by `-1` to get the correct values.

Fired when the mouse wheel is scrolled.

### Event: 'fingerDown'

- `device: <object>|<null>`: An object from [`sdl.touch.devices`](#sdltouchdevices) indicating the touch device that caused the event, or `null` if the event was caused by a mouse event.
- `fingerId: <bigint>` The id of the finger that coused the event.
- `x: <number>` The finger's x position when the event happened, normalized in the range from `0` to `1`.
- `y: <number>` The finger's y position when the event happened, normalized in the range from `0` to `1`.
- `pressure: <number>` The finger's pressure when the event happened, normalized in the range from `0` to `1`.
- `mouse: <boolean>` Is `true` if the event was caused by a mouse event.

Fired when a finger is presed to the touch surface.

### Event: 'fingerUp'

- `device: <object>|<null>`: An object from [`sdl.touch.devices`](#sdltouchdevices) indicating the touch device that caused the event, or `null` if the event was caused by a mouse event.
- `fingerId: <bigint>` The id of the finger that coused the event.
- `x: <number>` The finger's x position when the event happened, normalized in the range from `0` to `1`.
- `y: <number>` The finger's y position when the event happened, normalized in the range from `0` to `1`.
- `pressure: <number>` The finger's pressure when the event happened, normalized in the range from `0` to `1`.
- `mouse: <boolean>` Is `true` if the event was caused by a mouse event.

Fired when a finger is lifted from the touch surface.

### Event: 'fingerMove'

- `device: <object>|<null>`: An object from [`sdl.touch.devices`](#sdltouchdevices) indicating the touch device that caused the event, or `null` if the event was caused by a mouse event.
- `fingerId: <bigint>` The id of the finger that coused the event.
- `x: <number>` The finger's x position when the event happened, normalized in the range from `0` to `1`.
- `y: <number>` The finger's y position when the event happened, normalized in the range from `0` to `1`.
- `dx: <number>` The finger's x movement, relative to its last position, normalized in the range from `-1` to `1`.
- `dy: <number>` The finger's y movement, relative to its last position, normalized in the range from `-1` to `1`.
- `pressure: <number>` The finger's pressure when the event happened, normalized in the range from `0` to `1`.
- `mouse: <boolean>` Is `true` if the event was caused by a mouse event.

Fired when a finger moves on the touch surface.

### Event: 'dropBegin'

When you drop a set of items onto a window, first the [`'dropBegin'`](#event-dropbegin) event is fired, then a number of [`'dropText'`](#event-droptext) and/or [`'dropFile'`](#event-dropfile) events are fired, corresponding to the contents of the drop, then finally the [`'dropComplete'`](#event-dropcomplete) event is fired.

### Event: 'dropText'

- `text: <string>`: The text that was dropped onto the window.

Fired when one of the drops is a text item.

### Event: 'dropFile'

- `file: <string>`: The path to the file that was dropped onto the window.

Fired when one of the drops is a file.

### Event: 'dropComplete'

Fired after a set of items has been dropped on a window.

### window.id

- `<number>`

A unique identifier for the window.

### window.title

- `<string>`

The text that appears in the window's title bar.

### window.setTitle(title)

- `title: <string>`: The new title.

Changes the text that appears in the window's title bar.

### window.x

- `<number>`

The window's x position, relative to the screen.

### window.y

- `<number>`

The window's y position, relative to the screen.

### window.setPosition(x, y)

- `x: <number>`: The new x position, relative to the screen.
- `y: <number>`: The new y position, relative to the screen.

Moves the window to a new position on the screen.

### window.width

- `<number>`

The window's width.

### window.height

- `<number>`

The window's height.

### window.pixelWidth

- `<number>`

The window's width in pixels.
Is larger than [`width`](#windowwidth) on [high-dpi](#high-dpi) displays.

### window.pixelHeight

- `<number>`

The window's height in pixels.
Is larger than [`height`](#windowheight) on [high-dpi](#high-dpi) displays.

### window.setSize(width, height)

- `width: <number>`: The new width.
- `height: <number>`: The new height.

Changes the size of the window.

### window.setSizeInPixels(pixelWidth, pixelHeight)

- `pixelWidth: <number>`: The new width in pixels.
- `pixelHeight: <number>`: The new height in pixels.

Changes the size of the window.
This function only behaves differently from [`window.setSize()`](#windowsetsizewidth-height) for [high-dpi](#high-dpi) displays.
On such displays, `pixelWidth` and `pixelHeight` must be multiples of the window's pixel-to-point ratio (`pixelWidth / width`), otherwise the call throws.

### window.display

- `<object>|<null>`

An object from [`sdl.video.displays`](#sdlvideodisplays) indicating the display the window belongs to, or `null` if that display has been removed.
If the window spans multiple displays, then the display that contains the center of the window is returned.

### window.visible

- `<boolean>`

Is `true` if the window is visible.

### window.show([show])

- `show: <boolean>` Set to `true` to make the window visible, `false` to hide it. Default: `true`

Shows or hides the window.

### window.hide()

Equivalent to [`window.show(false)`](#windowshowshow).

### window.fullscreen

- `<boolean>`

Is `true` if the window is fullscreen.
A fullscreen window is displayed over the entire screen.

### window.setFullscreen(fullscreen)

- `fullscreen: <boolean>` The new value of the property.

Changes the window's fullscreen property.
The change is a requested asynchronously from the windowing system, which may deny it.
The `fullscreen` property updates/if once the change takes effect.

### window.resizable

- `<boolean>`

Is `true` if the window is resizable.
A resizable window can be resized by dragging its borders.

### window.setResizable(resizable)

- `resizable: <boolean>` The new value of the property.

Changes the window's resizable property.
Throws if `resizable` is `true` and the window is [`borderless`](#windowborderless), since the two properties are mutually exclusive.

### window.borderless

- `<boolean>`

Is `true` if the window is borderless.
A borderless window has no borders or title bar.

### window.setBorderless(borderless)

- `borderless: <boolean>` The new value of the property.

Changes the window's borderless property.
Throws if `borderless` is `true` and the window is [`resizable`](#windowresizable), since the two properties are mutually exclusive.

### window.alwaysOnTop

- `<boolean>`

Is `true` if the window was created with `alwaysOnTop: true`.
Such a window is always be shown above other windows.

### window.accelerated

- `<boolean>`

Is `true` if the window is using hardware accelerated rendering.

### window.setAccelerated(accelerated)

- `accelerated: <boolean>` The new value of the property.

Changes the window's accelerated property.

If you have set the `opengl` or `webgpu` options, then calls to this function will fail.

### window.vsync

- `<boolean>`

Is `true` if the window is using vsync.
Vsync synchronizes the window's frame rate with the display's refresh rate to prevent tearing.
Note that vsync can only be set to `true` if [`accelerated`](#windowaccelerated) is also `true`.

### window.setVsync(vsync)

- `vsync: <boolean>` The new value of the property.

Changes the window's vsync property.

If you have set the `opengl` or `webgpu` options, then calls to this function will fail.

### window.opengl

- `<boolean>`

Is `true` if the window was created in OpenGl mode.
In OpenGL mode, you must use OpenGL calls to render to the window.
Calls to [`render()`](#windowrenderwidth-height-stride-format-buffer-options) will fail.

### window.webgpu

- `<boolean>`

Is `true` if the window was created in WebGPU mode.
In WebGPU mode, you must use WebGPU calls to render to the window.
Calls to [`render()`](#windowrenderwidth-height-stride-format-buffer-options) will fail.

### window.native

- `<object>`
  - `handle : <Buffer>|<null>` The platform-specific handle of the window, or `null` if it can't be determined.
  - `subsystem : <string>|<null>` On Linux, either `'x11'` or `'wayland'`, depending on the video driver SDL is running under, or `null` if it's some other driver. Always `null` on other platforms.

The native type of `handle` is HWND on Windows and NSView* on macOS.

On Linux, `handle` holds a struct with the following layout, filled according to the video driver SDL is running under (check `subsystem` to see which one you're holding):

```c
struct LinuxNativeData {
	uint64_t subsystem;   // 1 = x11, 2 = wayland
	void *display;        // Display*   | wl_display*
	uintptr_t window;     // Window XID | wl_surface*
};
```

Under any other Linux video driver (e.g. kmsdrm), `handle` and `subsystem` are `null`, and windows created with `{ opengl: true }` or `{ webgpu: true }` fail with an error.

The `window.native` object might also sometimes include extra fields other than the ones documented here.
Please ignore and do not use these.
They are used internally for passing to [@kmamal/gl](https://github.com/kmamal/headless-gl#readme) or [@kmamal/gpu](https://github.com/kmamal/gpu#readme) and can change at any time.
(For maintainers: those internal fields reuse the `LinuxNativeData` layout above on Linux, with `window` holding the `wl_egl_window*` / `wl_surface*` under Wayland. The layout is an ABI contract compiled into all three packages, so changing it requires coordinated releases of `@kmamal/sdl`, `@kmamal/gl`, and `@kmamal/gpu`.)

### window.maximized

- `<boolean>`

Is `true` if the window is maximized.

### window.maximize()

Maximizes the window.
Throws if the window is not resizable.
The change is a requested asynchronously from the windowing system, which may deny it.
The `maximized` property updates/if once the change takes effect.

### window.minimized

- `<boolean>`

Is `true` if the window is minimized.

### window.minimize()

Minimizes the window.
The change is a requested asynchronously from the windowing system, which may deny it.
The `minimized` property updates/if once the change takes effect.

### window.restore()

Restores the window so it is neither minimized nor maximized.
The change is a request to the windowing system, which may apply it asynchronously or deny it.
The `minimized` and `maximized` properties update once the change has taken effect.

### window.focused

- `<boolean>`

Is `true` if the window has keyboard input.

### window.focus()

Gives the window the keyboard focus.

### window.hovered

- `<boolean>`

Is `true` if the mouse is over the window.

### window.relativeMouseMode

- `<boolean>`

Is `true` if the window has relative mouse mode enabled.

### window.setRelativeMouseMode([relative])

- `relative: <boolean>` The new value of the property. Default: `true`

Enables or disables relative mouse mode for the window.
While the window has focus in relative mode, the cursor is hidden, locked inside the window, and the mouse reports movement through the `dx` and `dy` properties of [`'mouseMove'`](#event-mousemove) events, even when the cursor would have hit the edge of the screen.
Use this for FPS-style camera controls.
The `x` and `y` positions reported by mouse events are not meaningful while in relative mode.
This function may fail on platforms that don't support raw mouse input.

### window.unsetRelativeMouseMode()

Equivalent to [`window.setRelativeMouseMode(false)`](#windowsetrelativemousemoderelative).

### window.render(width, height, stride, format, buffer[, options])

- `width, height, stride, format, buffer: `[`<Image>`](#image-data) The image to display on the window.
- `options: <object>`
  - `scaling: <string>` How to scale the image to match the window size. Default: `'nearest'`
  - `dstRect: <object>` Where exactly on the window to draw the image. Default: whole window.
    - `x, y, width, height: <rect>` The components of the rectangle. May be fractional, in which case the image is positioned at sub-pixel precision. `width` and `height` must be positive.

Displays an image in the window.
The `'p010'` pixel format can't be rendered and is rejected.

By default the image is displayed over the entire surface of the window.
You may pass the optional `dstRect` parameter to set where exactly on the window to display the image.
The rest of the window will be filled with black.

If the dimensions of the image do not match the dimensions of the area it should be displayed in, then the image will be stretched to match.
The `scaling` argument controls how exactly the scaling is implemented.
Possible values are:

| Value       | Corresponding `SDL_ScaleMode` | Description            |
| ---         | ---                           | ---                    |
| `'nearest'` | `SDL_ScaleModeNearest`        | nearest pixel sampling |
| `'linear'`  | `SDL_ScaleModeLinear`         | linear filtering       |

If the window was created with either of the `opengl` or `webgpu` options, then you must use OpenGL/WebGPU calls to render to the window.
Calls to `render()` will fail.

### window.setIcon(width, height, stride, format, buffer)

- `width, height, stride, format, buffer: `[`<Image>`](#image-data) The image to display as the icon of the window.

Set's the window's icon, usually displayed in the title bar and the taskbar.
Only RGB [pixel formats](#pixel-formats) are accepted; YUV formats throw.

### window.flash([untilFocused])

- `untilFocused: <boolean>` Whether to keep flashing the window until the user focuses it. Default: `false`

Flash the window briefly to get attention.
If `untilFocused` is set, the window will continue flashing until the user focuses it.

### window.stopFlashing()

Stop the window from flashing.

### window.destroyed

- `<boolean>`

Is `true` if the window is destroyed.
A destroyed window object must not be used any further.

### window.destroy()

Destroys the window.

### window.destroyGently()

Asks before destroying the window.
The difference between this function and [destroy()](#windowdestroy) is that this function first makes the window emit the [`'beforeClose'`](#event-beforeclose) event, giving you a chance to prevent the window from being destroyed.

## sdl.keyboard

There are three levels at which you can deal with the keyboard: physical keys ([scancodes](#enum-scancode)), virtual keys ([keys](#virtual-keys)), and text ([`'textInput'`](#event-textinput) events).

On the physical level, each of the physical keys corresponds to a number: the key's scancode.
For any given keyboard, the same key will always produce the same scancode.
If your application cares about the layout of the keyboard (for example using the "WASD" keys as a substitute for arrow keys), then you should handle key events at this level using the `scancode` property of [`'keyDown'`](#event-keydown) and [`'keyUp'`](#event-keyup) events.

For the most part it's better to treat scancode values as arbitrary/meaningless, but SDL does provide a scancode enumeration with values based on the [USB usage page standard](https://www.usb.org/sites/default/files/documents/hut1_12v2.pdf) so you should be able to derive some meaning from the scancodes if your keyboard is compatible.

More commonly, you don't care about the physical key itself but about the "meaning" associated with each key:
the character that it produces ("a", "b", "@", " ", .e.t.c.) or the function that it corresponds to ("Esc", "F4", "Ctrl",  e.t.c.).
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

### Virtual keys

String values used to represent virtual keys in the context of the current keyboard mapping.
Note that some keys do not correspond to any virtual key.
A Key can be either one of the values below __or__ any unicode character.
Keys that produce characters are represented by that character.
All others are represented by one of these values:

`'&&'`, `'+/-'`, `'||'`, `'00'`, `'000'`, `'again'`, `'alt'`, `'altErase'`, `'back'`, `'backspace'`, `'binary'`, `'bookmarks'`, `'call'`, `'cancel'`, `'capsLock'`, `'clear'`, `'clear/again'`, `'clearEntry'`, `'copy'`, `'crSel'`, `'ctrl'`, `'currencySubUnit'`, `'currencyUnit'`, `'cut'`, `'decimal'`, `'decimalSeparator'`, `'delete'`, `'down'`, `'eject'`, `'end'`, `'endCall'`, `'enter'`, `'escape'`, `'execute'`, `'exSel'`, `'f1'`, `'f2'`, `'f3'`, `'f4'`, `'f5'`, `'f6'`, `'f7'`, `'f8'`, `'f9'`, `'f10'`, `'f11'`, `'f12'`, `'f13'`, `'f14'`, `'f15'`, `'f16'`, `'f17'`, `'f18'`, `'f19'`, `'f20'`, `'f21'`, `'f22'`, `'f23'`, `'f24'`, `'find'`, `'forward'`, `'gui'`, `'help'`, `'hexadecimal'`, `'home'`, `'insert'`, `'left'`, `'mediaFastForward'`, `'mediaPlay'`, `'mediaRewind'`, `'mediaSelect'`, `'mediaStop'`, `'mediaTrackNext'`, `'mediaTrackPrevious'`, `'memAdd'`, `'memClear'`, `'memDivide'`, `'memMultiply'`, `'memRecall'`, `'memStore'`, `'memSubtract'`, `'menu'`, `'modeSwitch'`, `'mute'`, `'numlock'`, `'octal'`, `'oper'`, `'out'`, `'pageDown'`, `'pageUp'`, `'paste'`, `'pause'`, `'power'`, `'printScreen'`, `'prior'`, `'refresh'`, `'return'`, `'right'`, `'scrollLock'`, `'search'`, `'select'`, `'separator'`, `'shift'`, `'sleep'`, `'softLeft'`, `'softRight'`, `'stop'`, `'sysReq'`, `'tab'`, `'thousandsSeparator'`, `'undo'`, `'up'`, `'volumeDown'`, `'volumeUp'`, `'xor'`.

### Enum: SCANCODE

Used to represent physical keys on the keyboard.
The same key will always produce the same scancode.
Values are based on the [USB usage page standard](https://www.usb.org/sites/default/files/documents/hut1_12v2.pdf).

This enum is also available from `@kmamal/sdl/helpers`.

<details>

  <summary>Click to expand table</summary>

  | Value                                      | Corresponding `SDL_Scancode`      | Comment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
  | ---                                        | ---                               | ---                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
  | `sdl.keyboard.SCANCODE.A`                  | `SDL_SCANCODE_A`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.B`                  | `SDL_SCANCODE_B`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.C`                  | `SDL_SCANCODE_C`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.D`                  | `SDL_SCANCODE_D`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.E`                  | `SDL_SCANCODE_E`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F`                  | `SDL_SCANCODE_F`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.G`                  | `SDL_SCANCODE_G`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.H`                  | `SDL_SCANCODE_H`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.I`                  | `SDL_SCANCODE_I`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.J`                  | `SDL_SCANCODE_J`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.K`                  | `SDL_SCANCODE_K`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.L`                  | `SDL_SCANCODE_L`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.M`                  | `SDL_SCANCODE_M`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.N`                  | `SDL_SCANCODE_N`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.O`                  | `SDL_SCANCODE_O`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.P`                  | `SDL_SCANCODE_P`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.Q`                  | `SDL_SCANCODE_Q`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.R`                  | `SDL_SCANCODE_R`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.S`                  | `SDL_SCANCODE_S`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.T`                  | `SDL_SCANCODE_T`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.U`                  | `SDL_SCANCODE_U`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.V`                  | `SDL_SCANCODE_V`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.W`                  | `SDL_SCANCODE_W`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.X`                  | `SDL_SCANCODE_X`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.Y`                  | `SDL_SCANCODE_Y`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.Z`                  | `SDL_SCANCODE_Z`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.1`                  | `SDL_SCANCODE_1`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.2`                  | `SDL_SCANCODE_2`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.3`                  | `SDL_SCANCODE_3`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.4`                  | `SDL_SCANCODE_4`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.5`                  | `SDL_SCANCODE_5`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.6`                  | `SDL_SCANCODE_6`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.7`                  | `SDL_SCANCODE_7`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.8`                  | `SDL_SCANCODE_8`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.9`                  | `SDL_SCANCODE_9`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.0`                  | `SDL_SCANCODE_0`                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.RETURN`             | `SDL_SCANCODE_RETURN`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.ESCAPE`             | `SDL_SCANCODE_ESCAPE`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.BACKSPACE`          | `SDL_SCANCODE_BACKSPACE`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.TAB`                | `SDL_SCANCODE_TAB`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.SPACE`              | `SDL_SCANCODE_SPACE`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.MINUS`              | `SDL_SCANCODE_MINUS`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.EQUALS`             | `SDL_SCANCODE_EQUALS`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.LEFTBRACKET`        | `SDL_SCANCODE_LEFTBRACKET`        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.RIGHTBRACKET`       | `SDL_SCANCODE_RIGHTBRACKET`       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.BACKSLASH`          | `SDL_SCANCODE_BACKSLASH`          | Located at the lower left of the return key on ISO keyboards and at the right end of the QWERTY row on ANSI keyboards. Produces REVERSE SOLIDUS (backslash) and VERTICAL LINE in a US layout, REVERSE SOLIDUS and VERTICAL LINE in a UK Mac layout, NUMBER SIGN and TILDE in a UK Windows layout, DOLLAR SIGN and POUND SIGN in a Swiss German layout, NUMBER SIGN and APOSTROPHE in a German layout, GRAVE ACCENT and POUND SIGN in a French Mac layout, and ASTERISK and MICRO SIGN in a French Windows layout.                                                                                                                                                                                                     |
  | `sdl.keyboard.SCANCODE.NONUSHASH`          | `SDL_SCANCODE_NONUSHASH`          | ISO USB keyboards actually use this code instead of 49 for the same key, but all OSes I've seen treat the two codes identically. So, as an implementor, unless your keyboard generates both of those codes and your OS treats them differently, you should generate SDL_SCANCODE_BACKSLASH instead of this code. As a user, you should not rely on this code because SDL will never generate it with most (all?) keyboards.                                                                                                                                                                                                                                                                                           |
  | `sdl.keyboard.SCANCODE.SEMICOLON`          | `SDL_SCANCODE_SEMICOLON`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.APOSTROPHE`         | `SDL_SCANCODE_APOSTROPHE`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.GRAVE`              | `SDL_SCANCODE_GRAVE`              | Located in the top left corner (on both ANSI and ISO keyboards). Produces GRAVE ACCENT and TILDE in a US Windows layout and in US and UK Mac layouts on ANSI keyboards, GRAVE ACCENT and NOT SIGN in a UK Windows layout, SECTION SIGN and PLUS-MINUS SIGN in US and UK Mac layouts on ISO keyboards, SECTION SIGN and DEGREE SIGN in a Swiss German layout (Mac: only on ISO keyboards), CIRCUMFLEX ACCENT and DEGREE SIGN in a German layout (Mac: only on ISO keyboards), SUPERSCRIPT TWO and TILDE in a French Windows layout, COMMERCIAL AT and NUMBER SIGN in a French Mac layout on ISO keyboards, and LESS-THAN SIGN and GREATER-THAN SIGN in a Swiss German, German, or French Mac layout on ANSI keyboards. |
  | `sdl.keyboard.SCANCODE.COMMA`              | `SDL_SCANCODE_COMMA`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.PERIOD`             | `SDL_SCANCODE_PERIOD`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.SLASH`              | `SDL_SCANCODE_SLASH`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.CAPSLOCK`           | `SDL_SCANCODE_CAPSLOCK`           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F1`                 | `SDL_SCANCODE_F1`                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F2`                 | `SDL_SCANCODE_F2`                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F3`                 | `SDL_SCANCODE_F3`                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F4`                 | `SDL_SCANCODE_F4`                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F5`                 | `SDL_SCANCODE_F5`                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F6`                 | `SDL_SCANCODE_F6`                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F7`                 | `SDL_SCANCODE_F7`                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F8`                 | `SDL_SCANCODE_F8`                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F9`                 | `SDL_SCANCODE_F9`                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F10`                | `SDL_SCANCODE_F10`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F11`                | `SDL_SCANCODE_F11`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F12`                | `SDL_SCANCODE_F12`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.PRINTSCREEN`        | `SDL_SCANCODE_PRINTSCREEN`        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.SCROLLLOCK`         | `SDL_SCANCODE_SCROLLLOCK`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.PAUSE`              | `SDL_SCANCODE_PAUSE`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.INSERT`             | `SDL_SCANCODE_INSERT`             | insert on PC, help on some Mac keyboards                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
  | `sdl.keyboard.SCANCODE.HOME`               | `SDL_SCANCODE_HOME`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.PAGEUP`             | `SDL_SCANCODE_PAGEUP`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.DELETE`             | `SDL_SCANCODE_DELETE`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.END`                | `SDL_SCANCODE_END`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.PAGEDOWN`           | `SDL_SCANCODE_PAGEDOWN`           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.RIGHT`              | `SDL_SCANCODE_RIGHT`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.LEFT`               | `SDL_SCANCODE_LEFT`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.DOWN`               | `SDL_SCANCODE_DOWN`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.UP`                 | `SDL_SCANCODE_UP`                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.NUMLOCKCLEAR`       | `SDL_SCANCODE_NUMLOCKCLEAR`       | num lock on PC, clear on Mac keyboards                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
  | `sdl.keyboard.SCANCODE.KP_DIVIDE`          | `SDL_SCANCODE_KP_DIVIDE`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_MULTIPLY`        | `SDL_SCANCODE_KP_MULTIPLY`        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_MINUS`           | `SDL_SCANCODE_KP_MINUS`           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_PLUS`            | `SDL_SCANCODE_KP_PLUS`            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_ENTER`           | `SDL_SCANCODE_KP_ENTER`           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_1`               | `SDL_SCANCODE_KP_1`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_2`               | `SDL_SCANCODE_KP_2`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_3`               | `SDL_SCANCODE_KP_3`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_4`               | `SDL_SCANCODE_KP_4`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_5`               | `SDL_SCANCODE_KP_5`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_6`               | `SDL_SCANCODE_KP_6`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_7`               | `SDL_SCANCODE_KP_7`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_8`               | `SDL_SCANCODE_KP_8`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_9`               | `SDL_SCANCODE_KP_9`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_0`               | `SDL_SCANCODE_KP_0`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_PERIOD`          | `SDL_SCANCODE_KP_PERIOD`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.NONUSBACKSLASH`     | `SDL_SCANCODE_NONUSBACKSLASH`     | This is the additional key that ISO keyboards have over ANSI ones, located between left shift and Y. Produces GRAVE ACCENT and TILDE in a US or UK Mac layout, REVERSE SOLIDUS (backslash) and VERTICAL LINE in a US or UK Windows layout, and LESS-THAN SIGN and GREATER-THAN SIGN in a Swiss German, German, or French layout.                                                                                                                                                                                                                                                                                                                                                                                      |
  | `sdl.keyboard.SCANCODE.APPLICATION`        | `SDL_SCANCODE_APPLICATION`        | windows contextual menu, compose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
  | `sdl.keyboard.SCANCODE.POWER`              | `SDL_SCANCODE_POWER`              | The USB document says this is a status flag, not a physical key - but some Mac keyboards do have a power key.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
  | `sdl.keyboard.SCANCODE.KP_EQUALS`          | `SDL_SCANCODE_KP_EQUALS`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F13`                | `SDL_SCANCODE_F13`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F14`                | `SDL_SCANCODE_F14`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F15`                | `SDL_SCANCODE_F15`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F16`                | `SDL_SCANCODE_F16`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F17`                | `SDL_SCANCODE_F17`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F18`                | `SDL_SCANCODE_F18`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F19`                | `SDL_SCANCODE_F19`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F20`                | `SDL_SCANCODE_F20`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F21`                | `SDL_SCANCODE_F21`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F22`                | `SDL_SCANCODE_F22`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F23`                | `SDL_SCANCODE_F23`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.F24`                | `SDL_SCANCODE_F24`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.EXECUTE`            | `SDL_SCANCODE_EXECUTE`            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.HELP`               | `SDL_SCANCODE_HELP`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.MENU`               | `SDL_SCANCODE_MENU`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.SELECT`             | `SDL_SCANCODE_SELECT`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.STOP`               | `SDL_SCANCODE_STOP`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.AGAIN`              | `SDL_SCANCODE_AGAIN`              | redo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
  | `sdl.keyboard.SCANCODE.UNDO`               | `SDL_SCANCODE_UNDO`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.CUT`                | `SDL_SCANCODE_CUT`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.COPY`               | `SDL_SCANCODE_COPY`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.PASTE`              | `SDL_SCANCODE_PASTE`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.FIND`               | `SDL_SCANCODE_FIND`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.MUTE`               | `SDL_SCANCODE_MUTE`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.VOLUMEUP`           | `SDL_SCANCODE_VOLUMEUP`           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.VOLUMEDOWN`         | `SDL_SCANCODE_VOLUMEDOWN`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_COMMA`           | `SDL_SCANCODE_KP_COMMA`           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_EQUALSAS400`     | `SDL_SCANCODE_KP_EQUALSAS400`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL1`     | `SDL_SCANCODE_INTERNATIONAL1`     | used on Asian keyboards, see footnotes in USB doc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL2`     | `SDL_SCANCODE_INTERNATIONAL2`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL3`     | `SDL_SCANCODE_INTERNATIONAL3`     | Yen                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL4`     | `SDL_SCANCODE_INTERNATIONAL4`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL5`     | `SDL_SCANCODE_INTERNATIONAL5`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL6`     | `SDL_SCANCODE_INTERNATIONAL6`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL7`     | `SDL_SCANCODE_INTERNATIONAL7`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL8`     | `SDL_SCANCODE_INTERNATIONAL8`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.INTERNATIONAL9`     | `SDL_SCANCODE_INTERNATIONAL9`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.LANG1`              | `SDL_SCANCODE_LANG1`              | Hangul/English toggle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
  | `sdl.keyboard.SCANCODE.LANG2`              | `SDL_SCANCODE_LANG2`              | Hanja conversion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
  | `sdl.keyboard.SCANCODE.LANG3`              | `SDL_SCANCODE_LANG3`              | Katakana                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
  | `sdl.keyboard.SCANCODE.LANG4`              | `SDL_SCANCODE_LANG4`              | Hiragana                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
  | `sdl.keyboard.SCANCODE.LANG5`              | `SDL_SCANCODE_LANG5`              | Zenkaku/Hankaku                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.LANG6`              | `SDL_SCANCODE_LANG6`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.LANG7`              | `SDL_SCANCODE_LANG7`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.LANG8`              | `SDL_SCANCODE_LANG8`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.LANG9`              | `SDL_SCANCODE_LANG9`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.ALTERASE`           | `SDL_SCANCODE_ALTERASE`           | Erase-Eaze                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
  | `sdl.keyboard.SCANCODE.SYSREQ`             | `SDL_SCANCODE_SYSREQ`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.CANCEL`             | `SDL_SCANCODE_CANCEL`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.CLEAR`              | `SDL_SCANCODE_CLEAR`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.PRIOR`              | `SDL_SCANCODE_PRIOR`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.RETURN2`            | `SDL_SCANCODE_RETURN2`            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.SEPARATOR`          | `SDL_SCANCODE_SEPARATOR`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.OUT`                | `SDL_SCANCODE_OUT`                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.OPER`               | `SDL_SCANCODE_OPER`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.CLEARAGAIN`         | `SDL_SCANCODE_CLEARAGAIN`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.CRSEL`              | `SDL_SCANCODE_CRSEL`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.EXSEL`              | `SDL_SCANCODE_EXSEL`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_00`              | `SDL_SCANCODE_KP_00`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_000`             | `SDL_SCANCODE_KP_000`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.THOUSANDSSEPARATOR` | `SDL_SCANCODE_THOUSANDSSEPARATOR` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.DECIMALSEPARATOR`   | `SDL_SCANCODE_DECIMALSEPARATOR`   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.CURRENCYUNIT`       | `SDL_SCANCODE_CURRENCYUNIT`       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.CURRENCYSUBUNIT`    | `SDL_SCANCODE_CURRENCYSUBUNIT`    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_LEFTPAREN`       | `SDL_SCANCODE_KP_LEFTPAREN`       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_RIGHTPAREN`      | `SDL_SCANCODE_KP_RIGHTPAREN`      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_LEFTBRACE`       | `SDL_SCANCODE_KP_LEFTBRACE`       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_RIGHTBRACE`      | `SDL_SCANCODE_KP_RIGHTBRACE`      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_TAB`             | `SDL_SCANCODE_KP_TAB`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_BACKSPACE`       | `SDL_SCANCODE_KP_BACKSPACE`       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_A`               | `SDL_SCANCODE_KP_A`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_B`               | `SDL_SCANCODE_KP_B`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_C`               | `SDL_SCANCODE_KP_C`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_D`               | `SDL_SCANCODE_KP_D`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_E`               | `SDL_SCANCODE_KP_E`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_F`               | `SDL_SCANCODE_KP_F`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_XOR`             | `SDL_SCANCODE_KP_XOR`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_POWER`           | `SDL_SCANCODE_KP_POWER`           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_PERCENT`         | `SDL_SCANCODE_KP_PERCENT`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_LESS`            | `SDL_SCANCODE_KP_LESS`            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_GREATER`         | `SDL_SCANCODE_KP_GREATER`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_AMPERSAND`       | `SDL_SCANCODE_KP_AMPERSAND`       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_DBLAMPERSAND`    | `SDL_SCANCODE_KP_DBLAMPERSAND`    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_VERTICALBAR`     | `SDL_SCANCODE_KP_VERTICALBAR`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_DBLVERTICALBAR`  | `SDL_SCANCODE_KP_DBLVERTICALBAR`  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_COLON`           | `SDL_SCANCODE_KP_COLON`           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_HASH`            | `SDL_SCANCODE_KP_HASH`            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_SPACE`           | `SDL_SCANCODE_KP_SPACE`           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_AT`              | `SDL_SCANCODE_KP_AT`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_EXCLAM`          | `SDL_SCANCODE_KP_EXCLAM`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_MEMSTORE`        | `SDL_SCANCODE_KP_MEMSTORE`        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_MEMRECALL`       | `SDL_SCANCODE_KP_MEMRECALL`       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_MEMCLEAR`        | `SDL_SCANCODE_KP_MEMCLEAR`        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_MEMADD`          | `SDL_SCANCODE_KP_MEMADD`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_MEMSUBTRACT`     | `SDL_SCANCODE_KP_MEMSUBTRACT`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_MEMMULTIPLY`     | `SDL_SCANCODE_KP_MEMMULTIPLY`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_MEMDIVIDE`       | `SDL_SCANCODE_KP_MEMDIVIDE`       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_PLUSMINUS`       | `SDL_SCANCODE_KP_PLUSMINUS`       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_CLEAR`           | `SDL_SCANCODE_KP_CLEAR`           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_CLEARENTRY`      | `SDL_SCANCODE_KP_CLEARENTRY`      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_BINARY`          | `SDL_SCANCODE_KP_BINARY`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_OCTAL`           | `SDL_SCANCODE_KP_OCTAL`           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_DECIMAL`         | `SDL_SCANCODE_KP_DECIMAL`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.KP_HEXADECIMAL`     | `SDL_SCANCODE_KP_HEXADECIMAL`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.LCTRL`              | `SDL_SCANCODE_LCTRL`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.LSHIFT`             | `SDL_SCANCODE_LSHIFT`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.LALT`               | `SDL_SCANCODE_LALT`               | alt, option                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
  | `sdl.keyboard.SCANCODE.LGUI`               | `SDL_SCANCODE_LGUI`               | windows, command (apple), meta                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
  | `sdl.keyboard.SCANCODE.RCTRL`              | `SDL_SCANCODE_RCTRL`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.RSHIFT`             | `SDL_SCANCODE_RSHIFT`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.RALT`               | `SDL_SCANCODE_RALT`               | alt gr, option                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
  | `sdl.keyboard.SCANCODE.RGUI`               | `SDL_SCANCODE_RGUI`               | windows, command (apple), meta                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
  | `sdl.keyboard.SCANCODE.MODE`               | `SDL_SCANCODE_MODE`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.MEDIA_NEXT_TRACK`  | `SDL_SCANCODE_MEDIA_NEXT_TRACK`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.MEDIA_PREVIOUS_TRACK` | `SDL_SCANCODE_MEDIA_PREVIOUS_TRACK`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.MEDIA_STOP`        | `SDL_SCANCODE_MEDIA_STOP`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.MEDIA_PLAY`        | `SDL_SCANCODE_MEDIA_PLAY`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.MEDIA_SELECT`      | `SDL_SCANCODE_MEDIA_SELECT`        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.AC_SEARCH`          | `SDL_SCANCODE_AC_SEARCH`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.AC_HOME`            | `SDL_SCANCODE_AC_HOME`            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.AC_BACK`            | `SDL_SCANCODE_AC_BACK`            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.AC_FORWARD`         | `SDL_SCANCODE_AC_FORWARD`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.AC_STOP`            | `SDL_SCANCODE_AC_STOP`            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.AC_REFRESH`         | `SDL_SCANCODE_AC_REFRESH`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.AC_BOOKMARKS`       | `SDL_SCANCODE_AC_BOOKMARKS`       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.MEDIA_EJECT`       | `SDL_SCANCODE_MEDIA_EJECT`        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.SLEEP`              | `SDL_SCANCODE_SLEEP`              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.MEDIA_REWIND`      | `SDL_SCANCODE_MEDIA_REWIND`       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.MEDIA_FAST_FORWARD` | `SDL_SCANCODE_MEDIA_FAST_FORWARD` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.SOFTLEFT`           | `SDL_SCANCODE_SOFTLEFT`           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.SOFTRIGHT`          | `SDL_SCANCODE_SOFTRIGHT`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.CALL`               | `SDL_SCANCODE_CALL`               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `sdl.keyboard.SCANCODE.ENDCALL`            | `SDL_SCANCODE_ENDCALL`            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

</details>

### Event: 'keymapChange'

Fired when the keymap changes due to a system event such as an input language or keyboard layout change.
After this event, the correspondance between physical and logical keys might have changed.
You should assume that any previous results you have gotten from [`getKey()`](#sdlkeyboardgetkeyscancode) or [`getScancode()`](#sdlkeyboardgetscancodekey) are no longer valid.

### sdl.keyboard.getKey(scancode)

- `scancode: `[`<Scancode>`](#enum-scancode)
- Returns: [`<Key>`](#virtual-keys)`|<null>`

Maps a scancode to the corresponding key based on the current keyboard mapping.
Retuns `null` if the scancode does not currespond to a key in the current mapping.
Throws if `scancode` is not an integer from `0` to `511`.

### sdl.keyboard.getScancode(key)

- `key: `[`<Key>`](#virtual-keys)
- Returns: [`<Scancode>`](#enum-scancode)`|<null>`

Maps a key to the corresponding scancode based on the current keyboard mapping.
Retuns `null` if the key does not currespond to a scancode in the current mapping.
If multiple physical keys produce the same virtual key, then only the first one is returned.
Throws if `key` is not a valid [`Key`](#virtual-keys).

### sdl.keyboard.getState()

- Returns: `<boolean[]>` an array representing the state of each key.

The returned array can be indexed with [`Scancode`](#enum-scancode) values.
Each value in the array is either `true` if the corresponding key is pressed, or `false` otherwise.

## sdl.mouse

### Enum: BUTTON

Used to represent the buttons on a mouse.
A mouse can have many buttons, but the values for the five most common ones are represented in this enum.

This enum is also available from `@kmamal/sdl/helpers`.

| Value                     | Corresponding `SDL_BUTTON_*` |
| ---                       | ---                          |
| `sdl.mouse.BUTTON.LEFT`   | `SDL_BUTTON_LEFT`            |
| `sdl.mouse.BUTTON.MIDDLE` | `SDL_BUTTON_MIDDLE`          |
| `sdl.mouse.BUTTON.RIGHT`  | `SDL_BUTTON_RIGHT`           |
| `sdl.mouse.BUTTON.X1`     | `SDL_BUTTON_X1`              |
| `sdl.mouse.BUTTON.X2`     | `SDL_BUTTON_X2`              |

### sdl.mouse.getButton(button)

- `button: <number>` The index of the button, from `1` to `32`. Indices `1` to `3` correspond to the left, middle, and right buttons, and `4` and `5` to the X1 and X2 buttons.
- Returns: `<boolean>` Is `true` if the button is pressed.

Queries the state of a single mouse button.

### sdl.mouse.position

- `<object>`
  - `x: <number>` The x position of the mouse, relative to the screen.
  - `y: <number>` The y position of the mouse, relative to the screen.

The position of the mouse on the screen.

### sdl.mouse.setPosition(x, y)

- `x: <number>` The new x position of the mouse, relative to the screen.
- `y: <number>` The new y position of the mouse, relative to the screen.

Moves the mouse to the specified position.

### sdl.mouse.setCursor(cursor)

- `cursor: <MouseCursor>` The icon to use for the cursor.

Changes the icon that is displayed for the mouse cursor.

Possible values for `cursor` are:

| Value          | Corresponding `SDL_SystemCursor`  | Description                                              |
| ---            | ---                               | ---                                                      |
| `'default'`    | `SDL_SYSTEM_CURSOR_DEFAULT`       | default cursor, usually an arrow                         |
| `'text'`       | `SDL_SYSTEM_CURSOR_TEXT`          | text selection, usually an i-beam                        |
| `'wait'`       | `SDL_SYSTEM_CURSOR_WAIT`          | wait                                                     |
| `'crosshair'`  | `SDL_SYSTEM_CURSOR_CROSSHAIR`     | crosshair                                                |
| `'progress'`   | `SDL_SYSTEM_CURSOR_PROGRESS`      | program is busy but still interactive, usually an arrow with a small wait cursor |
| `'nwseResize'` | `SDL_SYSTEM_CURSOR_NWSE_RESIZE`   | double arrow pointing northwest and southeast            |
| `'neswResize'` | `SDL_SYSTEM_CURSOR_NESW_RESIZE`   | double arrow pointing northeast and southwest            |
| `'ewResize'`   | `SDL_SYSTEM_CURSOR_EW_RESIZE`     | double arrow pointing west and east                      |
| `'nsResize'`   | `SDL_SYSTEM_CURSOR_NS_RESIZE`     | double arrow pointing north and south                    |
| `'move'`       | `SDL_SYSTEM_CURSOR_MOVE`          | four pointed arrow pointing north, south, east, and west |
| `'notAllowed'` | `SDL_SYSTEM_CURSOR_NOT_ALLOWED`   | slashed circle or crossbones                             |
| `'pointer'`    | `SDL_SYSTEM_CURSOR_POINTER`       | pointer that indicates a link, usually a hand            |
| `'nwResize'`   | `SDL_SYSTEM_CURSOR_NW_RESIZE`     | window resize, top-left                                  |
| `'nResize'`    | `SDL_SYSTEM_CURSOR_N_RESIZE`      | window resize, top                                       |
| `'neResize'`   | `SDL_SYSTEM_CURSOR_NE_RESIZE`     | window resize, top-right                                 |
| `'eResize'`    | `SDL_SYSTEM_CURSOR_E_RESIZE`      | window resize, right                                     |
| `'seResize'`   | `SDL_SYSTEM_CURSOR_SE_RESIZE`     | window resize, bottom-right                              |
| `'sResize'`    | `SDL_SYSTEM_CURSOR_S_RESIZE`      | window resize, bottom                                    |
| `'swResize'`   | `SDL_SYSTEM_CURSOR_SW_RESIZE`     | window resize, bottom-left                               |
| `'wResize'`    | `SDL_SYSTEM_CURSOR_W_RESIZE`      | window resize, left                                      |

### sdl.mouse.resetCursor()

Switched back to the default cursor.

### sdl.mouse.setCursorImage(width, height, stride, format, buffer, x, y)

- `width, height, stride, format, buffer: `[`<Image>`](#image-data) The image to use as a cursor.
- `x: <number>` The x position of the cursor image's hotspot.
- `y: <number>` The y position of the cursor image's hotspot.

Sets a image to be the mouse cursor.
The hotspot represents the pixel that is considered to be under the mouse, so `x` must be from `0` to `width - 1` and `y` from `0` to `height - 1`.
Only RGB [pixel formats](#pixel-formats) are accepted; YUV formats throw.

### sdl.mouse.showCursor([show])

- `show: <boolean>` If `true` then the mouse cursor is made visible. Default: `true`

Changes the visibility of the mouse cursor.

### sdl.mouse.hideCursor()

Equivalent to [`sdl.mouse.showCursor(false)`](#sdlmouseshowcursorshow).

### sdl.mouse.redrawCursor()

Forces a cursor redraw.

### sdl.mouse.captured

- `<boolean>`

Is `true` if the mouse is currently captured.

### sdl.mouse.capture([capture])

- `capture: <boolean>` If `true` the mouse is to be captured by the current window. Default: `true`

When the mouse has been captured you will continue receiving mouse events even if the mouse is not over a window.
This is meant for short-lived operations such as dragging.
If instead you want to lock the cursor to the window for FPS-style camera controls, use [`window.setRelativeMouseMode()`](#windowsetrelativemousemoderelative).

### sdl.mouse.uncapture()

Equivalent to [`sdl.mouse.capture(false)`](#sdlmousecapturecapture).

## sdl.touch

### sdl.touch.devices

- `<object>[]`
  - `id: <bigint>` The unique id for the device.
  - `name: <string>|<null>` The name of the device, or `null` if it can't be determined.
  - `type: <TouchDeviceType>|<null>` The type of the device, or `null` if it can't be determined.

A list of all the detected touch devices.
On some platforms SDL only sees the touch device after it has actually been used.
Therefore the returned list might be empty, although devices are available.
After using all devices at least once the number will be correct.

Possible values for `type` are `null` if it is unknown, or one of:

| Value                | Corresponding `SDL_TouchDeviceType`  |
| ---                  | ---                                  |
| `'direct'`           | `SDL_TOUCH_DEVICE_DIRECT`            |
| `'indirectAbsolute'` | `SDL_TOUCH_DEVICE_INDIRECT_ABSOLUTE` |
| `'indirectRelative'` | `SDL_TOUCH_DEVICE_INDIRECT_RELATIVE` |

// TODO Sample output

## sdl.joystick

### Hat positions

String values used to represent the positions of a joystick hat

| Value         | Corresponding `SDL_HAT_*` |
| ---           | ---                       |
| `'centered'`  | `SDL_HAT_CENTERED`        |
| `'up'`        | `SDL_HAT_UP`              |
| `'right'`     | `SDL_HAT_RIGHT`           |
| `'down'`      | `SDL_HAT_DOWN`            |
| `'left'`      | `SDL_HAT_LEFT`            |
| `'rightUp'`   | `SDL_HAT_RIGHTUP`         |
| `'rightDown'` | `SDL_HAT_RIGHTDOWN`       |
| `'leftUp'`    | `SDL_HAT_LEFTUP`          |
| `'leftDown'`  | `SDL_HAT_LEFTDOWN`        |

<a id="joystick-event-deviceadd"></a>

### Event: 'deviceAdd'

- `device: <object>`: An object from [`sdl.joystick.devices`](#sdljoystickdevices) indicating the device that caused the event.

Fired when a new joystick device becomes available.
Check [`sdl.joystick.devices`](#sdljoystickdevices) to get the new list of joystick devices.

<a id="joystick-event-deviceremove"></a>

### Event: 'deviceRemove'

- `device: <object>`: An object from [`sdl.joystick.devices`](#sdljoystickdevices) indicating the device that caused the event.

Fired when an existing joystick device is removed.
Check [`sdl.joystick.devices`](#sdljoystickdevices) to get the new list of joystick devices.
When this event is emitted, all instances that were opened from the removed device are closed automatically.

### sdl.joystick.devices

- `<object>[]`
  - `id: <number>` The unique id for the device.
  - `name: <string>|<null>` The name of the device.
  - `path: <string>|<null>` The implementation dependent path of the device, or `null` if it can't be determined.
  - `type: <JoystickType>|<null>` The type of the device, or `null` if it can't be determined.
  - `guid: <string>|<null>` The GUID of the device, or `null` if it can't be determined.
  - `vendor: <number>|<null>` The USB vendor ID of the device, or `null` if it can't be determined.
  - `product: <number>|<null>` The USB product ID of the device, or `null` if it can't be determined.
  - `version: <number>|<null>` The USB product version of the device, or `null` if it can't be determined.
  - `player: <number>|<null>` The player index for the device, or `null` if it can't be determined.

A list of all the detected joystick devices.

Possible values for `type` are `null` if it is unknown, or one of:

| Value              | Corresponding `SDL_JoystickType`   |
| ---                | ---                                |
| `'gamepad'`        | `SDL_JOYSTICK_TYPE_GAMEPAD`        |
| `'wheel'`          | `SDL_JOYSTICK_TYPE_WHEEL`          |
| `'arcadeStick'`    | `SDL_JOYSTICK_TYPE_ARCADE_STICK`   |
| `'flightStick'`    | `SDL_JOYSTICK_TYPE_FLIGHT_STICK`   |
| `'dancePad'`       | `SDL_JOYSTICK_TYPE_DANCE_PAD`      |
| `'guitar'`         | `SDL_JOYSTICK_TYPE_GUITAR`         |
| `'drumKit'`        | `SDL_JOYSTICK_TYPE_DRUM_KIT`       |
| `'arcadePad'`      | `SDL_JOYSTICK_TYPE_ARCADE_PAD`     |
| `'throttle'`       | `SDL_JOYSTICK_TYPE_THROTTLE`       |

Sample output:

```js
[
  {
    id: 0,
    name: 'DragonRise Inc. Generic USB Joystick',
    path: '/dev/input/event21',
    guid: '03000000790000000600000010010000',
    type: 'gamepad',
    vendor: 121,
    product: 6,
    version: 272,
    player: 0,
  },
]
```

### sdl.joystick.openDevice(device)

- `device: <object>` An object from [`sdl.joystick.devices`](#sdljoystickdevices) that is to be opened. Must be the actual object from that list, not a copy.
- Returns: [`<joystickInstance>`](#class-joystickinstance) an object representing the opened joystick device instance.

Initializes a joystick device and returns a corresponding instance.

## class joystickInstance

The `JoystickInstance` class is not directly exposed by the API so you can't (and shouldn't) use it with the `new` operator.
Instead, objects returned by [`sdl.joystick.openDevice()`](#sdljoystickopendevicedevice) are of type `JoystickInstance`.

<a id="joystick-instance-event-axismotion"></a>

### Event: 'axisMotion'

- `axis: <number>` The index of the axis that moved.
- `value: <number>` The new axis position.

Fired when one of the joystick's axes moves.

### Event: 'ballMotion'

- `ball: <number>` The index of the ball that moved.
- `x: <number>` The new x position of the ball.
- `y: <number>` The new y position of the ball.
- `dx: <number>` The horizontal motion of the ball since the last event.
- `dy: <number>` The vertical motion of the ball since the last event.

Fired when one of the joystick's balls moves.
Trackballs only report relative motion, so positions are the accumulated motion since the instance was opened.

<a id="joystick-instance-event-buttondown"></a>

### Event: 'buttonDown'

- `button: <number>` The index of the button that was pressed.

Fired when one of the joystick's buttons is pressed.

<a id="joystick-instance-event-buttonup"></a>

### Event: 'buttonUp'

- `button: <number>` The index of the button that was released.

Fired when one of the joystick's buttons is released.

### Event: 'hatMotion'

- `hat: <number>` The index of the hat that was moved.
- `value: `[`<HatPosition>`](#hat-positions) The new hat position.

Fired when one of the joystick's hats is moved.

<a id="joystick-instance-event-power-update"></a>

### Event: 'powerUpdate'

- `power: <object>` The new power info.
  - `state: <string>|<null>` One of `'noBattery'`, `'battery'`, `'charging'`, `'charged'`. Is `null` if it can't be determined.
  - `percent: <number>|<null>` Percentage of battery life left, or `null` if not running on battery or if it can't be determined.

Fired when the joystick's power info changes.

<a id="joystick-instance-event-close"></a>

### Event: 'close'

Fired when the instance is about to close.
Handle cleanup here.

### joystickInstance.device

- `<object>`

The [device](#sdljoystickdevices) from which the instance was opened.

### joystickInstance.firmwareVersion

- `<number>|<null>`

The joystick's firmware version, or `null` if it is not available.

### joystickInstance.serialNumber

- `<string>|<null>`

The joystick's serial number, or `null` if it is not available.

### joystickInstance.axes

- `<number>[]`

An array of values, each corresponding to the position of one of the joystick's axes.
The values are normalized in the range from `-1` to `+1`.
It may be necessary to impose certain tolerances on these values to account for jitter.

### joystickInstance.balls

- `<object>[]`
  - `x: <number>` The horizontal position of the joystick's ball.
  - `y: <number>` The vertical position of the joystick's ball.

An array of values, each corresponding to the position of one of the joystick's balls.
Trackballs only report relative motion, so positions start at `0` when the instance is opened and accumulate the motion reported since.

### joystickInstance.buttons

- `<boolean>[]`

An array of values, each corresponding to the state of one of the joystick's buttons.
Each value in the array is either `true` if the corresponding button is pressed, or `false` otherwise.

### joystickInstance.hats

- [`<HatPosition>`](#hat-positions)`[]`

An array of values, each corresponding to the position of one of the joystick's hats.

### joystickInstance.power

- `<object>`
  - `state: <string>|<null>` One of `'noBattery'`, `'battery'`, `'charging'`, `'charged'`. Is `null` if it can't be determined.
  - `percent: <number>|<null>` Percentage of battery life left, or `null` if not running on battery or if it can't be determined.

The current power info of the joystick device.

### joystickInstance.setPlayer(index)

- `index: <number>` The player index to assign to the joystick. Must be a non-negative integer.

Sets the player index of the joystick.

### joystickInstance.resetPlayer()

Clears player assignment and player led.

### joystickInstance.hasLed

- `<boolean>`

Is `true` if the joystick has a LED light whose color can be controlled.

### joystickInstance.setLed(red, green, blue)

- `red: <number>` The red component of the led color, from `0` to `1`.
- `green: <number>` The green component of the led color, from `0` to `1`.
- `blue: <number>` The blue component of the led color, from `0` to `1`.

Sets the color of the LED light on the joystick.

### joystickInstance.hasRumble

- `<boolean>`

Is `true` if the joystick has rumble motors.

### joystickInstance.rumble([low[, high[, duration]]])

- `low: <number>` The intensity of the low frequency rumble motor, from `0` to `1`. Default: `1`
- `high: <number>` The intensity of the high frequency rumble motor, from `0` to `1`. Default: `1`
- `duration: <number>` The duration of the rumble, in ms. Must be an integer between `0` and `65535`. Default: `1e3`

Makes the joystick rumble for a set `duration`.
Calling this function again before `duration` has ran out, overrides the previous call.
Passing `0` for both intensities stops the rumble.

### joystickInstance.stopRumble()

Stops the joystick rumbling.
Equivalent to [`joystickInstance.rumble(0, 0)`](#joystickinstancerumblelow-high-duration).

### joystickInstance.hasRumbleTriggers

- `<boolean>`

Is `true` if the joystick has rumble motors on the triggers.

### joystickInstance.rumbleTriggers([left[, right[, duration]]])

- `left: <number>` The intensity of the left trigger rumble motor, from `0` to `1`. Default: `1`
- `right: <number>` The intensity of the right trigger rumble motor, from `0` to `1`. Default: `1`
- `duration: <number>` The duration of the rumble, in ms. Must be an integer between `0` and `65535`. Default: `1e3`

Makes the joystick triggers rumble for a set `duration`.
Calling this function again before `duration` has ran out, overrides the previous call.
Passing `0` for both intensities stops the rumble.

### joystickInstance.stopRumbleTriggers()

Stops the joystick trigger rumbling.
Equivalent to [`joystickInstance.rumbleTriggers(0, 0)`](#joystickinstancerumbletriggersleft-right-duration).

### joystickInstance.closed

- `<boolean>`

Is `true` if the instance is closed.
A closed instance object must not be used any further.

### joystickInstance.close()

Closes the instance.

## sdl.gamepad

An SDL gamepad is an abstraction over [`joysticks`](#sdljoystick) based on the layout of the xbox360 controller: a dpad, two analog sticks, 4 face buttons on the right, shoulder buttons (two of which might be axes) and 3 buttons in the middle ("Start", "Back" and usually some kind of logo-button called "Guide").
The gamepad abstraction names axes and buttons by their position on all supported devices (for example devices that have a similar layout, like the Playstation DualShock controller, but different button labels), so you'll know that for example `gamepadInstance.axes.leftStickX` is always the x-axis of the left analog stick, or `gamepadInstance.buttons.east` is always the rightmost of the 4 face buttons.
This makes it easy to provide consistent input bindings, like "press the east button to jump, move around with the left analog stick".
To show the user which physical button that is, [`gamepadInstance.buttonLabels`](#gamepadinstancebuttonlabels) tells you what each face button is labeled on the device.
With a pure joystick instance it's impossible to know which axis or button corresponds to which physical axis/button on the device.

Because gamepads are an abstraction over joysticks, they operate on the same set of devices (if a joystick device and a gamepad device have the same id, then they refer to the same underlying physical device).
For a joystick device to also be available as a gamepad device it needs a "mapping".
A mapping is a string that consists of the device's GUID, its name, and a series of pairings between one joystick axis/button and the corresponding gamepad axis/button name.
See the sample output [`here`](#sdlgamepaddevices) for an example.
SDL has pretty good default gamepad mappings, but if you need more, there's a community sourced database available on [gabomdq/SDL_GameGamepadDB](https://github.com/gabomdq/SDL_GameGamepadDB).
Add them via:

```js
const url = 'https://raw.githubusercontent.com/gabomdq/SDL_GameGamepadDB/master/gamepaddb.txt'
const result = await fetch(url)
const text = await result.text()
const mappings = text.split('\n').filter((line) => line && !line.startsWith('#'))
sdl.gamepad.addMappings(mappings)
```

<a id="gamepad-event-deviceadd"></a>

### Event: 'deviceAdd'

- `device: <object>`: An object from [`sdl.gamepad.devices`](#sdlgamepaddevices) indicating the device that caused the event.

Fired when a new gamepad device becomes available.
Check [`sdl.gamepad.devices`](#sdlgamepaddevices) to get the new list of gamepad devices.

<a id="gamepad-event-deviceremove"></a>

### Event: 'deviceRemove'

- `device: <object>`: An object from [`sdl.gamepad.devices`](#sdlgamepaddevices) indicating the device that caused the event.

Fired when an existing gamepad device is removed.
Check [`sdl.gamepad.devices`](#sdlgamepaddevices) to get the new list of gamepad devices.
When this event is emitted, all instances that were opened from the removed device are closed automatically.

### sdl.gamepad.addMappings(mappings)

- `mappings: <string>[]` An array of mappings to register.

Registers new mappings for gamepads.
This may cause already opened gamepad instances to be [remapped](#event-remap).
If one of the mappings is invalid, the mappings before it in the array remain registered.

### sdl.gamepad.devices

- `<object>[]`
  - `id: <number>` The unique id for the device.
  - `name: <string>|<null>` The name of the device.
  - `path: <string>|<null>` The implementation dependent path of the device, or `null` if it can't be determined.
  - `type: <string>|<null>` The type of the device, or `null` if it can't be determined.
  - `guid: <string>|<null>` The GUID of the device, or `null` if it can't be determined.
  - `vendor: <number>|<null>` The USB vendor ID of the device, or `null` if it can't be determined.
  - `product: <number>|<null>` The USB product ID of the device, or `null` if it can't be determined.
  - `version: <number>|<null>` The USB product version of the device, or `null` if it can't be determined.
  - `player: <number>|<null>` The player index for the device, or `null` if it can't be determined.
  - `mapping: <string>|<null>` The axis and button mapping for the device, or `null` if it can't be determined.

A list of all the detected gamepad devices.

Possible values for `type` are `null` if it is unknown, or one of:

| Value                         | Corresponding `SDL_GamepadType`               |
| ---                           | ---                                           |
| `'standard'`                  | SDL_GAMEPAD_TYPE_STANDARD                     |
| `'xbox360'`                   | SDL_GAMEPAD_TYPE_XBOX360                      |
| `'xboxOne'`                   | SDL_GAMEPAD_TYPE_XBOXONE                      |
| `'ps3'`                       | SDL_GAMEPAD_TYPE_PS3                          |
| `'ps4'`                       | SDL_GAMEPAD_TYPE_PS4                          |
| `'ps5'`                       | SDL_GAMEPAD_TYPE_PS5                          |
| `'nintendoSwitchPro'`         | SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_PRO          |
| `'nintendoSwitchJoyconLeft'`  | SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_JOYCON_LEFT  |
| `'nintendoSwitchJoyconRight'` | SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_JOYCON_RIGHT |
| `'nintendoSwitchJoyconPair'`  | SDL_GAMEPAD_TYPE_NINTENDO_SWITCH_JOYCON_PAIR  |
| `'gamecube'`                  | SDL_GAMEPAD_TYPE_GAMECUBE                     |

Sample output:

```js
[
  {
    id: 0,
    name: 'DragonRise Inc. Generic USB Joystick',
    path: '/dev/input/event21',
    guid: '03000000790000000600000010010000',
    type: null,
    vendor: 121,
    product: 6,
    version: 272,
    player: 0,
    mapping: '03000000790000000600000010010000,DragonRise Inc. Generic USB Joystick,a:b2,b:b1,back:b8,dpdown:h0.4,dpleft:h0.8,dpright:h0.2,dpup:h0.1,leftshoulder:b4,leftstick:b10,lefttrigger:b6,leftx:a0,lefty:a1,rightshoulder:b5,rightstick:b11,righttrigger:b7,rightx:a3,righty:a4,start:b9,x:b3,y:b0,',
  },
]
```

### sdl.gamepad.openDevice(device)

- `device: <object>` An object from [`sdl.gamepad.devices`](#sdlgamepaddevices) that is to be opened. Must be the actual object from that list, not a copy.
- Returns: [`<GamepadInstance>`](#class-gamepadinstance) an object representing the opened gamepad device instance.

Initializes an gamepad device and returns a corresponding instance.

## class GamepadInstance

The `GamepadInstance` class is not directly exposed by the API so you can't (and shouldn't) use it with the `new` operator.
Instead, objects returned by [`sdl.gamepad.openDevice()`](#sdlgamepadopendevicedevice) are of type `GamepadInstance`.

<a id="gamepad-instance-event-axismotion"></a>

### Event: 'axisMotion'

- `axis:`[`<Axis>`](#gamepadinstanceaxes) The axis that moved.
- `value: <number>` The new axis position.

Fired when one of the gamepad's axes moves.

<a id="gamepad-instance-event-buttondown"></a>

### Event: 'buttonDown'

- `button:`[`<Button>`](#gamepadinstancebuttons) The button that was pressed.

Fired when one of the gamepad's buttons is pressed.

<a id="gamepad-instance-event-buttonup"></a>

### Event: 'buttonUp'

- `button:`[`<Button>`](#gamepadinstancebuttons) The button that was released.

Fired when one of the gamepad's buttons is released.

<a id="gamepad-instance-event-power-update"></a>

### Event: 'powerUpdate'

- `power: <object>` The new power info.
  - `state: <string>|<null>` One of `'noBattery'`, `'battery'`, `'charging'`, `'charged'`. Is `null` if it can't be determined.
  - `percent: <number>|<null>` Percentage of battery life left, or `null` if not running on battery or if it can't be determined.

Fired when the gamepad's power info changes.

### Event: 'steamHandleUpdate'

- `steamHandle: <Buffer>|<null>` The new steam handle.

Fired when the gamepad's [`steamHandle`](#gamepadinstancesteamhandle) changes.

### Event: 'remap'

Fired when a new mapping for the gamepad is applied (usually via [`sdl.gamepad.addMappings()`](#sdlgamepadaddmappingsmappings)).
This may cause all of the gamepad's axes and buttons to aquire new values.

<a id="gamepad-instance-event-close"></a>

### Event: 'close'

Fired when the instance is about to close.
Handle cleanup here.

### gamepadInstance.device

- `<object>`

The [device](#sdlgamepaddevices) from which the instance was opened.

### gamepadInstance.firmwareVersion

- `<number>|<null>`

The gamepad's firmware version, or `null` if it is not available.

### gamepadInstance.serialNumber

- `<string>|<null>`

The gamepad's serial number, or `null` if it is not available.

### gamepadInstance.steamHandle

- `<Buffer>|<null>`

The gamepad's steam handle, or `null` if it is not available.
The `Buffer` contains an `InputHandle_t` for the gamepad that can be used with the [Steam Input API](https://partner.steamgames.com/doc/api/ISteamInput)

### gamepadInstance.axes

- `<object>`
  - `leftStickX: <number>` Left stick horizontal position
  - `leftStickY: <number>` Left stick vertical position
  - `rightStickX: <number>` Right stick horizontal position
  - `rightStickY: <number>` Right stick vertical position
  - `leftTrigger: <number>` Left trigger position
  - `rightTrigger: <number>` Right trigger position

An object mapping each axis of the gamepad's axes to its position.
The values are normalized in the range from `-1` to `+1`.
It may be necessary to impose certain tolerances on these values to account for jitter.

### gamepadInstance.buttons

- `<object>`
  - `dpadLeft: <boolean>` D-Pad left pressed
  - `dpadRight: <boolean>`  D-Pad right pressed
  - `dpadUp: <boolean>`  D-Pad up pressed
  - `dpadDown: <boolean>`  D-Pad down pressed
  - `south: <boolean>` Bottom face button pressed (A on Xbox, Cross on Playstation)
  - `east: <boolean>` Right face button pressed (B on Xbox, Circle on Playstation)
  - `west: <boolean>` Left face button pressed (X on Xbox, Square on Playstation)
  - `north: <boolean>` Top face button pressed (Y on Xbox, Triangle on Playstation)
  - `guide: <boolean>` Middle button pressed
  - `back: <boolean>` Back button pressed
  - `start: <boolean>` Start button pressed
  - `leftStick: <boolean>` Left stick pressed
  - `rightStick: <boolean>` Right stick pressed
  - `leftShoulder: <boolean>` Left shoulder button pressed
  - `rightShoulder: <boolean>` Right shoulder button pressed
  - `rightPaddle1: <boolean>` Upper right paddle pressed (Xbox Elite P1)
  - `leftPaddle1: <boolean>` Upper left paddle pressed (Xbox Elite P3)
  - `rightPaddle2: <boolean>` Lower right paddle pressed (Xbox Elite P2)
  - `leftPaddle2: <boolean>` Lower left paddle pressed (Xbox Elite P4)
  - `misc1: <boolean>` Miscellaneous button pressed (Xbox Series X share button, PS5 microphone button, Nintendo Switch Pro capture button, Amazon Luna microphone button)
  - `misc2: <boolean>` Additional button pressed
  - `misc3: <boolean>` Additional button pressed
  - `misc4: <boolean>` Additional button pressed
  - `misc5: <boolean>` Additional button pressed
  - `misc6: <boolean>` Additional button pressed
  - `touchpad: <boolean>` Touchpad pressed (PS4/PS5 controllers)

An object mapping each of the gamepad's buttons to a boolean value.
Each value in the object is either `true` if the corresponding button is pressed, or `false` otherwise.
Buttons are named after their position on the gamepad, not their label, so that the same name always refers to the same physical position on every device.

### gamepadInstance.buttonLabels

- `<object>`
  - `south: <string>|<null>` The label of the bottom face button.
  - `east: <string>|<null>` The label of the right face button.
  - `west: <string>|<null>` The label of the left face button.
  - `north: <string>|<null>` The label of the top face button.

An object mapping each of the gamepad's face buttons to the label printed on it, for showing hints to the user.
Possible values are `null` if the label is unknown, or one of:

| Value          | Corresponding `SDL_GamepadButtonLabel` |
| ---            | ---                                    |
| `'a'`          | `SDL_GAMEPAD_BUTTON_LABEL_A`           |
| `'b'`          | `SDL_GAMEPAD_BUTTON_LABEL_B`           |
| `'x'`          | `SDL_GAMEPAD_BUTTON_LABEL_X`           |
| `'y'`          | `SDL_GAMEPAD_BUTTON_LABEL_Y`           |
| `'cross'`      | `SDL_GAMEPAD_BUTTON_LABEL_CROSS`       |
| `'circle'`     | `SDL_GAMEPAD_BUTTON_LABEL_CIRCLE`      |
| `'square'`     | `SDL_GAMEPAD_BUTTON_LABEL_SQUARE`      |
| `'triangle'`   | `SDL_GAMEPAD_BUTTON_LABEL_TRIANGLE`    |

### gamepadInstance.setPlayer(index)

- `index: <number>` The player index to assign to the gamepad. Must be a non-negative integer.

Sets the player index of the gamepad.

### gamepadInstance.resetPlayer()

Clears player assignment and player led.

### gamepadInstance.hasLed

- `<boolean>`

Is `true` if the gamepad has a LED light whose color can be controlled.

### gamepadInstance.setLed(red, green, blue)

- `red: <number>` The red component of the led color, from `0` to `1`.
- `green: <number>` The green component of the led color, from `0` to `1`.
- `blue: <number>` The blue component of the led color, from `0` to `1`.

Sets the color of the LED light on the gamepad.

### gamepadInstance.hasRumble

- `<boolean>`

Is `true` if the gamepad has rumble motors.

### gamepadInstance.rumble([low[, high[, duration]]])

- `low: <number>` The intensity of the low frequency rumble motor, from `0` to `1`. Default: `1`
- `high: <number>` The intensity of the high frequency rumble motor, from `0` to `1`. Default: `1`
- `duration: <number>` The duration of the rumble, in ms. Must be an integer between `0` and `65535`. Default: `1e3`

Makes the gamepad rumble for a set `duration`.
Calling this function again before `duration` has ran out, overrides the previous call.
Passing `0` for both intensities stops the rumble.

### gamepadInstance.stopRumble()

Stops the gamepad rumbling.
Equivalent to [`gamepadInstance.rumble(0, 0)`](#gamepadinstancerumblelow-high-duration).

### gamepadInstance.hasRumbleTriggers

- `<boolean>`

Is `true` if the gamepad has rumble motors on the triggers.

### gamepadInstance.rumbleTriggers([left[, right[, duration]]])

- `left: <number>` The intensity of the left trigger rumble motor, from `0` to `1`. Default: `1`
- `right: <number>` The intensity of the right trigger rumble motor, from `0` to `1`. Default: `1`
- `duration: <number>` The duration of the rumble, in ms. Must be an integer between `0` and `65535`. Default: `1e3`

Makes the gamepad triggers rumble for a set `duration`.
Calling this function again before `duration` has ran out, overrides the previous call.
Passing `0` for both intensities stops the rumble.

### gamepadInstance.stopRumbleTriggers()

Stops the gamepad trigger rumbling.
Equivalent to [`gamepadInstance.rumbleTriggers(0, 0)`](#gamepadinstancerumbletriggersleft-right-duration).

### gamepadInstance.closed

- `<boolean>`

Is `true` if the instance is closed.
A closed instance object must not be used any further.

### gamepadInstance.close()

Closes the instance.

## sdl.sensor

### sdl.sensor.STANDARD_GRAVITY

- `<number>`

Accelerometers are affected by the force of gravity:
even if the device is completely at rest, it will still indicata an acceleration with a magnitude of [`sdl.sensor.STANDARD_GRAVITY`](#sdlsensorstandard_gravity) away from the center of the earth.
Use the `sdl.sensor.STANDARD_GRAVITY` constant to correct for gravitational acceleration if your application requires it.

This constant is also available from `@kmamal/sdl/helpers`.

### sdl.sensor.devices

- `<object>[]`
  - `id: <number>` The unique id of the device.
  - `name: <string>|<null>` The name of the device. Is `null` if it can't be determined.
  - `type: <string>|<null>` Either `'accelerometer'` or `'gyroscope'`. Is `null` if it can't be determined.
  - `side: <string>|<null>` Either `'left'` or `'right'`. Is `null` if the sensor does not have a side, or the value can't be determined.

A list of all the detected sensor devices.

Some sensors have a `side`, sucha as those on the Joy-Con controller.
For most other sensors `side` is `null`.

Sample output:

// TODO

### sdl.sensor.openDevice(device)

- `device: <object>` An object from [`sdl.sensor.devices`](#sdlsensordevices) that is to be opened. Must be the actual object from that list, not a copy.
- Returns: [`<SensorInstance>`](#class-sensorinstance) an object representing the opened sensor device instance.

Initializes a sensor device and returns a corresponding instance.

## class SensorInstance

The `SensorInstance` class is not directly exposed by the API so you can't (and shouldn't) use it with the `new` operator.
Instead, objects returned by [`sdl.sensor.openDevice()`](#sdlsensoropendevicedevice) are of type `SensorInstance`.

<a id="sensor-instance-event-update"></a>

### Event: 'update'

Fired when the sensor's data changes.
Get the new data by accessing [`sensorInstance.data`](#sensorinstancedata)

<a id="sensor-instance-event-close"></a>

### Event: 'close'

Fired when the instance is about to close.
Handle cleanup here.

### sensorInstance.device

- `<object>`

The [device](#sdlsensordevices) from which the `sensorInstance` was opened.

### sensorInstance.data

- `<object>`
  - `x: <number>` X axis value.
  - `y: <number>` Y axis value.
  - `z: <number>` Z axis value.

An object reporting the latest measurement from the sensor.

For accelerometers, the `x`, `y`, and `z` values correspond to the current acceleration in meters per second squared.
Keep in mind the accelerometers are affected by the force of gravity:
even if the device is completely at rest, it will still indicata an acceleration with a magnitude of [`sdl.sensor.STANDARD_GRAVITY`](#sdlsensorstandard_gravity) away from the center of the earth.

For gyroscopes, the `x`, `y`, and `z` values correspond to the current rate of rotation in radians per second.
The rotation is positive in the counter-clockwise direction, meaning that an observer looking from a positive location on one of the axes would see positive rotation on that axis when it appeared to be rotating counter-clockwise.

For phones held in portrait mode and game controllers held in front of you, the axes are defined as follows:

- -X ... +X : left ... right
- -Y ... +Y : bottom ... top
- -Z ... +Z : farther ... closer

### sensorInstance.closed

- `<boolean>`

Is `true` if the instance is closed.
A closed instance object must not be used any further.

### sensorInstance.close()

Closes the instance.

## sdl.audio

### Audio data

The [`playbackStream.putData()`](#playbackstreamputdatabuffer-bytes) function expects a buffer of audio data as input and the [`recordingStream.getData()`](#recordingstreamgetdatabuffer-bytes) function fills a buffer with audio data as output.
The format of the data in these buffers depends on the options you passed to [`openDevice()`](#sdlaudioplaybackopendevicedevice-options) when the stream was opened.

An audio buffer is a sequence of frames, and each frame is a sequence of samples.
A _sample_ is a single number representing the intensity of an audio channel at a point in time.
For audio with multiple channels, each point in time is represented by multiple samples (one per channel) that together make up a _frame_.
The samples in a frame are arranged as follows:

- For 1 channel (mono) a frame contains just the one sample.
- For 2 channels (stereo) the frame contains two samples and the layout is: front-left, front-right. This means that the first sample corresponds to the left channel and the second sample corresponds to the right channel.
- For 3 channels (2.1) the layout is front-left, front-right, low-frequency.
- For 4 channels (quad) the layout is front-left, front-right, back-left, back-right.
- For 5 channels (4.1) the layout is front-left, front-right, low-frequency, back-left, back-right.
- For 6 channels (5.1) the layout is front-left, front-right, front-center, low-frequency, back-left, back-right. The last two can also be side-left, side-right.
- For 7 channels (6.1) the layout is front-left, front-right, front-center, low-frequency, back-center, side-left, side-right.
- For 8 channels (7.1) the layout is front-left, front-right, front-center, low-frequency, back-left, back-right, side-left, side-right.

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
} = playbackStream

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
    offset = playbackStream.writeSample(buffer, sample, offset)
  }
}

playbackStream.putData(buffer)
playbackStream.play()
```

### Sample formats

String values used to represent how audio samples are stored in a Buffer.

| Value      | Corresponding `SDL_AudioFormat` | Comment                                                   |
| ---        | ---                             | ---                                                       |
| `'s8'`     | `SDL_AUDIO_S8`                  | signed 8-bit samples                                      |
| `'u8'`     | `SDL_AUDIO_U8`                  | unsigned 8-bit samples                                    |
| `'s16le'`  | `SDL_AUDIO_S16LE`               | signed 16-bit samples in little-endian byte order         |
| `'s16be'`  | `SDL_AUDIO_S16BE`               | signed 16-bit samples in big-endian byte order            |
| `'s16'`    | `SDL_AUDIO_S16`                 | signed 16-bit samples in native byte order                |
| `'s32le'`  | `SDL_AUDIO_S32LE`               | 32-bit integer samples in little-endian byte order        |
| `'s32be'`  | `SDL_AUDIO_S32BE`               | 32-bit integer samples in big-endian byte order           |
| `'s32'`    | `SDL_AUDIO_S32`                 | 32-bit integer samples in native byte order               |
| `'f32le'`  | `SDL_AUDIO_F32LE`               | 32-bit floating point samples in little-endian byte order |
| `'f32be'`  | `SDL_AUDIO_F32BE`               | 32-bit floating point samples in big-endian byte order    |
| `'f32'`    | `SDL_AUDIO_F32`                 | 32-bit floating point samples in native byte order        |

### sdl.audio.bytesPerSample(format)

- `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
- Returns: `<number>` The number of bytes.

Helper function which maps each sample format to the corresponding number of bytes its samples take up.

This function is also available from `@kmamal/sdl/helpers`.

### sdl.audio.minSampleValue(format)

- `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
- Returns: `<number>` The minimum sample value.

Helper function which maps each sample format to the corresponding minimum value its samples can take.

This function is also available from `@kmamal/sdl/helpers`.

### sdl.audio.maxSampleValue(format)

- `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
- Returns: `<number>` The maximum sample value.

Helper function which maps each sample format to the corresponding maximum value its samples can take.

This function is also available from `@kmamal/sdl/helpers`.

### sdl.audio.zeroSampleValue(format)

- `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
- Returns: `<number>` The zero sample value.

Helper function which maps each sample format to the sample value that corresponds to silence.

This function is also available from `@kmamal/sdl/helpers`.

### sdl.audio.readSample(format, buffer[, offset])

- `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
- `buffer: <Buffer>` The buffer to read the sample from.
- `offset: <number>` The position from which to read the sample. Default: `0`
- Returns: `<number>` The value of the sample read.

Helper function which calls the appropriate `read*` method of `Buffer` based on the format argument.
For example, a call to `sdl.audio.readSample('f32', buffer, offset)` would be equivalent to `buffer.readFloatLE(offset)`.

This function is also available from `@kmamal/sdl/helpers`.

### sdl.audio.writeSample(format, buffer, value[, offset])

- `format: `[`<SampleFormat>`](#sample-formats): The desired sample format.
- `buffer: <Buffer>` The buffer to write the sample to.
- `value: <number>` The value of the sample to write.
- `offset: <number>` The position at which to write the sample. Default: `0`
- Returns: `<number>` The updated `offset`.

Helper function which calls the appropriate `write*` method of `Buffer` based on the format argument.
For example, a call to `sdl.audio.writeSample('f32', buffer, value, offset)` would be equivalent to `buffer.writeFloatLE(value, offset)`.

This function is also available from `@kmamal/sdl/helpers`.

### sdl.audio.playback

Playback and recording devices are managed separately, through `sdl.audio.playback` and `sdl.audio.recording`.
Both have the same shape: a list of devices, an `openDevice()` function, and `deviceAdd`/`deviceRemove` events.

<a id="audio-playback-event-deviceadd"></a>

### Event: 'deviceAdd'

- `device: <object>`: An object from [`sdl.audio.playback.devices`](#sdlaudioplaybackdevices) indicating the device that caused the event.

Fired when a new playback device becomes available.
Check [`sdl.audio.playback.devices`](#sdlaudioplaybackdevices) to get the new list of devices.

<a id="audio-playback-event-deviceremove"></a>

### Event: 'deviceRemove'

- `device: <object>`: An object from [`sdl.audio.playback.devices`](#sdlaudioplaybackdevices) indicating the device that caused the event.

Fired when an existing playback device is removed.
Check [`sdl.audio.playback.devices`](#sdlaudioplaybackdevices) to get the new list of devices.
When the `'deviceRemove'` event is emitted, all streams that were opened from the removed device are closed automatically.

### sdl.audio.playback.devices

- `<object>[]`
  - `id: <number>` The unique id of the device.
  - `name: <string>` The name of the device.

A list of all the detected playback devices.
Sample output for PulseAudio:

```js
[
  { id: 3, name: 'Built-in Audio Analog Stereo' },
]
```

Note that the list may sometimes be empty.
Despite that, in many common cases, it's still possible to successfully open the default device by calling [`openDevice()`](#sdlaudioplaybackopendevicedevice-options) without a device:

```js
const playbackStream = sdl.audio.playback.openDevice()
```

### sdl.audio.playback.openDevice([device[, options]])

- `device: <object>|<null>` An object from [`sdl.audio.playback.devices`](#sdlaudioplaybackdevices). Must be the actual object from that list, not a copy. Pass `null` to let SDL pick the default device. Default: `null`
- `options: <object>`
  - `channels: <number>`: Number of audio channels. Must be an integer from `1` to `8`, see [audio data](#audio-data) for the layouts. Default: `1`
  - `frequency: <number>`: The sampling frequency in frames per second. Must be a positive integer. Default: `48e3`
  - `format: `[`<SampleFormat>`](#sample-formats): The binary format for each sample. Default: `'f32'`
  - `buffered: <number>`: Number of frames buffered by the driver. Must be a power of `2`, at most `32768`. Default: `4096`
- Returns: [`<AudioPlaybackStream>`](#class-audioplaybackstream-extends-audiostream) an object representing the opened stream.

Opens a playback device and returns a stream bound to it.

The `channels`, `frequency` and `format` options together define how the data is laid out in the `Buffer` objects that you write to the stream.
See also the section on [audio data](#audio-data).

The `buffered` option specifies the "delay" between the application and the audio driver.
With smaller values you have smaller delays, but you also have to write data more frequently.
Applications such as virtual instruments that need to play audio in reaction to user input should set `buffered` to a lower value.

### sdl.audio.recording

Playback and recording devices are managed separately, through `sdl.audio.playback` and `sdl.audio.recording`.
Both have the same shape: a list of devices, an `openDevice()` function, and `deviceAdd`/`deviceRemove` events.

<a id="audio-recording-event-deviceadd"></a>

### Event: 'deviceAdd'

- `device: <object>`: An object from [`sdl.audio.recording.devices`](#sdlaudiorecordingdevices) indicating the device that caused the event.

Fired when a new recording device becomes available.
Check [`sdl.audio.recording.devices`](#sdlaudiorecordingdevices) to get the new list of devices.

<a id="audio-recording-event-deviceremove"></a>

### Event: 'deviceRemove'

- `device: <object>`: An object from [`sdl.audio.recording.devices`](#sdlaudiorecordingdevices) indicating the device that caused the event.

Fired when an existing recording device is removed.
Check [`sdl.audio.recording.devices`](#sdlaudiorecordingdevices) to get the new list of devices.
When the `'deviceRemove'` event is emitted, all streams that were opened from the removed device are closed automatically.

### sdl.audio.recording.devices

- `<object>[]`
  - `id: <number>` The unique id of the device.
  - `name: <string>` The name of the device.

A list of all the detected recording devices.
Sample output for PulseAudio:

```js
[
  { id: 4, name: 'Built-in Audio Analog Stereo' },
]
```

Note that the list may sometimes be empty.
Despite that, in many common cases, it's still possible to successfully open the default device by calling [`openDevice()`](#sdlaudiorecordingopendevicedevice-options) without a device:

```js
const recordingStream = sdl.audio.recording.openDevice()
```

### sdl.audio.recording.openDevice([device[, options]])

- `device: <object>|<null>` An object from [`sdl.audio.recording.devices`](#sdlaudiorecordingdevices). Must be the actual object from that list, not a copy. Pass `null` to let SDL pick the default device. Default: `null`
- `options: <object>`
  - `channels: <number>`: Number of audio channels. Must be an integer from `1` to `8`, see [audio data](#audio-data) for the layouts. Default: `1`
  - `frequency: <number>`: The sampling frequency in frames per second. Must be a positive integer. Default: `48e3`
  - `format: `[`<SampleFormat>`](#sample-formats): The binary format for each sample. Default: `'f32'`
  - `buffered: <number>`: Number of frames buffered by the driver. Must be a power of `2`, at most `32768`. Default: `4096`
- Returns: [`<AudioRecordingStream>`](#class-audiorecordingstream-extends-audiostream) an object representing the opened stream.

Opens a recording device and returns a stream bound to it.

The `channels`, `frequency` and `format` options together define how the data is laid out in the `Buffer` objects that you read from the stream.
See also the section on [audio data](#audio-data).

The `buffered` option specifies the "delay" between the application and the audio driver.
With smaller values you have smaller delays, but you also have to read data more frequently.
Applications such as virtual instruments that need to play audio in reaction to user input should set `buffered` to a lower value.

## class AudioStream

The `AudioStream` class is not directly exposed by the API so you can't (and shouldn't) use it with the `new` operator.
It only serves as the base class for [`AudioPlaybackStream`](#class-audioplaybackstream-extends-audiostream) and [`AudioRecordingStream`](#class-audiorecordingstream-extends-audiostream).

<a id="audio-stream-event-close"></a>

### Event: 'close'

Fired when the stream is about to close.
Handle cleanup here.

### audioStream.id

- `<number>`

A unique identifier for the stream.

### audioStream.device

- `<object>|<null>`

The device passed to `openDevice()` when the stream was opened, or `null` if the stream was opened on the default device.

### audioStream.channels

- `<number>`

The number of channels the stream was opened with.

### audioStream.frequency

- `<number>`

The sampling frequency (in frames per second) the stream was opened with.

### audioStream.format

- [`<SampleFormat>`](#sample-formats)

The audio sample format the stream was opened with.

### audioStream.bytesPerSample

- `<number>`

The number of bytes that make up a single audio sample, based on the format the stream was opened with.

### audioStream.minSampleValue

- `<number>`

The minimum value a sample can take, based on the format the stream was opened with.

### audioStream.maxSampleValue

- `<number>`

The maximum value a sample can take, based on the format the stream was opened with.

### audioStream.zeroSampleValue

- `<number>`

The sample value that corresponds to silence, based on the format the stream was opened with.

### audioStream.readSample(buffer[, offset])

- `buffer: <Buffer>` The buffer to read the sample from.
- `offset: <number>` The position from which to read the sample. Default: `0`
- Returns: `<number>` The value of the sample read.

Helper function which calls the appropriate `read*` method of `Buffer` based on the format the stream was opened with.
For example, for a stream opened with the `'f32'` sample format, a call to `audioStream.readSample(buffer, offset)` would be equivalent to `buffer.readFloatLE(offset)`.

### audioStream.writeSample(buffer, value[, offset])

- `buffer: <Buffer>` The buffer to write the sample to.
- `value: <number>` The value of the sample to write.
- `offset: <number>` The position at which to write the sample. Default: `0`
- Returns: `<number>` The updated `offset`.

Helper function which calls the appropriate `write*` method of `Buffer` based on the format the stream was opened with.
For example, for a stream opened with the `'f32'` sample format, a call to `audioStream.writeSample(buffer, value, offset)` would be equivalent to `buffer.writeFloatLE(value, offset)`.

### audioStream.buffered

- `<number>`

The buffer size (in frames) the stream was opened with.

### audioStream.playing

- `<boolean>`

Is `true` if the stream is currently running.

### audioStream.play([play])

- `play: <boolean>` Set to `true` to start the stream, `false` to stop. Default: `true`

Starts or stops the stream.

### audioStream.pause()

Equivalent to [`audioStream.play(false)`](#audiostreamplayplay)

### audioStream.clear()

Discards all data buffered in the stream: queued playback data that has not been played yet, or recorded data that has not been read yet.

### audioStream.closed

- `<boolean>`

Is `true` if the stream is closed.
A closed stream object must not be used any further.

### audioStream.close()

Closes the stream.

## class AudioPlaybackStream extends AudioStream

The `AudioPlaybackStream` class is not directly exposed by the API so you can't (and shouldn't) use it with the `new` operator.
Instead, objects returned by [`sdl.audio.playback.openDevice()`](#sdlaudioplaybackopendevicedevice-options) are of type `AudioPlaybackStream`.

### playbackStream.queued

- `<number>`

The number of bytes that have been written to the stream but not yet played by the device.

### playbackStream.putData(buffer[, bytes])

- `buffer: <Buffer>` The buffer to read data from.
- `bytes: <number>` The number of bytes to read from the buffer. Must not exceed `buffer.length`. Default: `buffer.length`

Takes the audio data that you have written to the buffer, and queues it on the stream, from where it will be played back as audio.

## class AudioRecordingStream extends AudioStream

The `AudioRecordingStream` class is not directly exposed by the API so you can't (and shouldn't) use it with the `new` operator.
Instead, objects returned by [`sdl.audio.recording.openDevice()`](#sdlaudiorecordingopendevicedevice-options) are of type `AudioRecordingStream`.

### recordingStream.available

- `<number>`

The number of bytes of recorded audio that are waiting to be read from the stream.

### recordingStream.getData(buffer[, bytes])

- `buffer: <Buffer>` The buffer to write data to.
- `bytes: <number>` The number of bytes to write to the buffer. Must not exceed `buffer.length`. Default: `buffer.length`
- Returns: `<number>` The actual number of bytes read.

Takes recorded audio data that is waiting on the stream, and writes it to the provided buffer.

## sdl.clipboard

<a id="clipboard-event-update"></a>

### Event: 'update'

Fired when the contents of the clipboard have changed.
Check [`sdl.clipboard.text`](#sdlclipboardtext) to get the new contents of the clipboard.

### sdl.clipboard.text

- `<string>`

The current text value on the clipboard.

### sdl.clipboard.setText(text)

- `text: <string>` The new value to save on the clipboard.

Changes the text contents of the clipboard.

## sdl.power

### sdl.power.info

- `<object>`
  - `state: <string>|<null>` One of `'noBattery'`, `'battery'`, `'charging'`, `'charged'`. Is `null` if it can't be determined.
  - `seconds: <number>|<null>` Seconds of battery life left, or `null` if not running on battery or if it can't be determinded.
  - `percent: <number>|<null>` Percentage of battery life left, or `null` if not running on battery or if it can't be determinded.

The curent power information of the device.

## Helpers

The `@kmamal/sdl` library must only be imported from the main thread.
If you try importing it from a `worker_thread` you will get an error.
This is mainly due to some limitations in SDL itself (it's often unsafe to call functions from threads other than the one that called `SDL_Init`) as well as Node.js native modules (each thread gets its own instance of the module and it's hard to make them talk with each other).

It's often useful however to offload CPU-heavy work to a thread, so the main thread can respond to input events faster.
This is still possible!
Even if the threads do not have access to the SDL-related functions, they can still write data to buffers and then pass those buffers to the main thread from where they can be passed to SDL.
One thing is missing: While the core of the library is not needed, it's nice to have the helper functions, for example when writing an audio renderer it's nice to have the [`readSample`](#sdlaudioreadsampleformat-buffer-offset), [`writeSample`](#sdlaudiowritesampleformat-buffer-value-offset), etc functions.

Since these are just helpers and don't call any SDL code underneath it's safe to use them.
They are made available through the `@kmamal/sdl/helpers` sub-module.
It loads the native addon only to read its constant tables (such as `keyboard.SCANCODE`), never initializes SDL, and can be used from any thread.
For an example of their use see [this example](https://github.com/kmamal/node-sdl/blob/master/examples/16-audio-thread/audio-worker.js).

The members of `@kmamal/sdl/helpers` live under the same paths as in the main module (so `sdl.audio.readSample` becomes `require('@kmamal/sdl/helpers').audio.readSample`).
They are:

- [`sdl.video.bytesPerPixel`](#sdlvideobytesperpixelformat)
- [`sdl.video.isYuv`](#sdlvideoisyuvformat)
- [`sdl.video.isPlanarYuv`](#sdlvideoisplanaryuvformat)
- [`sdl.video.minBufferSize`](#sdlvideominbuffersizeformat-stride-height)
- [`sdl.keyboard.SCANCODE`](#enum-scancode)
- [`sdl.mouse.BUTTON`](#enum-button)
- [`sdl.sensor.STANDARD_GRAVITY`](#sdlsensorstandard_gravity)
- [`sdl.audio.bytesPerSample`](#sdlaudiobytespersampleformat)
- [`sdl.audio.minSampleValue`](#sdlaudiominsamplevalueformat)
- [`sdl.audio.maxSampleValue`](#sdlaudiomaxsamplevalueformat)
- [`sdl.audio.zeroSampleValue`](#sdlaudiozerosamplevalueformat)
- [`sdl.audio.readSample`](#sdlaudioreadsampleformat-buffer-offset)
- [`sdl.audio.writeSample`](#sdlaudiowritesampleformat-buffer-value-offset)

## Building from source

If prebuilt binaries are not available for your platform, `@kmamal/sdl` tries to compile itself during installation.
A few prerequisites are necessary for that to work:

First, install [node-addon-api](https://github.com/nodejs/node-addon-api) and [node-gyp](https://github.com/nodejs/node-gyp#installation) with all its dependencies.

On Mac, you also need to install `xquartz` so that SDL can find the X11 headers it needs.
The command to install `quartz` via homebrew is `brew install xquartz`.

You don't need to install any SDL libraries or headers.
These are downloaded automatically through the [@kmamal/build-sdl](https://github.com/kmamal/build-sdl) package.
If `@kmamal/build-sdl` has no prebuilt library for your platform, it tries to compile one on the spot.
You need to have `cmake` installed for that to work.

---

You could also have found your way to the "Building from source" section because you are trying to contribute to this package.
There are some npm scripts in `package.json` that could be of use to you:

- `npm run clean` deletes all folders that are created during the build, as well as `node_modules`.
- `npm run download-release` downloads the prebuilt binaries. This is the first thing the install script tries to do.
- `npm run download-sdl` downloads the SDL headers and libraries from `@kmamal/build-sdl` so you can compile against them in later steps. This is the second step in the install script, after `download-release` has failed.
- `npm run build` prepares the environment variables and calls `node-gyp` to build the package.
- `NODE_SDL_FROM_SOURCE=1 npm install` runs the install script normally, but skips the inital attempt to download the binaries, and goes straight to building from source.

The SDL headers and libs get downloaded to `sdl/`, the build happens in `build/`, and the final binaries get collected into `dist/`.

The way I normally work is I run `npm run clean` to start fresh, then run `NODE_SDL_FROM_SOURCE=1 npm i` once to prepare everything, then as I make changes I run `npm run build` to re-build the package.

Have fun!
