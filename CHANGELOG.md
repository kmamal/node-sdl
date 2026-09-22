# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Breaking:** Touch device `id`s and the `fingerId` on touch events are now `bigint`s. They are 64-bit values in SDL, which a JS `number` can't always represent exactly.
- **Breaking (Linux):** `window.native.handle` now holds a tagged `{ subsystem, display, window }` struct instead of a bare X11 window id, and the internal payloads passed to `@kmamal/gl`/`@kmamal/gpu` changed the same way. Older versions of those packages can't consume the new payload — upgrade them together with this one.
- Declared support for Node.js >= 22 in `package.json`, and pinned the native addon to the matching Node-API version 9.
- **Breaking:** The space key is now reported as `' '`, like every other character-producing key, instead of `'space'`.
- **Breaking:** Joystick axes are now normalized relative to the axis's true center, like controller axes, instead of relative to whatever value the axis had when the device was opened. Pedals and throttles that rest at one end of their range now read `1` or `-1` at rest instead of `0`, and axes that rest at their maximum no longer report `NaN`.
- **Breaking:** `rumble()` and `rumbleTriggers()` now reject durations above `65535` ms, the maximum SDL supports. Longer durations used to be silently clamped by SDL while the process was still kept alive for the full requested time.
- The `'max'` joystick power level was removed from the docs and types. It is SDL's count sentinel and can never actually be reported.

### Added

- Native window handles under the Wayland video driver (`SDL_VIDEODRIVER=wayland`). `window.native` now carries valid Wayland objects instead of garbage reinterpreted as X11 handles, and a new `window.native.subsystem` field (`'x11'` or `'wayland'`, Linux only) says which kind you're holding. Any other Linux video driver now yields `handle: null` and a clear error for `opengl`/`webgpu` windows.
- Relative mouse mode for FPS-style camera controls, via `sdl.mouse.setRelativeMode()`, `sdl.mouse.unsetRelativeMode()`, and `sdl.mouse.relativeMode`.
- `sdl.mouse.captured`, reporting whether `sdl.mouse.capture()` is currently in effect.
- `mouseMove` events now report the mouse's relative movement through `dx` and `dy`.
- `ballMotion` events now report the ball's relative movement through `dx` and `dy`, alongside the accumulated `x` and `y` position.
- Pixel-format helpers `sdl.video.bytesPerPixel()`, `sdl.video.isYuv()`, `sdl.video.isPlanarYuv()`, and `sdl.video.minBufferSize()`, mirroring the existing audio sample-format helpers.
- `@kmamal/sdl/helpers` now also exposes the pixel-format helpers and the `keyboard.SCANCODE`, `mouse.BUTTON`, and `sensor.STANDARD_GRAVITY` constants, under the same paths as in the main module.
- Prebuilt binaries for Windows on arm64.
- The `npm run build` script honors pre-set `SDL_INC`/`SDL_LIB` environment variables, so it can build against a system or custom SDL.
- Controller buttons `misc1` (the Xbox Series X share button, PS5 microphone button, Switch Pro capture button, or Luna microphone button) and `touchpad` (PS4/PS5 touchpad click). They used to arrive as `buttonDown`/`buttonUp` events with `button: null` and pollute `controllerInstance.buttons` with a `null` key.
- Scancodes `SOFTLEFT`, `SOFTRIGHT`, `CALL`, and `ENDCALL`, and the corresponding `'softLeft'`, `'softRight'`, `'call'`, and `'endCall'` keys.

### Fixed

Windows and events:

