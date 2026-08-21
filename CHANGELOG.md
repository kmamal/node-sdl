# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Declared support for Node.js >= 22 in `package.json`, and pinned the native addon to the matching Node-API version 9.

### Added

- Relative mouse mode for FPS-style camera controls, via `sdl.mouse.setRelativeMode()` and `sdl.mouse.relativeMode`.
- `mouseMove` events now report the mouse's relative movement through `dx` and `dy`.
- Prebuilt binaries for Windows on arm64.

### Fixed

- Connecting or disconnecting a display no longer crashes the process.
- Stale SDL errors no longer cause spurious throws (and lost data) in `dequeue()`, `resize` events, and joystick/controller opening.
- Joystick axes that rest at their maximum value (such as pedals) no longer report `NaN`.
- The right GUI key now reports the documented `'gui'` key name instead of `'gUI'`.
- `sdl.keyboard.getScancode()` now resolves single-character keys such as `','` and `'0'` to the main keyboard keys instead of the keypad ones.
- An exception thrown from a `move` or `resize` listener while the window is being dragged no longer crashes the process. It surfaces as a normal exception instead.
- `mouseWheel` events now report the mouse position at the time of the event, and carry precise fractional `dx`/`dy` values so high-resolution trackpad scrolls no longer arrive as `0`.
- Buffer size validation for the planar YUV formats now accounts for SDL rounding the chroma planes up, preventing an out-of-bounds read for odd dimensions.
- `buffered` values larger than `32768` are now rejected instead of silently truncating to a driver-chosen buffer size.
- A failure while opening a joystick or controller no longer leaks the SDL handle.
- A failure while creating a window (such as renderer creation failing) no longer leaks the SDL window.
- `sdl.sensor.devices` no longer crashes when a sensor disappears while the list is being read. Its `name` is `null` instead.
- `sdl.clipboard.text` no longer throws when another application empties the clipboard mid-read.
- `audioInstance.queued` no longer reports negative values for queues over 2 GiB.
- `window.setSizeInPixels()` now reports the actual resulting pixel size instead of assuming the requested one was applied.
- Displays with a pixel format that has no exposed name report `format: null` instead of an empty string. The same applies to unknown controller axis and button names in events.
- `sdl.mouse.getButton(32)` no longer relies on undefined behavior.
- Renderer error messages now include the flag values instead of pointer addresses.
- `window.render()` now throws if updating the texture fails instead of silently presenting stale contents.
- A failure to recreate the render texture (such as an oversized `render()`) no longer leaves a dangling texture pointer that corrupts memory on later calls.
- Plugging or unplugging an audio device no longer fires spurious `deviceAdd`/`deviceRemove` events for unrelated devices.
- `sdl.sensor.devices` now reports `side` for left/right sensors (such as Joy-Con pairs) instead of always `null`.
- A `blur` or `leave` event no longer clears `sdl.video.focused`/`sdl.video.hovered` when another window has already gained focus or hover.
- Orientation or move events for a display disconnected in the same batch no longer crash the process.
- Sensor instances left open on exit are now closed (and emit `close`) like all other instance types.
- The `power` and `steamHandle` getters now poll for pending events first, like the other instance getters, instead of returning stale values.
- `displayOrient` events with an unknown orientation report `null` instead of an empty string.
- `sdl.clipboard.text` now throws instead of crashing if SDL fails to allocate the clipboard string.
- The initial `resize` event is no longer delivered to windows destroyed in the same tick they were created.
- The `displayMove` event is now emitted instead of throwing "invalid event".
- The `displayOrient` and `displayMove` events now carry the documented `device` property.
- The `close` event of joystick, controller, sensor, and audio instances now passes the documented `{ type: 'close' }` event object.
- `sdl.sensor.openDevice()` no longer throws a `TypeError`, and `sdl.sensor.devices` no longer throws for sensors of unknown type (their `type` is `null`).
- Many fixes to the TypeScript declarations to match the implementation.
- Touch events no longer crash event handling.
- An exception thrown in an event listener no longer permanently stops event delivery.
- The `steamHandleUpdate` event is now emitted correctly instead of a spurious `remap` event.
- `rumbleTriggers()` no longer stops the main rumble motors when its duration elapses, and pending rumble timeouts are cleared on close.
- Opening the same joystick, controller, or sensor multiple times no longer leaks the SDL handle.
- Windows now report their actual size on creation (a fullscreen window no longer reports the default 640x480).
- `move` and `resize` events are no longer delivered twice.
- Fixed a use-after-free when destroying a window, and memory leaks in `mouse.setCursor()` and in file drop events.
- Image `stride` and buffer sizes are now validated in bytes, preventing out-of-bounds reads in native code.
- Sensor device objects now remain valid across reads of `sdl.sensor.devices`.
- `mouseWheel`'s `flipped` property is now a boolean.
- Smaller fixes: `mouse.getButton()` accepts the correct button range, `setSizeInPixels()` reports the right error, the audio keep-alive duration uses correct units, and rumble durations are validated consistently.
- The `npm run build` script now honors pre-set `SDL_INC`/`SDL_LIB` environment variables, so it can build against a system or custom SDL.
- The library no longer fails to load on systems where the audio or video subsystem can't be initialized, such as headless servers.
- Rebuilds that invoke `node-gyp` directly (such as `electron-rebuild`) now work: the SDL paths are resolved at configure time, SDL is downloaded automatically if missing, and the rebuilt addon is copied to `dist/` where the library loads it from.

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

[unreleased]: https://github.com/kmamal/node-sdl/compare/v0.11.13...HEAD
[v0.11.13]: https://github.com/kmamal/node-sdl/compare/v0.11.12...v0.11.13
[v0.11.12]: https://github.com/kmamal/node-sdl/compare/v0.11.11...v0.11.12
[v0.11.11]: https://github.com/kmamal/node-sdl/compare/v0.11.10...v0.11.11
[v0.11.10]: https://github.com/kmamal/node-sdl/compare/v0.11.9...v0.11.10
[v0.11.9]: https://github.com/kmamal/node-sdl/compare/v0.11.8...v0.11.9
[v0.11.8]: https://github.com/kmamal/node-sdl/compare/v0.11.7...v0.11.8
[v0.11.7]: https://github.com/kmamal/node-sdl/releases/tag/v0.11.7
