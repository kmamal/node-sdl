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