- `move` and `resize` events are no longer delivered twice.
- An exception thrown in an event listener no longer permanently stops event delivery.
- An exception thrown from a `move` or `resize` listener while the window is being dragged no longer crashes the process. It surfaces as a normal exception instead.
- Calling `window.destroy()` from a `move` or `resize` listener that fires while the window is being dragged or resized no longer risks a crash. The window reports `destroyed` immediately, and the native window is destroyed once it is safe to do so.
- Calling `window.destroy()` from a `beforeClose` listener no longer crashes the process. `destroyGently()` used to call `destroy()` afterwards anyway, and the resulting "window is destroyed" error propagated out of the event poll loop as an uncaught exception.
- Removing all of a window's listeners (whether via `removeAllListeners()` or one `removeListener()` at a time) no longer breaks event polling, no longer lets the process exit while the window is still open, and no longer turns `window.destroy()` into a silent no-op. It used to also remove the internal keep-alive listener.
- Listening for `newListener` or `removeListener` no longer engages fast event polling that keeps the process alive and could never be turned back off.
- `emit()` on windows and instances now returns whether the event had listeners, as the `EventEmitter` contract specifies, instead of `undefined`.
- A `close` listener that throws (with no `error` listener to catch it) no longer leaves the destroyed window's or closed instance's listeners registered, which kept event polling engaged and the process alive forever.
- Closing the last window via its close button no longer fires `beforeClose` twice. SDL used to follow the window's close event with a quit event, and the quit handling asked the same window to close again, so a listener that called `prevent()` was bypassed on the second round.
- Windows now report their actual size on creation (a fullscreen window no longer reports the default 640x480).
- The initial `resize` event is no longer delivered to windows destroyed in the same tick they were created.
- `window.setSizeInPixels()` now reports the actual resulting pixel size instead of assuming the requested one was applied, and its error messages state the correct required multiple instead of its inverse.
- `setResizable()` and `setBorderless()` now enforce the same mutual exclusivity that `createWindow()` does, instead of letting the invariant be bypassed after creation.
- `window.render()` now throws if updating the texture fails instead of silently presenting stale contents.
- A failure to recreate the render texture (such as an oversized `render()`) no longer leaves a dangling texture pointer that corrupts memory on later calls, and destroying a window whose renderer could not be rebuilt (after a failed `setVsync()` or `setAccelerated()` call) no longer leaks its texture cache entry.
- Renderer error messages now include the flag values instead of pointer addresses.
- Image `stride` and buffer sizes are now validated in bytes, preventing out-of-bounds reads in native code. For the planar YUV formats the check also accounts for SDL rounding the chroma planes up, so odd dimensions no longer read out of bounds either.
- `window.setIcon()` and `mouse.setCursorImage()` now reject YUV pixel formats with a clear validation error. SDL cannot create surfaces from them, so they always failed — but with a cryptic native error.
- A `blur` or `leave` event no longer clears `sdl.video.focused`/`sdl.video.hovered` when another window has already gained focus or hover.
- `sdl.video.focused` and `sdl.video.hovered` now pump events first, like the per-window getters, instead of returning stale values.

Displays:

- Connecting or disconnecting a display no longer crashes the process, including when the display disappears while its hot-plug, orientation, or move event is being processed.
- Displays are now looked up by their SDL index instead of their position in `sdl.video.displays`, which diverge when a display vanishes mid-enumeration. `displayOrient`/`displayMove` events used to update and report the wrong display, `createWindow()` with the `display` option could open the window on the wrong display, and `window.display` could return the wrong one. `window.display` (and the `display` on `displayChange` events) is now `null` when the window's display has been removed.
- `createWindow()` now matches the `display` option on both name and position, so it can tell identical monitors apart, and throws if the display is not found instead of silently falling back to the first display.
- The `displayMove` event is now emitted instead of throwing "invalid event", and both `displayOrient` and `displayMove` events now carry the documented `device` property.
- `sdl.video.displays` now returns a copy of the display list, so modifying it no longer corrupts the library's internal state.
- Display modes with a 32-bit RGBA pixel format now report it under its `*8888` name (such as `'argb8888'`) instead of the endianness-dependent `*32` alias (such as `'bgra32'`). The two are the same SDL format, but the `*8888` names were documented as possible values and could never actually appear.

Mouse and keyboard:

- `mouseWheel` events now report the mouse position at the time of the event, carry precise fractional `dx`/`dy` values so high-resolution trackpad scrolls no longer arrive as `0`, and have a boolean `flipped` property.
- `mouse.getButton()` now pumps events first, so it returns the current button state instead of values up to a second old. It also accepts the correct button range, and no longer relies on undefined behavior for button 32.
- The right GUI key now reports the documented `'gui'` key name instead of `'gUI'`.
- `sdl.keyboard.getScancode()` now resolves single-character keys such as `','` and `'0'` to the main keyboard keys instead of the keypad ones.

Touch:

- Touch events no longer crash event handling. Events synthesized from the mouse arrive with a `null` `device`, and events for a device that disconnected before they were polled are dropped.
- `sdl.touch.devices` now refetches the device list on every read. It used to return the list from module load time forever, since SDL emits no touch hot-plug events that could refresh it.

Joysticks and controllers:

