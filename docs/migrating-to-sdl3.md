# Migrating to SDL3

This version of `@kmamal/sdl` builds against SDL3 instead of SDL2.
Most of the JS API is unchanged, but SDL3 renamed, removed, or reshaped a number of things, and this library follows it rather than emulating the old shapes.
This guide lists every breaking change, grouped by subsystem, with the old and new code side by side.
See the [API Reference](https://github.com/kmamal/node-sdl/tree/master/docs/api-reference.md) for the full documentation of the new API and the [Changelog](https://github.com/kmamal/node-sdl/tree/master/CHANGELOG.md) for everything else that changed.

## Contents

- [Requirements](#requirements)
- [Gamepads (formerly controllers)](#gamepads-formerly-controllers)
- [Joysticks](#joysticks)
- [Keyboard](#keyboard)
- [Displays](#displays)
- [Windows](#windows)
- [Audio](#audio)
- [Touch](#touch)
- [Sensors](#sensors)
- [Mouse](#mouse)

## Requirements

- Node.js 22 or newer is required.
- On Linux, `window.native.handle` now holds a tagged `{ subsystem, display, window }` struct instead of a bare X11 window id, and the payloads handed to [@kmamal/gl](https://github.com/kmamal/headless-gl#readme) and [@kmamal/gpu](https://github.com/kmamal/gpu#readme) changed the same way. Older versions of those packages can't consume the new payload, so upgrade them together with this one.

## Gamepads (formerly controllers)

SDL3 renamed game controllers to gamepads, and this library follows.

| Before | After |
| --- | --- |
| `sdl.controller` | `sdl.gamepad` |
| `ControllerInstance` | `GamepadInstance` |
| `sdl.info.initialized.controller` | `sdl.info.initialized.gamepad` |
| joystick device `type: 'gamecontroller'` | `type: 'gamepad'` |

```js
// Before
const instance = sdl.controller.openDevice(sdl.controller.devices[0])

// After
const instance = sdl.gamepad.openDevice(sdl.gamepad.devices[0])
```

### Axes and buttons are named by position

SDL3 names gamepad buttons by their physical position instead of by the labels printed on an Xbox controller.
The names of `gamepadInstance.buttons` and the `button` property of `buttonDown` and `buttonUp` events changed accordingly:

| Before | After |
| --- | --- |
| `a`, `b`, `x`, `y` | `south`, `east`, `west`, `north` |
| `paddle1`, `paddle2`, `paddle3`, `paddle4` | `rightPaddle1`, `leftPaddle1`, `rightPaddle2`, `leftPaddle2` |

The axes, the d-pad, `guide`, `back`, `start`, the stick and shoulder buttons, `misc1`, and `touchpad` keep their names.
The buttons `misc2` through `misc6` are new.

```js
// Before
if (instance.buttons.a) { jump() }

// After
if (instance.buttons.south) { jump() }
```

To show the user which physical button that is, use the new `gamepadInstance.buttonLabels`, which reports the label printed on each face button (`'a'`, `'cross'`, ...):

```js
console.log(`Press ${instance.buttonLabels.south} to jump`)
```

Mapping strings are not affected. They still use `a:`, `b:`, `x:`, `y:` and friends, so existing mappings and the community database keep working with `sdl.gamepad.addMappings()`.

### Gamepad types

The types `'virtual'`, `'amazonLuna'`, `'googleStadia'`, and `'nvidiaShield'` no longer exist. SDL3 reports such devices as generic gamepads, which now show up as the new `'standard'` type instead of `null`.
The `'gamecube'` type is new.

### Power

The power level strings (`'empty'`, `'low'`, `'medium'`, `'full'`, `'wired'`, `'max'`) are gone.
`gamepadInstance.power` and the `powerUpdate` event now report SDL3's power info directly, in the same format as `sdl.power.info`:

```js
// Before
if (instance.power === 'low') { warn() }

// After
const { state, percent } = instance.power
if (state === 'battery' && percent !== null && percent <= 20) { warn() }
```

`state` is one of `'noBattery'`, `'battery'`, `'charging'`, `'charged'`, or `null` if unknown, and `percent` is a number or `null`.

### Rumble durations

`rumble()` and `rumbleTriggers()` now throw for durations above `65535` ms, the maximum SDL supports.
They used to be silently clamped.

## Joysticks

- `power` and the `powerUpdate` event changed exactly as described for [gamepads](#power).
- Axis values are now normalized relative to the axis's true center, like gamepad axes, instead of relative to whatever value the axis had when the device was opened. Pedals and throttles that rest at one end of their range now read `1` or `-1` at rest instead of `0`, and axes that rest at their maximum no longer report `NaN`.
- `rumble()` and `rumbleTriggers()` reject durations above `65535` ms, as for gamepads.
- Device types and hat positions follow SDL3's names in camel case: `'gamecontroller'` is `'gamepad'`, and `'arcadestick'`, `'flightstick'`, `'dancepad'`, `'drumkit'`, and `'arcadepad'` are `'arcadeStick'`, `'flightStick'`, `'dancePad'`, `'drumKit'`, and `'arcadePad'`. The diagonal hat positions `'rightup'`, `'rightdown'`, `'leftup'`, and `'leftdown'` are `'rightUp'`, `'rightDown'`, `'leftUp'`, and `'leftDown'`.

## Keyboard

### The space key

The space key is reported as `' '`, like every other character-producing key, instead of `'space'`.

```js
// Before
if (event.key === 'space') { ... }

// After
if (event.key === ' ') { ... }
```

### Media keys

The media scancodes and keys follow SDL3's names:

| Before (`sdl.keyboard.SCANCODE`) | After |
| --- | --- |
| `AUDIOPLAY` | `MEDIA_PLAY` |
| `AUDIOSTOP` | `MEDIA_STOP` |
| `AUDIONEXT` | `MEDIA_NEXT_TRACK` |
| `AUDIOPREV` | `MEDIA_PREVIOUS_TRACK` |
| `AUDIOREWIND` | `MEDIA_REWIND` |
| `AUDIOFASTFORWARD` | `MEDIA_FAST_FORWARD` |
| `EJECT` | `MEDIA_EJECT` |
| `MEDIASELECT` | `MEDIA_SELECT` |

| Before (key name) | After |
| --- | --- |
| `'audioPlay'` | `'mediaPlay'` |
| `'audioStop'` | `'mediaStop'` |
| `'audioNext'` | `'mediaTrackNext'` |
| `'audioPrev'` | `'mediaTrackPrevious'` |
| `'audioRewind'` | `'mediaRewind'` |
| `'audioFastForward'` | `'mediaFastForward'` |

The `'eject'` and `'mediaSelect'` key names are unchanged.

### Removed scancodes and keys

SDL3 dropped these scancodes, so they are gone from `sdl.keyboard.SCANCODE` along with the corresponding key names:
`AUDIOMUTE`, `WWW`, `MAIL`, `CALCULATOR`, `COMPUTER`, `BRIGHTNESSDOWN`, `BRIGHTNESSUP`, `DISPLAYSWITCH`, `KBDILLUMTOGGLE`, `KBDILLUMDOWN`, `KBDILLUMUP`, `APP1`, `APP2`.

## Displays

### Displays have ids

Display objects carry a stable `id`.
Hot-plug events and `createWindow({ display })` go by that id, and the `display` option must be one of the actual objects in `sdl.video.displays`:

```js
// Before: matched by name and position, a copy worked
sdl.video.createWindow({ display: { ...sdl.video.displays[1] } })

// After: must be the object from the list
sdl.video.createWindow({ display: sdl.video.displays[1] })
```

A display that is disconnected and reconnected is a new device with a new id, so you will receive a `displayRemove` followed by a `displayAdd` rather than the old object being updated in place.

### `dpi` is replaced by `scale`

SDL3 has no dpi query. Display objects report `scale` instead: the display's content scale, where `1` is the 96dpi baseline.

```js
// Before
const { horizontal } = display.dpi

// After
const pixelsPerInch = 96 * display.scale
```

The new `displayScaleChange`, `displayModeChange`, and `displayUsableChange` events on `sdl.video` report when `scale`, the current mode, or the usable region change.

## Windows

### Fractional coordinates

Mouse positions are floating point in SDL3. The `x` and `y` on `mouseMove`, `mouseButtonDown`, `mouseButtonUp`, and `mouseWheel` events and in `sdl.mouse.position` may be fractional on high-DPI displays and on backends that report sub-pixel pointer positions, so round them where you need integers.
`sdl.mouse.setPosition()` and the `dstRect` option of `window.render()` accept fractional values in return.

### Pixel format names

Pixel formats follow SDL3's names, which spell out the unused byte as `x`:

| Before | After |
| --- | --- |
| `'rgb444'` | `'xrgb4444'` |
| `'rgb555'`, `'bgr555'` | `'xrgb1555'`, `'xbgr1555'` |
| `'rgb888'`, `'bgr888'` | `'xrgb8888'`, `'xbgr8888'` |

This affects `window.render()`, `window.setIcon()`, `sdl.mouse.setCursorImage()`, the pixel-format helpers, and the `format` reported by displays.
All other pixel format names, including the `'rgba32'` family of byte-order aliases, are unchanged.
SDL3's additional formats are available as well: `'xbgr4444'`, the `'2101010'` variants, the 16-bit-per-channel integer and float formats (`'rgba64'`, `'rgba64f'`, ...), the 32-bit float formats (`'rgba128f'`, ...), the `'xrgb32'` family of aliases, and `'p010'`.

### Removed X11-only options

The `createWindow()` options `skipTaskbar`, `popupMenu`, `tooltip`, and `utility` are removed, along with the matching `window` getters.
SDL3 requires a parent window for popup menus and tooltips, which the library doesn't support, and hides the taskbar entry only through the utility flag.
Passing these options no longer has any effect.

### Removed `'best'` scaling

The `scaling: 'best'` option of `window.render()` is gone, since SDL3 only offers `'nearest'` and `'linear'`.
Passing it now throws.

```js
// Before
window.render(w, h, stride, format, buffer, { scaling: 'best' })

// After
window.render(w, h, stride, format, buffer, { scaling: 'linear' })
```

## Audio

SDL3 separates playback from recording devices and works with audio streams, and the JS API now mirrors that.

### Separate playback and recording modules

`sdl.audio.devices` and `sdl.audio.openDevice()` are replaced by `sdl.audio.playback` and `sdl.audio.recording`.
Each has its own `devices` list, `openDevice()` function, and `deviceAdd`/`deviceRemove` events, and device objects no longer have a `type`.

```js
// Before
const devices = sdl.audio.devices.filter(({ type }) => type === 'playback')
const instance = sdl.audio.openDevice(devices[0], { channels: 2 })
sdl.audio.on('deviceAdd', ({ device }) => { if (device.type === 'playback') { ... } })

// After
const devices = sdl.audio.playback.devices
const stream = sdl.audio.playback.openDevice(devices[0], { channels: 2 })
sdl.audio.playback.on('deviceAdd', ({ device }) => { ... })
```

To open the default device, pass no device (or `null`) instead of an object with only a `type`:

```js
// Before
const instance = sdl.audio.openDevice({ type: 'playback' }, options)

// After
const stream = sdl.audio.playback.openDevice(null, options)
const stream = sdl.audio.playback.openDevice()
```

Opening arbitrary driver-specific device names (such as a hostname for a remote audio server) is no longer possible, since SDL3 only opens devices it has enumerated.
The sample-format helpers (`sdl.audio.bytesPerSample()` and friends) are unchanged.
Streams can now be opened with any number of channels from 1 to 8, adding the 2.1, 4.1, 6.1, and 7.1 layouts.

### Instances are streams

| Before | After |
| --- | --- |
| `AudioInstance`, `AudioPlaybackInstance`, `AudioRecordingInstance` | `AudioStream`, `AudioPlaybackStream`, `AudioRecordingStream` |
| `playbackInstance.enqueue(buffer[, bytes])` | `playbackStream.putData(buffer[, bytes])` |
| `recordingInstance.dequeue(buffer[, bytes])` | `recordingStream.getData(buffer[, bytes])` |
| `recordingInstance.queued` | `recordingStream.available` |
| `audioInstance.clearQueue()` | `audioStream.clear()` |
| `audioInstance.name` | removed, use `audioStream.device?.name` |

`playbackStream.queued` keeps its name.
`audioStream.device` is now `null` for streams opened on the default device, where it used to echo back the `{ type }` object you passed in.

```js
// Before
const { queued } = recordingInstance
recordingInstance.dequeue(buffer.subarray(0, queued))
playbackInstance.enqueue(buffer)

// After
const { available } = recordingStream
recordingStream.getData(buffer.subarray(0, available))
playbackStream.putData(buffer)
```

### Sample format names

Sample formats follow SDL3's names. The endianness suffixes are `le` and `be`, and the unsuffixed names now mean native byte order (which SDL3's `SDL_AUDIO_S16`, `SDL_AUDIO_S32`, and `SDL_AUDIO_F32` also do) instead of being aliases for little-endian:

| Before | After |
| --- | --- |
| `'s16lsb'`, `'s16msb'` | `'s16le'`, `'s16be'` |
| `'s32lsb'`, `'s32msb'` | `'s32le'`, `'s32be'` |
| `'f32lsb'`, `'f32msb'` | `'f32le'`, `'f32be'` |
| `'s16sys'`, `'s32sys'`, `'f32sys'` | `'s16'`, `'s32'`, `'f32'` |

On the little-endian machines this library supports, `'s16'`, `'s32'`, and `'f32'` describe the same layout as before.

The unsigned 16-bit sample formats `'u16'`, `'u16lsb'`, `'u16msb'`, and `'u16sys'` are gone. SDL3 removed them.
Use `'s16'` or one of the 32-bit formats instead.

## Touch

Touch device `id`s and the `fingerId` on `fingerDown`, `fingerUp`, and `fingerMove` events are now `bigint`s.
They are 64-bit values in SDL, which a JS `number` can't always represent exactly.

```js
// Before
if (event.fingerId === 0) { ... }

// After
if (event.fingerId === 0n) { ... }
```

## Sensors

`sensorInstance.data` no longer has a `timestamp` property. SDL3 removed the timestamped sensor read it came from.

## Mouse

Cursor names follow SDL3's names, which describe the cursor's purpose rather than its shape:

| Before | After |
| --- | --- |
| `'arrow'` | `'default'` |
| `'ibeam'` | `'text'` |
| `'waitarrow'` | `'progress'` |
| `'sizenwse'`, `'sizenesw'` | `'nwseResize'`, `'neswResize'` |
| `'sizewe'`, `'sizens'` | `'ewResize'`, `'nsResize'` |
| `'sizeall'` | `'move'` |
| `'no'` | `'notAllowed'` |
| `'hand'` | `'pointer'` |

`'wait'` and `'crosshair'` are unchanged. The eight single-edge and corner resize cursors SDL3 added (`'nResize'`, `'neResize'`, ...) are new, as are the `X1` and `X2` entries of `sdl.mouse.BUTTON`.
