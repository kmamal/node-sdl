# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.0.0] - 2026-10-01

The library now builds against SDL3 (3.4.x) instead of SDL2. This release contains breaking changes, see the [migration guide](https://github.com/kmamal/node-sdl/tree/master/docs/migrating-to-sdl3.md) for a walkthrough.

### Changed

- Exceptions thrown in event listeners are re-emitted as an `'error'` event on the window or instance, following the usual `EventEmitter` semantics: with no `'error'` listener they surface as an uncaught exception. They no longer stop event delivery or crash the process.
- Attaching a listener to a destroyed window or a closed instance or stream now throws, instead of silently never firing.
- Audio and video formats are reported using the platform-independent enums. The platform-dependent ones are only used as input.
- Character keys are reported as the unshifted character (`'ü'` instead of `'Ü'`), so `getKey(getScancode('ü'))` round-trips.
- steamHandle is now reported as a BigInt.

### Added

- Windows arm64 build
- Wayland support
- Support FreeBSD, OpenBSD, and NetBSD.
- `NODE_SDL_SYSTEM=1 npm install` builds against the SDL already installed on the system (located through `pkg-config`, or `SDL_INC`/`SDL_LIB`) instead of downloading one.
- Relative mouse mode for FPS-style camera controls.
- `mouseMove` and `ballMotion` events report relative movement through `dx` and `dy`.
- Window event `'fingerCancel'`, fired when the system cancels a touch.
- Audio device objects report the `format`, `channels`, `frequency`, and `buffered` the device is running with while streams are open on them.
- Gamepad buttons `misc1` and `touchpad` are now reported instead of arriving with `button: null`.
- Pixel-format helpers similar to audio format helpers.
- More stuff in `@kmamal/sdl/helpers`
- More scancodes and keys

### Fixed

Windows:

- A new window reports its actual position, size, display, and flags on creation (a fullscreen window no longer reports 640x480), including when it is created from inside an event listener.
- OpenGL and WebGPU windows have no SDL renderer, so `createWindow()` now throws if you pass `accelerated` or `vsync` together with `opengl` or `webgpu`, instead of ignoring the option.
- `resize` fires, and `pixelWidth`/`pixelHeight` update, when only the pixel size changes (for example when moving to a display with a different scale).
- `move` and `resize` events are no longer delivered twice.
- Closing the last window via its close button no longer fires `beforeClose` twice, which bypassed `prevent()`.
- Windows created with `visible: false` no longer receive an initial `expose` event until they are shown.
- `window.fullscreen`, `minimized`, `maximized`, `visible`, and `focused` only change when the windowing system reports the change.
- `fullscreen` is no longer reset when the window is minimized, maximized, or restored.
- `window.setSizeInPixels()` no longer rejects almost every size on displays with a fractional scale.
- `setResizable()` and `setBorderless()` enforce the same mutual exclusivity as `createWindow()`.
- `window.destroy()` no longer crashes when called from a `beforeClose` listener, or from a `move` or `resize` listener while the window is being dragged.
- Removing all of a window's listeners no longer breaks event polling, lets the process exit while the window is open, or turns `destroy()` into a no-op.
- `window.render()` throws instead of silently presenting stale contents when updating the texture fails, and no longer corrupts memory or leaks after a failed render or renderer switch.
- Windows recover from a lost graphics device instead of failing every `render()` from then on.
- `window.render()` validates image `stride` and buffer sizes, preventing out-of-bounds reads, including for planar and packed YUV formats with odd dimensions.
- `window.setIcon()` and `mouse.setCursorImage()` reject YUV pixel formats with a clear error.
- A `blur` or `leave` event no longer clears `sdl.video.focused`/`sdl.video.hovered` when another window has already gained focus or hover, and both now return current values.

Displays:

- Connecting or disconnecting a display no longer crashes the process.
- `window.display` is `null` when its display has been removed.
- The `displayMove` event is emitted instead of throwing "invalid event", and `displayOrient` and `displayMove` events carry the documented `device` property
- A display's `frequency` is `null` instead of `0` when the refresh rate is unknown.

Mouse and keyboard:

- The space key is reported as `' '`, like every other character-producing key, instead of `'space'`.
- `mouse.getButton()` returns the current button state instead of old values.
- The right GUI key reports the documented `'gui'` key name instead of `'gUI'`.
- The GUI keys on Windows and the GUI and Alt keys on macOS report `'windows'`, `'command'`, and `'option'` instead of `null`.
- Keys outside the Basic Multilingual Plane (such as emoji) are reported as that character instead of `null`.
- `sdl.keyboard.getScancode()` resolves single-character keys such as `','` and `'0'` to the main keyboard keys instead of the keypad ones.
- `sdl.keyboard.getKey()` agrees with the `key` of keyboard events on AZERTY and non-Latin layouts, and both functions pick up a layout change right away.

Touch:

- Touch events no longer crash event handling.
- `sdl.touch.devices` is refreshed on every read instead of returning the list from startup, and no longer lists the virtual devices SDL creates for events synthesized from the mouse and pen. Those events arrive with a `null` `device`.

Joysticks and gamepads:

- Unplugging a device no longer makes the remaining joystick, gamepad, display, or audio devices report the wrong identity, and `deviceRemove`/`displayRemove` report the right device.
- `openDevice()` no longer risks opening the wrong physical device while another device is being unplugged.
- Closing an instance from an event listener no longer crashes the process.
- Removed the axis scaling to their initial value.
- Trackball state and `ballMotion` events report accumulated positions.
- Rumble takes into account that the motors are owned by the device and may be shared across instances.
- `hasLed`, `hasRumble`, and `hasRumbleTriggers` report the device's current capabilities, and `setLed()`, `rumble()`, `stopRumble()`, `rumbleTriggers()`, and `stopRumbleTriggers()` consistently throw when the device lacks the hardware.
- `sdl.gamepad.addMappings()` refreshes the device lists (including `sdl.joystick.devices`) even when a mapping is invalid, and throws the error for the invalid mapping. The `mapping`, `name`, and `type` of a device are up to date when its `remap` event fires.
- `setPlayer()` and `resetPlayer()` update `player` on all of the device's objects, including the device that previously held the requested index, and throw if SDL refuses the assignment.
- The `power` and `steamHandle` getters, and sensor `data`, return current values instead of stale ones.

Sensors:

- `sdl.sensor.devices` no longer crashes when a sensor disappears while the list is read or throws for sensors of unknown type, and reports `side` for left/right sensors (such as Joy-Con pairs).
- `sdl.sensor.openDevice()` no longer throws a `TypeError`.

Audio:

- `putData()` and `getData()` accept empty buffers as no-ops, and reject a `bytes` count that isn't a whole number of sample frames with a validation error.
- `buffered` values larger than `32768` are rejected instead of silently truncated, and the buffer size the driver actually uses is reported on the stream's device.
- `playbackStream.queued` no longer reports negative values for queues over 2 GiB.
- `stream.playing` is `false` once the stream is closed.
- `readSample()` and `writeSample()` reject non-`Buffer` arguments, and `zeroSampleValue` for `u8` is `128`.
- Unplugging an audio device closes every stream opened from it, and plugging or unplugging one no longer fires spurious events for unrelated devices or crashes the process.

Other:

- Fixed native memory leaks when opening devices, creating windows, setting cursors, and handling file drops.
- Listening for `newListener` or `removeListener` no longer keeps the process alive forever.
- `emit()` now returns whether the event had listeners, as `EventEmitter` specifies.
- `sdl.clipboard.text` no longer throws when another application empties the clipboard mid-read.
- Integer arguments that cross into native code are validated to fit in 32 bits instead of silently wrapping.
- Enum values this build doesn't know are reported as `null` instead of an empty string.
- SDL errors are detected reliably, and stale SDL errors no longer cause spurious "SDL silent error" throws or lost data.
- The library no longer fails to load on systems where the audio or video subsystem can't be initialized, such as headless servers.

## [v0.11.13] - 2025-08-30

### Fixed

- Allow `window.native.handle` to be `null` in case `SDL_GetWindowWMInfo` failed.

## [v0.11.12] - 2025-07-24

### Added

- Touch support
  - Added `sdl.touch` which lists the available touch devices.
  - Added `fingerDown`, `fingerUp`, and `fingerMove` events to window.

## [v0.11.11] - 2025-07-21

### Added

- The `powerUpdate` event lets you know when a joystick or controller's power level has changed.
- The `steamHandleUpdate` event lets you know when a controller's Steam handle has changed.
- The `keymapChange` event lets you know when the keyboard layout has changed.

## [v0.11.10] - 2025-07-19

### Changed

- Made it optional to initialize the joystick, controller, haptic, or sensor subsystems during SDL initialization. Failing to initialize any of these is not fatal to the application. The new `sdl.info.initialized` object contains relevant information.

## [v0.11.9] - 2025-07-18

### Fixed

- Fixed some cases where the bindings were raising exceptions even though the situation was expected and non-fatal.
  - When getting the `name`, `guid`, or `path` property for joystick devices.
  - When getting the `name`, `guid`, `path`, or `mapping` property for controller devices.
  - When getting the `name` property for displays.

## [v0.11.8] - 2025-06-26

### Changed

- Upgraded SDL to v2.32.8.

## [v0.11.7] - 2025-03-14

### Added

- Started keeping this changelog.

[unreleased]: https://github.com/kmamal/node-sdl/compare/v1.0.0...HEAD
[v1.0.0]: https://github.com/kmamal/node-sdl/compare/v0.11.13...v1.0.0
[v0.11.13]: https://github.com/kmamal/node-sdl/compare/v0.11.12...v0.11.13
[v0.11.12]: https://github.com/kmamal/node-sdl/compare/v0.11.11...v0.11.12
[v0.11.11]: https://github.com/kmamal/node-sdl/compare/v0.11.10...v0.11.11
[v0.11.10]: https://github.com/kmamal/node-sdl/compare/v0.11.9...v0.11.10
[v0.11.9]: https://github.com/kmamal/node-sdl/compare/v0.11.8...v0.11.9
[v0.11.8]: https://github.com/kmamal/node-sdl/compare/v0.11.7...v0.11.8
[v0.11.7]: https://github.com/kmamal/node-sdl/releases/tag/v0.11.7