- Unplugging a device no longer mis-identifies the remaining ones. Device reconciliation used to match devices by list position (or by name for audio), so removing a non-last joystick, controller, or display made cached device objects silently morph into other devices and made `deviceRemove`/`displayRemove` events report the wrong device. Joysticks and controllers are now matched by their stable SDL instance id; displays by name and geometry; audio devices with identical names by their relative order. As a side effect, `sdl.audio.devices` is no longer sorted by name — devices now stay in SDL's enumeration order, like every other device list.
- `openDevice()` no longer risks opening the wrong physical device when another device's unplugging hasn't been processed yet. SDL compacts device indexes on removal, so opening through a stale index could silently target a different device (whose events would then route to the wrong instance) — joysticks and controllers now flush pending device events, and sensors refetch the device list, before validating and opening.
- Closing a joystick or controller instance from an event listener no longer crashes the process when more events for that instance are still in the queue.
- Controller trigger axes now correctly report `0` when released instead of `0.5`, and inverted or half-axis mappings are no longer mis-scaled.
- Trackball state and `ballMotion` events now report accumulated positions as documented, instead of the latest relative motion. Positions start at `0` when the instance is opened, instead of at whatever relative motion SDL happened to have accumulated since its last poll.
- `sdl.joystick.devices` and `sdl.controller.devices` now return a copy of the device list, like `sdl.video.displays`, so modifying it no longer corrupts the library's internal state.
- `rumble(0, 0)` and `rumbleTriggers(0, 0)` no longer schedule a keep-alive timer, so they no longer delay process exit while nothing is rumbling. `stopRumble()` and `stopRumbleTriggers()` are now truly equivalent to them, as documented.
- Controller instances now receive `powerUpdate` events even when the device is not also open as a joystick.
- The `steamHandleUpdate` event is now emitted correctly instead of a spurious `remap` event.
- The `power` and `steamHandle` getters now poll for pending events first, like the other instance getters, instead of returning stale values.
- `rumbleTriggers()` no longer stops the main rumble motors when its duration elapses, and pending rumble timeouts are cleared on close.
- Closing a joystick or controller instance now stops any rumble that instance started. When another instance kept the same physical device open, the effect used to keep running with nothing holding the process alive, so the program could exit mid-rumble.
- A joystick or controller disconnecting mid-rumble no longer crashes the process when the rumble auto-stop timer fires.
- Rumble and LED intensities are now rounded to the nearest hardware step instead of truncated, so values just below a step (such as `0.9999`) no longer land one step low.
- `sdl.controller.addMappings()` now refreshes the device lists even when one of the mappings is invalid, so the devices made available by the mappings before it are reported.

Instances (joystick, controller, sensor, and audio):

- Reading state from a closed instance — including on the very read that discovers the device's removal — now throws "instance is closed" for every member (`axes`, `balls`, `buttons`, `hats`, `power`, `steamHandle`, sensor `data`), instead of returning stale state or, for sensors, a raw native error.
- Closing is now robust against listeners: `closed` reports `true` while the `close` event is being emitted (so a listener that calls `close()` again no longer recurses forever), teardown completes before `close` is emitted (so a throwing listener no longer strands a closed-but-still-registered instance that leaks its handle and crashes the exit-time cleanup), and a device removal closes all of the device's instances and reconciles the device lists even when a listener throws.
- The `close` event now passes the documented `{ type: 'close' }` event object.
- Sensor instances left open on exit are now closed (and emit `close`) like all other instance types.
- SDL is now shut down on exit even if a `close` listener throws during the exit-time cleanup.

Sensors:

- `sdl.sensor.devices` no longer crashes when a sensor disappears while the list is being read (its `name` is `null`), no longer throws for sensors of unknown type (their `type` is `null`), and its device objects now remain valid across reads. `sdl.sensor.openDevice()` no longer throws a `TypeError`.
- `sdl.sensor.devices` now reports `side` for left/right sensors (such as Joy-Con pairs) instead of always `null`.
- Reading a sensor instance's `data` now pumps events first, so it returns current readings instead of values up to a second old.

Audio:

- The keep-alive timer that lets queued audio finish playing before the process exits now computes the device buffer's duration correctly.
- Closing or pausing a playback instance while Node.js is waiting for its queued audio to drain no longer keeps the process alive for the full queued duration.
- The exit-time check for queued audio no longer throws when the device of a playing instance was unplugged just before the process would exit.
- `enqueue()` and `dequeue()` now accept empty buffers as no-ops, as the README already implied, instead of throwing "invalid numBytes" on the zero-length chunks streaming pipelines naturally produce.
- `buffered` values larger than `32768` are now rejected instead of silently truncating to a driver-chosen buffer size.
- `audioInstance.queued` no longer reports negative values for queues over 2 GiB.
- `readSample()` and `writeSample()` now reject non-`Buffer` arguments with a validation error instead of silently operating on array-likes.
- `zeroSampleValue` for the unsigned audio formats now matches SDL's silence value (`128` for `u8`, `32768` for `u16`) instead of being one below it.
- Plugging or unplugging an audio device no longer fires spurious `deviceAdd`/`deviceRemove` events for unrelated devices.
- Unplugging an audio device now closes every instance opened from it, as documented, instead of only the first one SDL reports, and the device list is reconciled even when a `close` listener throws.
- An audio device disappearing while the device list is being enumerated no longer crashes the process. The audio backend's own notification thread can remove a device mid-enumeration; the resulting error used to escape the internal polling loop as an uncaught exception. Devices that vanish mid-query are now skipped, like displays already were.

