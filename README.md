# @kmamal/sdl

SDL2 bindings for Node.js. Provides window management, input events, audio playback/recording, and clipboard manipulation. Use together with [@kmamal/gl](https://github.com/kmamal/headless-gl#readme) for WebGL drawing.

It should work on Linux, Mac, and Windows. Prebuilt binaries are available for x64 architectures.


## Usage

1. Install SDL2 (`>=2.0.4`) on your system. You might have to download one of the [SDL2 Runtime Binaries](https://www.libsdl.org/download-2.0.php).
    * __Linux:__ Run `sudo apt install libsdl2-2.0-0` or whatever the equivalent command is for your package manager.
    * __Mac:__ Download the `.dmg` file, open it, and copy the `SDL2.framework` to `/Library/Frameworks`.
    * __Windows:__ Download the `.zip` file, extract it, and copy the `.dll` files to a path Node.js can link them from. This will usually be your system directory (`C:\Windows`) but see [here](https://docs.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-search-order) for other paths where Windows will look for `.dll` files to link.
2. Install this package via `npm install @kmamal/sdl` or `yarn add @kmamal/sdl`.
3. Import it from your code with `const sdl = require('@kmamal/sdl')` or `import sdl from '@kmamal/sdl'`.


## Example

```js
const sdl = require('@kmamal/sdl')

sdl.video.createWindow({ title: "Hello, World!" })

for (;;) {
  const event = sdl.events.wait()
  if (event?.type === 'quit') { break }
}
```

There are more examples [here](https://github.com/kmamal/node-sdl/tree/master/examples).


## API Reference

### Contents

* [sdl.info](#sdlinfo)
* [sdl.video](#sdlvideo)
  * [enum sdl.video.FORMAT](#enum-sdlvideoformat)
  * [enum sdl.video.FORMAT_NAME](#enum-sdlvideoformat_name)
  * [sdl.video.displays](#sdlvideodisplays)
  * [sdl.video.windows](#sdlvideowindows)
  * [sdl.video.focused](#sdlvideofocused)
  * [sdl.video.hovered](#sdlvideohovered)
  * [sdl.video.createWindow([options])](#sdlvideocreatewindowoptions)
  * [class Window](#class-window)
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
  * [enum sdl.audio.FORMAT](#enum-sdlaudioformat)
  * [enum sdl.audio.FORMAT_NAME](#enum-sdlaudioformat_name)
  * [sdl.audio.devices](#sdlaudiodevices)
  * [sdl.audio.openDevice(device[, options])](#sdlaudioopendevicedevice-options)
  * [class AudioDevice](#class-audiodevice)
    * [audioDevice.id](#audiodeviceid)
    * [audioDevice.name](#audiodevicename)
    * [audioDevice.channels](#audiodevicechannels)
    * [audioDevice.frequency](#audiodevicefrequency)
    * [audioDevice.format](#audiodeviceformat)
    * [audioDevice.buffered](#audiodevicebuffered)
    * [audioDevice.playing](#audiodeviceplaying)
    * [audioDevice.play([play])](#audiodeviceplayplay)
    * [audioDevice.pause()](#audiodevicepause)
    * [audioDevice.queued](#audiodevicequeued)
    * [audioDevice.clearQueued()](#audiodeviceclearqueued)
    * [audioDevice.closed](#audiodeviceclosed)
    * [audioDevice.close()](#audiodeviceclose)
  * [class AudioPlaybackDevice extends AudioDevice](#class-audioplaybackdevice-extends-audiodevice)
    * [playbackDevice.queue(buffer[, bytes])](#playbackdevicequeuebuffer-bytes)
  * [class AudioRecordingDevice extends AudioDevice](#class-audiorecordingdevice-extends-audiodevice)
    * [recordingDevice.dequeue(buffer[, bytes])](#recordingdevicedequeuebuffer-bytes)
* [sdl.events](#sdlevents)
  * [sdl.events.poll()](#sdleventspoll)
  * [sdl.events.wait([timeout])](#sdleventswaittimeout)
  * [Events reference](#events-reference)
    * [Application events](#application-events)
    * [Window events](#window-events)
    * [Audio device events](#audio-device-events)
    * [Key events](#key-events)
    * [Mouse events](#mouse-events)
    * [Drag-n-Drop events](#drag-n-drop-events)
    * [Clipboard events](#clipboard-events)
* [sdl.keyboard](#sdlkeyboard)
  * [enum sdl.keyboard.SCANCODE](#enum-sdlkeyboardscancode)
  * [enum sdl.keyboard.SCANCODE_NAME](#enum-sdlkeyboardscancode_name)
  * [enum sdl.keyboard.KEYCODE](#enum-sdlkeyboardkeycode)
  * [enum sdl.keyboard.KEYCODE_NAME](#enum-sdlkeyboardkeycode_name)
  * [sdl.keyboard.getState()](#sdlkeyboardgetstate)
* [sdl.mouse](#sdlmouse)
  * [enum sdl.mouse.BUTTON](#enum-sdlmousebutton)
  * [enum sdl.mouse.BUTTON_NAME](#enum-sdlmousebutton_name)
  * [enum sdl.mouse.CURSOR](#enum-sdlmousecursor)
  * [enum sdl.mouse.CURSOR_NAME](#enum-sdlmousecursor_name)
  * [sdl.mouse.position](#sdlmouseposition)
  * [sdl.mouse.setPosition(x, y)](#sdlmousesetpositionx-y)
  * [sdl.mouse.setCursor(cursor)](#sdlmousesetcursor)
  * [sdl.mouse.setCursorImage(width, height, stride, format, buffer, x, y)](#sdlmousesetcursorimagewidth-height-stride-format-buffer-x-y)
  * [sdl.mouse.showCursor([show])](#sdlmouseshowcursorshow)
  * [sdl.mouse.hideCursor()](#sdlmousehidecursor)
  * [sdl.mouse.capture([capture])](#sdlmousecapturecapture)
  * [sdl.mouse.uncapture()](#sdlmousecapture)
* [sdl.clipboard](#sdlclipboard)
  * [sdl.clipboard.text](#sdlclipboardtext)
  * [sdl.clipboard.setText(text)](#sdlclipboardsettexttext)
* [Notes](#notes)
  * [Image data](#image-data)
  * [Audio data](#audio-data)


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

This object is filled with the information produced during the initialization of SDL2. All the values will remain constant throughout the execution of the program. If you want to initialize SDL2 with drivers other than the default ones, you can do so via its [environment variables](https://wiki.libsdl.org/FAQUsingSDL).

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


### sdl.video

#### enum sdl.video.FORMAT

Values of this enum are used to represent how the pixels of an image are stored in a Buffer. See also the section on [image data](#image-data).

Includes all the entries of the [SDL enum](https://wiki.libsdl.org/SDL_PixelFormatEnum), __except__ the ones for formats that are indexed (palette-based). The `SDL_PIXELFORMAT_` prefix is removed so that `SDL_PIXELFORMAT_FOO` corresponds to `sdl.video.FORMAT.FOO`.

#### enum sdl.video.FORMAT_NAME

Maps values of [`sdl.video.FORMAT`](#enum-sdlvideoformat) back to their names so that `sdl.video.FORMAT_NAME[sdl.video.FORMAT.FOO] === 'FOO'`.

#### sdl.video.displays

* `<object>[]`
  * `name: <string>` The name of the display.
  * `format: `[`<sdl.video.FORMAT>`](#enum-sdlvideoformat) The pixel format of the display.
  * `frequency: <number>` The refresh rate of the display.
  * `geometry: <object>` The desktop region represented by the display.
    * `x, y, width, height: <Rect>` The position and size of the display's geometry.
  * `usable: <object>` Similar to `geometry`, but excludes areas taken up by the OS or window manager such as menus, docks, e.t.c.
    * `x, y, width, height: <Rect>` The position and size of the display's usable region.
  * `dpi: <object>` Return pixel density for the display in dots/pixels-per-inch units.
    * `horizontal: <number>` The horizontal density.
    * `vertical: <number>` The vertical density.
    * `diagonal: <number>` The diagonal density.

A list of all detected displays. Sample output for two side-to-side monitors is below. Notice how the geometries don't overlap:

```js
[
  {
    name: '0',
    format: 370546692, // sdl.video.FORMAT.RGBA8888
    frequency: 60,
    geometry: { x: 0, y: 0, width: 1920, height: 1080 },
    usable: { x: 0, y: 27, width: 1920, height: 1053 },
    dpi: { horizontal: 141.76, vertical: 142.13, diagonal: 141.85 }
  },
  {
    name: '1',
    format: 370546692, // sdl.video.FORMAT.RGBA8888
    frequency: 60,
    geometry: { x: 1920, y: 0, width: 1920, height: 1080 },
    usable: { x: 1920, y: 27, width: 1920, height: 1053 },
    dpi: { horizontal: 141.76, vertical: 142.13, diagonal: 141.85 }
  },
]
```

#### sdl.video.windows

* [`<Window>`](#class-window)`[]`

A list of all open windows.

#### sdl.video.focused

* [`<Window>`](#class-window)`|<null>`

The window that has the current keyboard focus, or `null` if no window has the keyboard focus.

#### sdl.video.hovered

* [`<Window>`](#class-window)`|<null>`

The window that the mouse is hovered over, or `null` if the mouse is not over a window.

#### sdl.video.createWindow([options])

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
  * `opengl: <boolean>` Set to `true` to create an OpenGL-compatible window (for use with [@kmamal/gl](https://github.com/kmamal/headless-gl#readme)). Default: `false`
* Returns: [`<Window>`](#class-window) an object representing the new window.

Creates a new window.

The following restrictions apply:
* If you specify the `display` option, you can't also specify the `x` or `y` options, and vice-versa.
* The `resizable` and `borderless` options can't both be true.


### class Window

This class is not directly exposed by the API so you can't use it with the `new` operator. Instead, objects returned by [`sdl.video.createWindow()`](#sdlvideocreatewindowoptions) are of this type.

#### window.id

* `<number>`

A unique identifier for the window.

#### window.title

* `<string>`

The text that appears in the window's title bar.

#### window.setTitle(title)

* `title: <string>`: The new title.

Changes the text that appears in the window's title bar.

#### window.x

* `<number>`

The window's x position, relative to the screen.

#### window.y

* `<number>`

The window's y position, relative to the screen.

#### window.setPosition(x, y)

* `x: <number>`: The new x position, relative to the screen.
* `y: <number>`: The new y position, relative to the screen.

Moves the window to a new position on the screen.

#### window.width

* `<number>`

The window's width.

#### window.height

* `<number>`

The window's height.

#### window.setSize(width, height)

* `width: <number>`: The new width.
* `height: <number>`: The new height.

Changes the size of the window.

#### window.visible

* `<boolean>`

Will be `true` if the window is visible.

#### window.show([show])

* `show: <boolean>` Set to `true` to make the window visible, `false` to hide it. Default: `true`

Shows or hides the window.

#### window.hide()

Equivalent to [`window.show(false)`](#windowshowshow).

#### window.fullscreen

* `<boolean>`

Will be `true` if the window is fullscreen. A fullscreen window is displayed over the entire screen.

#### window.setFullscreen(fullscreen)

* `fullscreen: <boolean>` The new value of the property.

Changes the window's fullscreen property.

#### window.resizable

* `<boolean>`

Will be `true` if the window is resizable. A resizable window can be resized by dragging it's borders.

#### window.setResizable(resizable)

* `resizable: <boolean>` The new value of the property.

Changes the window's resizable property.

#### window.borderless

* `<boolean>`

Will be `true` if the window is borderless. A borderless window has no borders or title bar.

#### window.setBorderless(borderless)

* `borderless: <boolean>` The new value of the property.

Changes the window's borderless property.

#### window.native

* `<any>`

Holds a copy of the native (platform-specific) representation of the window. Only used for passing to [@kmamal/gl](https://github.com/kmamal/headless-gl#readme).

#### window.maximized

* `<boolean>`

Will be `true` if the window is maximized.

#### window.maximize()

Maximizes the window.

#### window.minimized

* `<boolean>`

Will be `true` if the window is minimized.

#### window.minimize()

Minimizes the window.

#### window.restore()

Restores the window so it's neither minimized nor maximized.

#### window.focused

* `<boolean>`

Will be `true` if the window has keyboard input.

#### window.focus()

Gives the window the keyboard focus.

#### window.hovered

* `<boolean>`

Will be `true` if the mouse is over the window.

#### window.render(width, height, stride, format, buffer)

* `width, height, stride, format, buffer: `[`<Image>`](#image-data) The image to display on the window.

Displays an image in the window. The provided image's dimensions should be the same as the window's `width` and `height`.

#### window.setIcon(width, height, stride, format, buffer)

* `width, height, stride, format, buffer: `[`<Image>`](#image-data) The image to display as the icon of the window.

Set's the window's icon, usually displayed in the title bar and the taskbar.

#### window.destroyed

* `<boolean>`

Will be `true` if the window is destroyed. A destroyed window object should not be used any further.

#### window.destroy()

Destroys the window.


### sdl.audio

#### enum sdl.audio.FORMAT

Values of this enum are used to represent how audio samples are stored in a Buffer. See also the section on [audio data](#audio-data).

Includes all the entries of the [SDL enum](https://wiki.libsdl.org/SDL_AudioFormat) with the `AUDIO_` prefix removed so that `AUDIO_FOO` corresponds to `sdl.audio.FORMAT.FOO`.

#### enum sdl.audio.FORMAT_NAME

Maps values of [`sdl.audio.FORMAT`](#enum-sdlaudioformat) back to their names so that `sdl.audio.FORMAT_NAME[sdl.audio.FORMAT.FOO] === 'FOO'`.

#### sdl.audio.devices

* `<object>[]`
  * `name: <string>` The name of the device.
  * `recording: <bool>` Will be `true` if this is a recording device.

A list of all the detected audio devices. Sample output for PulseAudio:

```js
[
  { name: 'Built-in Audio Analog Stereo', recording: false },
  { name: 'Built-in Audio Analog Stereo', recording: true }
]
```

#### sdl.audio.openDevice(device[, options])

* `device: <object>` An object from [`sdl.audio.devices`](#sdlaudiodevices) that should be opened.
* `options: <object>` See also the section on [audio data](#audio-data)
  * `channels: <number>`: Number of audio channels. Valid values: `1`, `2`, `4`, `6`. Default `1`.
  * `frequency: <number>`: The sampling frequency in frames per second. Default `48e3`.
  * `format: `[`<sdl.audio.FORMAT>`](#enum-sdlaudioformat): The binary format for each sample. Default `sdl.audio.FORMAT.S16`.
  * `buffer: <number>`: Number of frames that will be buffered by the driver. Must be a power of `2`. Default `4096`.
* Returns: [`<AudioDevice>`](#class-audiodevice) an object representing the opened audio device.

Initializes an audio device for playback/recording. If the opened device is a playback device, then the returned object will be an [`AudioPlaybackDevice`](#class-audioplaybackdevice-extends-audiodevice), otherwise it will be an [`AudioRecordingDevice`](#class-audiorecordingdevice-extends-audiodevice).

The `channels`, `frequency` and `format` options together define what the data in the `Buffer` objects you read from or write to the device will look like. See also the section on [audio data](#audio-data).

The `buffered` option specifies the "delay" that you will experience between the application and the audio driver. With smaller values you will have smaller delays, but you will also have to read/write data from/to the driver more frequently. If the application is not latency-sensitive it's better to have higher values.

### class AudioDevice

This class is not directly exposed by the API so you can't use it with the `new` operator. It only serves as the base class for [`AudioPlaybackDevice`](#class-audioplaybackdevice-extends-audiodevice) and [`AudioRecordingDevice`](#class-audiorecordingdevice-extends-audiodevice).

#### audioDevice.id

* `<number>`

A unique identifier for the audio device.

#### audioDevice.name

* `<string>`

The name of the audio device.

#### audioDevice.channels

* `<number>`

The number of channels the device has been opened with.

#### audioDevice.frequency

* `<number>`

The sampling frequency (in frames per second) the device has been opened with.

#### audioDevice.format

* [`<sdl.audio.FORMAT>`](#enum-sdlaudioformat)

The audio sample format the device has been opened with.

#### audioDevice.buffered

* `<number>`

The buffer size (in frames) the device has been opened with.

#### audioDevice.playing

* `<boolean>`

Will be `true` if the audio device is currently playing.

#### audioDevice.play([play])

* `show: <boolean>` Set to `true` to start the audio device, `false` to stop. Default: `true`

Starts or stops the audio device.

#### audioDevice.pause()

Equivalent to [`audioDevice.play(false)`](#audiodeviceplayplay)

#### audioDevice.queued

* `<number>`

The number of bytes that are currently queued up, waiting to be either played by the device or dequeued by the user.

#### audioDevice.clearQueued()

Clears the queued data.

#### audioDevice.closed

* `<number>`

Will be `true` if the audio device is closed. A closed audio device object should not be used any further.

#### audioDevice.close()

Closes the audio device.


### class AudioPlaybackDevice extends AudioDevice

This class is not directly exposed by the API so you can't use it with the `new` operator. Instead, objects returned by [`sdl.audio.openDevice()`](#sdlaudioopendevicedevice-options) are of this type, if a playback device is opened.

#### playbackDevice.queue(buffer[, bytes])

* `buffer: <Buffer>` The buffer to read data from.
* `bytes: <number>` The number of bytes to read from the buffer. Default: `buffer.length`

Takes generated audio data from the buffer, and writes it to the queue, from which it will be played back.


### class AudioRecordingDevice extends AudioDevice

This class is not directly exposed by the API so you can't use it with the `new` operator. Instead, objects returned by [`sdl.audio.openDevice()`](#sdlaudioopendevicedevice-options) are of this type, if a recording device is opened.

#### recordingDevice.dequeue(buffer[, bytes])

* `buffer: <Buffer>` The buffer to write data to.
* `bytes: <number>` The number of bytes to write to the buffer. Default: `buffer.length`
* Returns: `<number>` The actual number of bytes read.

Takes recorded audio data that has been put on the queue, and writes it to the provided buffer.


### sdl.events

#### sdl.events.poll()

* Returns: [`<Event>`](#events-reference)`|<null>` an object representing the emitted event, or `null`.

If there are events in the queue, it returns the first one. Otherwise, it returns null.

#### sdl.events.wait([timeout])

* `timeout: <number>` Number of milliseconds to wait for events. Default `1e3`
* Returns: [`<Event>`](#events-reference)`|<null>` an object representing the emitted event, or `null`.

__Warning: this is a blocking function.__

If there are events in the queue, it returns the first one. Otherwise it waits up to `timeout` milliseconds for an event to arrive and returns that. If no events arrive before the timeout, it returns null.


### Events reference

Event objects are returned from calls to [`sdl.events.poll()`](#sdleventspoll) and [`sdl.events.wait()`](#sdleventswaittimeout). They all have the following common property:

* `type: <string>` The event's type.

There are many different types of events and each can carry some extra properties. Here they are all together, grouped into categories:

#### Application events

* `'quit'` Fired to indicate that the user has requested the application to close (most often by closing the last window). The process is not terminated automatically so that you get a chance to display any confirmation dialogs you might need to. Handle this event and then terminate the application manually when you are ready.

#### Window events

All window events have the following property:

* `window: `[`<Window>`](#class-window) The window that caused the event.

The following window events are defined along with any additional properties:

* `'window-shown'` Fired when a window becomes visible.

* `'window-hidden'` Fired when a window becomes hidden.

* `'window-exposed'` Fired when a window becomes exposed.

* `'window-minimized'` Fired when a window becomes minimized.

* `'window-maximized'` Fired when a window becomes maximized.

* `'window-restored'` Fired when a window stops being either minimized or maximized.

* `'window-focus-gained'` Fired when a window gains the keyboard focus.

* `'window-focus-lost'` Fired when a window loses the keyboard focus.

* `'window-enter'` Fired when the mouse enters the window.

* `'window-leave'` Fired when the mouse leaves the window.

* `'window-close'` Fired when the window is closed. The window is not destroyed automatically so that you get a chance to display any confirmation dialogs you might need. Handle this event and then call `window.destroy()` to destroy the window.

* `'window-moved'` Fired when the window changes position.
  * `x: <number>` The window's new x position, relative to the screen.
  * `y: <number>` The window's new y position, relative to the screen.

* `'window-size-changed'` Fired before the window changes position.
  * `width: <number>` The window's new width.
  * `height: <number>` The window's new height.

* `'window-resized'` Fired after the window changes position.
  * `width: <number>` The window's new width.
  * `height: <number>` The window's new height.

#### Audio device events

All audio device events have the following property:

* `device: <object>`: An object from [`sdl.audio.devices`](#sdlaudiodevices) indicating the device that caused the event.

The following audio device events are defined:

* `'audio-device-added'` Fired when a new audio device becomes available.
* `'audio-device-removed'` Fired when an existing audio device is removed.

After either of these evens you can check [`sdl.audio.devices`](#sdlaudiodevices) to get the new list of audio devices.

#### Key events

Both key events have the following properties:

* `scancode: `[`<sdl.keyboard.SCANCODE>`](#enum-sdlkeyboardscancode) The scancode of the key that caused the event.
* `keycode: `[`<sdl.keyboard.KEYCODE>`](#enum-sdlkeyboardkeycode) The keycode of the key that caused the event.
* `repeat: <number>` Is `true` if the event was generated by holding down a key for a long time.
* `shift: <number>` Is `true` if the Shift key was pressed when the event was generated.
* `ctrl: <number>` Is `true` if the Ctrl key was pressed when the event was generated.
* `alt: <number>` Is `true` if the Alt key was pressed when the event was generated.
* `super: <number>` Is `true` if the "Windows" key was pressed when the event was generated.
* `altgr: <number>` Is `true` if the AltGr key was pressed when the event was generated.
* `capslock: <number>` Is `true` if CapsLock was active when the event was generated.
* `numlock: <number>` Is `true` if NumLock was active when the event was generated.

The following key events are defined:

* `'key-down'` Fired when a key is pressed, and will also be fired repeatedly afterwards if the key is held down.

* `'key-up'` Fired when a key is released.

#### Text events

* `'text-input'` Fired when the keys pressed by the user result in a character being printed.
  * `text: <string>` The unicode representation of the character that was entered.
  * `window: `[`<Window>`](#class-window) The window that caused the event.

#### Mouse events

All mouse events have the following properties:

* `x: <number>` The mouse's x position when the event happened, relative to the screen.
* `y: <number>` The mouse's y position when the event happened, relative to the screen.
* `touch: <boolean>` Will be `true` if the event was caused by a touch event.

The following mouse events are defined, along with any additional properties:

* `'mouse-move'` Fired when the mouse moves within a window.

* `'mouse-button-down'` Fired when a mouse button is pressed.
  * `button: `[`<sdl.mouse.BUTTON>`](#enum-sdlmousebutton) The button that was pressed.

* `'mouse-button-up'` Fired when a mouse button is released.
  * `button: `[`<sdl.mouse.BUTTON>`](#enum-sdlmousebutton) The button that was released.

* `'mouse-wheel'` Fired when the mouse wheel moves.
  * `dx: <number>` The wheel's x movement, relative to last position.
  * `dy: <number>` The wheel's y movement, relative to last position.
  * `flipped: <number>` Will be `true` if the underlying platform reverses the mouse wheel's scroll direction. Multiply `dx` and `dy` by `-1` to get the correct values.

Mouse events are received only if the mouse is over a window, unless the mouse is captured in which case mouse events are received from the whole screen.

#### Drag-n-Drop events

All drag-n-drop events have the following property:

* `window: `[`<Window>`](#class-window): The window that received the drop.

The following drag-n-drop events are defined, along with any additional properties:

* `'drop-begin'` Fired before a set of items has been dropped on a window.

* `'drop-complete'` Fired after a set of items has been dropped on a window.

* `'drop-text'` Fired when one of the drops is a text item.
  * `text: <string>`: The text that was dropped onto the window.

* `'drop-file'` Fired when one of the drops is a file.
  * `file: <string>`: The path to the file that was dropped onto the window.

When dropping a set of items onto a window, first the `'drop-begin'` event will be fired, then a number of `'drop-text'` and/or `'drop-file'` events will be fired corresponding to the contents of the drop, then finally the `'drop-complete'` event will be fired.

#### Clipboard events

* `'clipboard-update'` Fired when the contents of the clipboard have changed.


### sdl.keyboard

There's three ways you can deal with the keyboard:

* If you care about the physical layout of the keys, then you should use the [scancodes](#enum-sdlkeyboardscancode). Each physical keys will always be associated with the same scancode.
* If you care about the character (or meaning) that corresponds to each key, then you should use [keycodes](#enum-sdlkeyboardkeycode). A key's keycode depends on the current keyboard mapping and its value is equal to either a) the unicode character that the unmodified key would produce if pressed or b) one of the enum values.
* If you care about text written by the user, then you should be handling the [`text-input`](#text-events) events. Instead of handling keycodes and translating them into text by hand (by handling modifiers), these events will give you the final text as reported by the OS.

#### enum sdl.keyboard.SCANCODE

Values of this enum are used to represent physical keys on the keyboard. See also the section on [handling keyboard input](#sdlkeyboard).

Includes all the entries of the [SDL enum](https://wiki.libsdl.org/SDL_Scancode) with the `SDL_SCANCODE_` prefix removed so that `SDL_SCANCODE_FOO` corresponds to `sdl.keyboard.SCANCODE.FOO`.

#### enum sdl.keyboard.SCANCODE_NAME

Maps values of [`sdl.keyboard.SCANCODE`](#enum-sdlkeyboardscancode) back to their names so that `sdl.keyboard.SCANCODE_NAME[sdl.keyboard.SCANCODE.FOO] === 'FOO'`.

#### enum sdl.keyboard.KEYCODE

Values of this enum are used to represent virtual keys in the context of the current keyboard mapping. See also the section on [handling keyboard input](#sdlkeyboard).

Includes all the entries of the [SDL enum](https://wiki.libsdl.org/SDL_Keycode) with the `SDLK_` prefix removed so that `SDLK_FOO` corresponds to `sdl.keyboard.KEYCODE.FOO`.

#### enum sdl.keyboard.KEYCODE_NAME

Maps values of [`sdl.keyboard.KEYCODE`](#enum-sdlkeyboardkeycode) back to their names so that `sdl.keyboard.KEYCODE_NAME[sdl.keyboard.KEYCODE.FOO] === 'FOO'`.

#### sdl.keyboard.getKeycode(scancode)

* `scancode: `[`<sdl.keyboard.SCANCODE>`](#enum-sdlkeyboardscancode)
* Returns: [`<sdl.keyboard.KEYCODE>`](#enum-sdlkeyboardkeycode)

Maps a scancode to the corresponding keyode based on the current keyboard mapping.

#### sdl.keyboard.getScancode(keycode)

* `keycode: `[`<sdl.keyboard.KEYCODE>`](#enum-sdlkeyboardkeycode)
* Returns: [`<sdl.keyboard.SCANCODE>`](#enum-sdlkeyboardscancode)

Maps a keycode to the corresponding scancode based on the current keyboard mapping.

#### sdl.keyboard.getState()

* Returns: `<boolean>[]` an array representing the state of each key.

Use the values of [`sdl.keyboard.SCANCODE`](#enum-sdlkeyboardscancode) as indexes. Pressed keys will have `true` values.


### sdl.mouse

#### enum sdl.mouse.BUTTON

Values of this enum are used to represent the buttons on a mouse.

Includes all the entries of the [SDL enum](https://wiki.libsdl.org/SDL_MouseButtonEvent) with the `SDL_BUTTON_` prefix removed so that `SDL_BUTTON_FOO` corresponds to `sdl.mouse.BUTTON.FOO`.

#### enum sdl.mouse.BUTTON_NAME

Maps values of [`sdl.mouse.BUTTON`](#enum-sdlmousebutton) back to their names so that `sdl.mouse.BUTTON_NAME[sdl.video.BUTTON.FOO] === 'FOO'`.

#### enum sdl.mouse.CURSOR

Values of this enum are used to represent the types of cursors available on most systems.

Includes all the entries of the [SDL enum](https://wiki.libsdl.org/SDL_SystemCursor) with the `SDL_SYSTEM_CURSOR_` prefix removed so that `SDL_SYSTEM_CURSOR_FOO` corresponds to `sdl.mouse.CURSOR.FOO`.

#### enum sdl.mouse.CURSOR_NAME

Maps values of [`sdl.mouse.CURSOR`](#enum-sdlmousecursor) back to their names so that `sdl.mouse.CURSOR_NAME[sdl.video.CURSOR.FOO] === 'FOO'`.

#### sdl.mouse.position

* `<object>`
  * `x: <number>` The x position of the mouse, relative to the screen.
  * `y: <number>` The y position of the mouse, relative to the screen.

The position of the mouse on the screen.

#### sdl.mouse.setPosition(x, y)

* `x: <number>` The new x position of the mouse, relative to the screen.
* `y: <number>` The new y position of the mouse, relative to the screen.

Moves the mouse to the specified position.

#### sdl.mouse.setCursor(cursor)

* `cursor: `[`<sdl.mouse.CURSOR>`](#enum-sdlmousecursor) The icon to use for the cursor.

Changes the icon that is displayed for the mouse cursor.

#### sdl.mouse.setCursorImage(width, height, stride, format, buffer, x, y)

* `width, height, stride, format, buffer: `[`<Image>`](#image-data) The image to use as a cursor.
* `x: <number>` The x position of the cursor image's hotspot.
* `y: <number>` The y position of the cursor image's hotspot.

Sets a image to be the mouse cursor. The hotspot represents the pixel that is considered to be under the mouse.

#### sdl.mouse.showCursor([show])

* `show: <boolean>` If `true` then the mouse cursor will be visible. Default `true`.

Changes the visibility of the mouse cursor.

#### sdl.mouse.hideCursor()

Equivalent to [`sdl.mouse.showCursor(false)`](#sdlmouseshowcursorshow).

#### sdl.mouse.capture([capture])

* `capture: <boolean>` If `true` the mouse will be captured by the current window. Default `true`.

When the mouse has been captured you will continue receiving mouse events even if the mouse is not over a window.

#### sdl.mouse.uncapture()

Equivalent to [`sdl.mouse.capture(false)`](#sdlmousecapturecapture).


### sdl.clipboard

#### sdl.clipboard.text

* `<string>`

The current text value on the clipboard.

#### sdl.clipboard.setText(text)

* `text: <string>` The new value to save on the clipboard.

Changes the text contents of the clipboard.


### Notes

#### Image data

There are 3 places in the API where you will need to provide an image to the library:
* [`window.render()`](#windowrenderwidth-height-stride-format-buffer)
* [`window.setIcon()`](#windowseticonwidth-height-stride-format-buffer)
* [`mouse.setCursorImage()`](#sdlmousesetcursorimagewidth-height-stride-format-buffer-x-y)

All three of these functions accept the image as a series of arguments:
* `width: <number>` The width of the image in pixels.
* `height: <number>` The height of the image in pixels.
* `stride: <number>` How many bytes each row of the image takes up in the buffer. This is usually equal to `width * bytesPerPixel`, but can be larger if the rows of the buffer are padded to always be some multiple of bytes.
* `format: `[`<sdl.video.FORMAT>`](#enum-sdlvideoformat) The binary representation of the data in the buffer.
* `buffer: <Buffer>` Holds the actual pixel data for the image, in the format and layout specified by all the above arguments.

So for example, to fill the window with a red+green gradient you could do:

```js
const R = 0
const G = 1
const B = 2
const A = 3

const { width, height } = window
const stride = width * 4
const buffer = Buffer.alloc(stride * height)

for (let i = 0; i < height; i++) {
  for (let j = 0; j < width; j++) {
    const offset = i * stride + j * 4
    buffer[offset + R] = Math.floor(256 * i / height)
    buffer[offset + G] = Math.floor(256 * j / width)
    buffer[offset + B] = 0
    buffer[offset + A] = 255
  }
}

window.render(width, height, stride, sdl.video.FORMAT.RGBA32, buffer)
```

#### Audio data

The [`playbackDevice.queue()`](#playbackdevicequeuebuffer-bytes) function expects a buffer of audio data as input and the [`recordingDevice.dequeue()`](#recordingdevicedequeuebuffer-bytes) function returns a buffer of audio data as output. The format of the data in these buffers depends on the options you passed to [`sdl.audio.openDevice()`](#sdlaudioopendevicedevice-options).

Audio data are a sequence of frames, with each frame being a sequence of samples. A _sample_ is a single number representing the intensity of a single audio channel at a specific point in time. For audio with multiple channels, each point in time is represented by one sample per channel. This is called a _frame_. The samples in a frame are arranged as follows:
* For 1 channel (mono) a frame contains just the one sample.
* For 2 channels (stereo) the frame's first sample will be the one for the left channel, followed by the one for the right channel.
* For 4 channels (quad) the layout is front-left, front-right, rear-left, rear-right.
* For 6 channels (5.1) the layout is front-left, front-right, center, low-freq, rear-left, rear-right.

So for example, to fill a buffer with 3 seconds of a 440Hz sine wave, assuming a `sdl.audio.FORMAT.F32` format, you could do:

```js
const TWO_PI = 2 * Math.PI

const { channels, frequency } = audioDevice
const bytesPerSample = 4

const sineAmplitude = 0.3
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
	const sample = Math.sin(angle) * sineAmplitude
	for (let j = 0; j < channels; j++) {
		offset = buffer.writeFloatLE(sample, offset)
	}
}
```