Clipboard:

- `sdl.clipboard.text` no longer throws when another application empties the clipboard mid-read, throws instead of crashing if SDL fails to allocate the clipboard string, and no longer leaks the SDL-side copy of the text if creating the JS string fails (e.g. clipboard content beyond the JS string size limit).

Validation and errors:

- Passing a non-object (including `null`) as `options` to `createWindow()` or `audio.openDevice()`, or calling `enqueue()`/`dequeue()` without a buffer, now fails with the intended validation error instead of a raw `TypeError`. A non-object `options` used to be silently ignored by `createWindow()`.
- Passing names of inherited `Object` members (such as `'constructor'` or `'toString'`) as keys, pixel formats, audio formats, cursors, or other enum values now fails validation with the intended error instead of leaking through to the native layer or, in the audio format helpers (on both `sdl.audio` and `@kmamal/sdl/helpers`), silently returning `undefined` or failing with a raw `TypeError`.
- Integer arguments are now validated to fit in 32 bits everywhere the native layer reads them as such (window positions and sizes, image dimensions and strides, mouse position, rumble durations, player indices, audio frequency, `numBytes`). Larger values used to silently wrap — `setSize(2 ** 32 + 100, 100)` set width 100, `rumble` durations above 2³¹−1 broke the auto-stop timer, and `setPlayer(2 ** 31)` silently behaved like `resetPlayer()`.
- Enum values this build of the library doesn't know (a joystick or controller type, sensor type, power state, joystick power level, display orientation, display pixel format, touch device type, hat position, or controller axis or button name introduced by a newer runtime SDL) are now reported as `null` instead of an empty string.
- SDL errors are now detected by checking the error message contents instead of comparing `SDL_GetError()` pointers, which silently missed all errors when linked against an SDL build that returns a single static buffer. Stale SDL errors no longer cause spurious throws (and lost data) in `dequeue()`, `resize` events, and joystick/controller opening, and window methods called on a destroyed window now fail with a clear "invalid window id" error instead of appending whatever stale error text an earlier unrelated call had left behind.

Native resource handling:

- Fixed a use-after-free when destroying a window.
- Fixed native leaks: opening the same joystick, controller, or sensor multiple times, a failure while opening a joystick or controller, a failure while creating a window (such as renderer creation failing), a failure to create the JS counterpart of a controller mapping string during device enumeration, `mouse.setCursor()`, and file drop events all used to leak the corresponding SDL resource.
- SDL event types the library doesn't handle (such as controller touchpad events) no longer make a wasted native-to-JS call per event.

Docs, types, and loading:

- Many fixes to the TypeScript declarations to match the implementation. Every event-emitting object is now declared as an `EventEmitter` (so `once()`, `off()`, `removeAllListeners()`, e.t.c. type-check), the `'error'` event is declared, the `sdl.video` pixel-format helpers and the new mouse members are included, and the whole `@kmamal/sdl/helpers` sub-module is covered instead of only its `audio` part.
- The virtual key `'clear/again'` is now included in the README's virtual-key list. It was the only key value the mapping could produce that the docs omitted.
- `window.native.subsystem` is now `null` on Windows and macOS instead of absent, and is no longer optional in the types.
- Type fixes: `createWindow()`'s `x` and `y` options accept `null`, and the `orientation` on `displayOrient` events is nullable, both matching the implementation and docs.
- The docs now state the constraints the API enforces on rumble `duration`, audio `frequency`, and the `bytes` argument of `enqueue()`/`dequeue()`.
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

[unreleased]: https://github.com/kmamal/node-sdl/compare/v0.11.13...HEAD
[v0.11.13]: https://github.com/kmamal/node-sdl/compare/v0.11.12...v0.11.13
[v0.11.12]: https://github.com/kmamal/node-sdl/compare/v0.11.11...v0.11.12
[v0.11.11]: https://github.com/kmamal/node-sdl/compare/v0.11.10...v0.11.11
[v0.11.10]: https://github.com/kmamal/node-sdl/compare/v0.11.9...v0.11.10
[v0.11.9]: https://github.com/kmamal/node-sdl/compare/v0.11.8...v0.11.9
[v0.11.8]: https://github.com/kmamal/node-sdl/compare/v0.11.7...v0.11.8
[v0.11.7]: https://github.com/kmamal/node-sdl/releases/tag/v0.11.7
