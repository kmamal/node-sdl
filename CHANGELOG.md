# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

See the [migration guide](https://github.com/kmamal/node-sdl/tree/master/docs/migrating-to-sdl3.md) for a walkthrough of the breaking changes.

### Changed

- **Breaking:** The library now builds against SDL3 (3.4.x) instead of SDL2. Most of the JS API is unchanged, but some values shifted with SDL's own changes:
  - Audio: sample formats follow SDL3's names: `s16le`/`s16be`, `s32le`/`s32be`, and `f32le`/`f32be` replace the `lsb`/`msb` variants, and the unsuffixed `s16`, `s32`, and `f32` now mean native byte order (replacing the `sys` variants) instead of aliasing little-endian. The unsigned 16-bit sample formats (`u16`, `u16lsb`, `u16msb`, `u16sys`) are gone — SDL3 removed them. Internally the queue-based device API was replaced with SDL3 audio streams (see the audio API entry below for the resulting renames).
  - Keyboard: the scancodes SDL3 removed are gone from `sdl.keyboard.SCANCODE` (`AUDIOMUTE`, `WWW`, `MAIL`, `CALCULATOR`, `COMPUTER`, `BRIGHTNESSDOWN/UP`, `DISPLAYSWITCH`, `KBDILLUM*`, `APP1`, `APP2`), and so are the corresponding key names. The media scancodes follow SDL3's names (`MEDIA_PLAY`, `MEDIA_NEXT_TRACK`, `MEDIA_PREVIOUS_TRACK`, `MEDIA_STOP`, `MEDIA_REWIND`, `MEDIA_FAST_FORWARD`, `MEDIA_EJECT`, `MEDIA_SELECT` instead of `AUDIOPLAY`, `AUDIONEXT`, …), and so do the key names (`mediaPlay`, `mediaTrackNext`, `mediaTrackPrevious`, `mediaStop`, `mediaRewind`, `mediaFastForward` instead of `audioPlay`, `audioNext`, …).
  - Joystick/gamepad: the power level strings are gone. `power` (and the `powerUpdate` event) now report SDL3's power info directly as `{ state, percent }`, in the same format as `sdl.power.info`. Gamepad types `'virtual'`, `'amazonLuna'`, `'googleStadia'`, and `'nvidiaShield'` no longer exist (SDL3 reports such devices as generic gamepads); `'gamecube'` is new.
  - Sensors: `data.timestamp` is gone — SDL3 removed the timestamped read.
  - Displays: `dpi` is replaced by `scale`, SDL3's unitless content scale (`1` is the 96dpi baseline). Displays now carry a stable `id`, which is what hot-plug events and `createWindow({ display })` go by; a display that is disconnected and reconnected is a new device rather than a match for the old one.
  - Audio: devices now carry a stable `id`, and are opened by that id instead of by `name`. Opening arbitrary driver-specific device names is no longer possible, since SDL3 only opens devices it has enumerated.
  - Enum strings follow SDL3's names: cursors are `default`, `text`, `progress`, `nwseResize`, `neswResize`, `ewResize`, `nsResize`, `move`, `notAllowed`, and `pointer` (instead of `arrow`, `ibeam`, `waitarrow`, `sizenwse`, `sizenesw`, `sizewe`, `sizens`, `sizeall`, `no`, and `hand`); joystick types are `arcadeStick`, `flightStick`, `dancePad`, `drumKit`, and `arcadePad`; and diagonal hat positions are `rightUp`, `rightDown`, `leftUp`, and `leftDown`.
  - Pixel formats follow SDL3's names, which spell out the unused byte: `xrgb4444`, `xrgb1555`, `xbgr1555`, `xrgb8888`, and `xbgr8888` replace `rgb444`, `rgb555`, `bgr555`, `rgb888`, and `bgr888`.
  - Windows: the X11-only `skipTaskbar`, `popupMenu`, `tooltip`, and `utility` options of `createWindow()` and the matching `window` getters are removed. SDL3 requires a parent window for popup menus and tooltips, and hides the taskbar entry only through the utility flag. The `scaling: 'best'` render mode is gone, since SDL3 only offers `'nearest'` and `'linear'`.
- **Breaking:** The audio API follows SDL3's model of separate playback and recording devices and of audio streams. `sdl.audio.devices` and `sdl.audio.openDevice()` are replaced by `sdl.audio.playback` and `sdl.audio.recording`, each with its own `devices` list, `openDevice([device[, options]])` function, and `deviceAdd`/`deviceRemove` events; device objects lose their `type`, each list starts with a default-device entry whose `id` is `null`, and passing no device (or `null`) opens that default device. `AudioInstance`, `AudioPlaybackInstance`, and `AudioRecordingInstance` are now `AudioStream`, `AudioPlaybackStream`, and `AudioRecordingStream`: `enqueue()` is `putData()`, `dequeue()` is `getData()`, `clearQueue()` is `clear()`, recording streams report `available` instead of `queued`, `device` is the default-device entry for streams opened on the default device, the redundant `name` property is gone, and `buffered` moved from the stream to its device.
- **Breaking:** `sdl.controller` is now `sdl.gamepad`, following SDL3's rename: `ControllerInstance` is `GamepadInstance`, the `'gamecontroller'` joystick type is `'gamepad'`, and `sdl.info.initialized.controller` is `sdl.info.initialized.gamepad`. Buttons follow SDL3's position-based names: the face buttons are `south`, `east`, `west`, and `north` (instead of `a`, `b`, `x`, `y`), and the paddles are `rightPaddle1`, `leftPaddle1`, `rightPaddle2`, and `leftPaddle2` (instead of `paddle1` through `paddle4`).
- **Breaking:** Mouse coordinates are floating point, as in SDL3: the positions on `mouseMove`, `mouseButtonDown`/`mouseButtonUp`, and `mouseWheel` events and in `sdl.mouse.position` may be fractional on high-DPI displays and on backends that report sub-pixel pointer positions, so round them where integers are needed. In the other direction, `sdl.mouse.setPosition()` and the `dstRect` option of `window.render()` accept fractional values, the latter positioning the image at sub-pixel precision.
- **Breaking:** Touch device `id`s and the `fingerId` on touch events are now `bigint`s. They are 64-bit values in SDL, which a JS `number` can't always represent exactly.
- **Breaking (Linux):** `window.native.handle` now holds a tagged `{ subsystem, display, window }` struct instead of a bare X11 window id, and the internal payloads passed to `@kmamal/gl`/`@kmamal/gpu` changed the same way. Older versions of those packages can't consume the new payload — upgrade them together with this one.
- Declared support for Node.js >= 22 in `package.json`, and pinned the native addon to the matching Node-API version 9.
- **Breaking:** The space key is now reported as `' '`, like every other character-producing key, instead of `'space'`.
- **Breaking:** Joystick axes are now normalized relative to the axis's true center, like gamepad axes, instead of relative to whatever value the axis had when the device was opened. Pedals and throttles that rest at one end of their range now read `1` or `-1` at rest instead of `0`, and axes that rest at their maximum no longer report `NaN`.
- **Breaking:** `window.setFullscreen()`, `window.minimize()`, `window.maximize()`, and `window.restore()` follow SDL3's asynchronous model: they submit a request to the windowing system and return, and `fullscreen`, `minimized`, and `maximized` update once the change has taken effect (or not at all, if the windowing system denies it). Code that read those properties right after the call should listen for the `minimize`/`maximize`/`restore` events or poll instead. `maximize()` now throws on a non-resizable window, which SDL3 refuses to maximize.
- **Breaking:** `window.setPosition()`, `window.setSize()`, and `window.setSizeInPixels()` follow the same asynchronous model: `x`, `y`, `width`, `height`, `pixelWidth`, and `pixelHeight` update from the `move` and `resize` events once the windowing system has applied the change, instead of being set to the requested values right away. The requested values were often never taken, for example on fullscreen and maximized windows, or under window managers that adjust or refuse the request. Code that read those properties right after the call should listen for the `move`/`resize` events or poll instead.
- **Breaking:** The `duration` of `rumble()` and `rumbleTriggers()` now defaults to `null`, which rumbles until stopped, instead of `1e3`; pass `1e3` explicitly for the old behavior. A duration of `0` is now rejected; it used to stop the rumble right away.
- **Breaking:** `createWindow()` now throws if the `accelerated` or `vsync` option is given together with `opengl` or `webgpu`, instead of silently ignoring it. OpenGL and WebGPU windows have no SDL renderer, so `window.accelerated` and `window.vsync` are now `null` for them instead of echoing the options.
- Range errors now state the violated constraint (e.g. "width must be a positive 32-bit integer", "device must be from sdl.joystick.devices") instead of a generic "invalid width" or "invalid device".

### Added

- Native window handles under the Wayland video driver (`SDL_VIDEODRIVER=wayland`). `window.native` now carries valid Wayland objects instead of garbage reinterpreted as X11 handles, and a new `window.native.subsystem` field (`'x11'` or `'wayland'`, Linux only) says which kind you're holding. Any other Linux video driver now yields `handle: null` and a clear error for `opengl`/`webgpu` windows.
- Relative mouse mode for FPS-style camera controls, via `window.setRelativeMouseMode()`, `window.unsetRelativeMouseMode()`, and `window.relativeMouseMode`.
- `sdl.video` events `'displayScaleChange'`, `'displayModeChange'`, and `'displayUsableChange'`, fired when a display's content scale, current mode, or usable region changes. The display objects in `sdl.video.displays` are updated accordingly, where before `scale`, `format`, `frequency`, and `usable` were only read at startup.
- `sdl.mouse.captured`, reporting whether a mouse capture has been requested with `sdl.mouse.capture()`, and `window.mouseCaptured`, reporting whether the window currently holds the capture.
- Audio device objects report the `format`, `channels`, `frequency`, and `buffered` the device itself is running with while streams are open on them, and `null` otherwise. SDL converts between each stream's format and its device's, so these may differ from the stream's own.
- `mouseMove` events now report the mouse's relative movement through `dx` and `dy`.
- `ballMotion` events now report the ball's relative movement through `dx` and `dy`, alongside the accumulated `x` and `y` position.
- Pixel-format helpers `sdl.video.bytesPerPixel()`, `sdl.video.isYuv()`, `sdl.video.isPlanarYuv()`, and `sdl.video.minBufferSize()`, mirroring the existing audio sample-format helpers.
- `@kmamal/sdl/helpers` now also exposes the pixel-format helpers and the `keyboard.SCANCODE`, `mouse.BUTTON`, and `sensor.STANDARD_GRAVITY` constants, under the same paths as in the main module.
- Prebuilt binaries for Windows on arm64.
- `NODE_SDL_SYSTEM=1 npm install` builds against the SDL already installed on the system (located through `pkg-config`, or through `SDL_INC`/`SDL_LIB` when set) instead of downloading one, and links to it at runtime rather than bundling a copy. This is for platforms without prebuilt binaries, cross-compilation sysroots, and distribution packaging.
- `gamepadInstance.buttonLabels`, reporting the label printed on each face button (`'a'`, `'cross'`, ...), so the position-named buttons can still be shown to the user by name.
- Gamepad buttons `misc2` through `misc6`, and the `'standard'` gamepad type for generic gamepads that used to report `null`.
- The single-edge and corner resize cursors SDL3 added (`nResize`, `neResize`, `eResize`, `seResize`, `sResize`, `swResize`, `wResize`, `nwResize`), and the `X1` and `X2` mouse buttons in `sdl.mouse.BUTTON`.
- Audio streams can be opened with any number of channels from `1` to `8`, covering the 2.1, 4.1, 6.1, and 7.1 layouts SDL3 supports, instead of only `1`, `2`, `4`, or `6`.
- The pixel formats SDL3 added: `xbgr4444`, `xrgb2101010`, `xbgr2101010`, `abgr2101010`, the 16-bit-per-channel integer formats (`rgb48`, `bgr48`, `rgba64`, `argb64`, `bgra64`, `abgr64`), the 16-bit float formats (`rgb48f`, `bgr48f`, `rgba64f`, `argb64f`, `bgra64f`, `abgr64f`), the 32-bit float formats (`rgb96f`, `bgr96f`, `rgba128f`, `argb128f`, `bgra128f`, `abgr128f`), the `rgbx32`/`xrgb32`/`bgrx32`/`xbgr32` byte-order aliases, and the `p010` YUV format (which `window.render()` rejects, since SDL's renderer can't display it).
- Gamepad buttons `misc1` (the Xbox Series X share button, PS5 microphone button, Switch Pro capture button, or Luna microphone button) and `touchpad` (PS4/PS5 touchpad click). They used to arrive as `buttonDown`/`buttonUp` events with `button: null` and pollute `gamepadInstance.buttons` with a `null` key.
- Scancodes `SOFTLEFT`, `SOFTRIGHT`, `CALL`, and `ENDCALL`, and the corresponding `'softLeft'`, `'softRight'`, `'call'`, and `'endCall'` keys.
- Scancodes `WAKE`, `CHANNEL_INCREMENT`, `CHANNEL_DECREMENT`, `MEDIA_PAUSE`, `MEDIA_RECORD`, `MEDIA_PLAY_PAUSE`, and `AC_NEW` through `AC_PROPERTIES`, and the corresponding `'wake'`, `'channelUp'`, `'channelDown'`, `'mediaPause'`, `'mediaRecord'`, `'mediaPlayPause'`, `'new'`, `'open'`, `'close'`, `'exit'`, `'save'`, `'print'`, and `'properties'` keys.
- The keys SDL3 reports through its extended keycodes: `'compose'`, `'meta'`, `'hyper'`, and `'leftTab'`. They used to come out as `null`.
- The keys `'international2'`, `'international4'`, `'international5'`, and `'language1'` through `'language4'`, found on Japanese and Korean keyboards. They used to come out as `null`.
- Mouse and finger events have a `pen` flag, set when SDL synthesized the event from pen input.
- Window event `'fingerCancel'`, fired when the system cancels a touch instead of lifting the finger. SDL3 reports these separately from `fingerUp`, and they used to be dropped.

### Fixed

Windows and events:

- A new window's initial position, size, pixel size, display, and flags are now read after the window is shown, so they include whatever the windowing system applied on showing it. They, and the initial `move` and `resize` events, used to report the pre-show values when the window was created from inside an event listener, since the real events from showing it were then dropped.
- `resize` now also fires, and `pixelWidth`/`pixelHeight` update, when only the window's pixel size changes (for example when it moves to a display with a different scale). SDL3 reports that separately from a logical resize, and it used to be dropped.
- `window.setPosition()` now throws when the windowing system can't position the window (regular windows under Wayland), and the other window setters (`setTitle()`, `setSize()`, `setResizable()`, `setBorderless()`, `show()`, `hide()`, `focus()`) throw if SDL reports a failure. The error used to be ignored and left pending, where later calls reported it as a spurious "SDL silent error".
- `window.focus()` no longer marks the window as focused before the windowing system has honored the request. `focused` updates on the `focus` event, as it does for every other focus change.
- `window.setIcon()` now throws when the windowing system refuses the icon (Wayland, for example) instead of silently doing nothing.
- `window.render()` now reports a proper "options must be an object" error for a non-object `options` argument instead of a bare `TypeError`.
- `window.fullscreen` now tracks SDL's own enter/leave-fullscreen notifications. It used to be reset to `false` whenever the window was minimized, maximized, or restored, although SDL keeps a fullscreen window fullscreen across those (a fullscreen window that is minimized on focus loss and then restored comes back fullscreen). `minimized`, `maximized`, and `visible` likewise no longer guess: they only change when the windowing system reports the change, so a `minimize()` request that the window manager ignores is no longer reported as minimized.
- `move` and `resize` events are no longer delivered twice, including when a listener moves or resizes the window.
- An exception thrown in an event listener no longer permanently stops event delivery, and no longer crashes the process when it happens in a `move` or `resize` listener while the window is being dragged. Listener exceptions are now re-emitted as an `'error'` event on the window or instance, following the usual `EventEmitter` semantics: with no `'error'` listener they surface as an uncaught exception.
- Calling `window.destroy()` from a `move` or `resize` listener that fires while the window is being dragged or resized no longer risks a crash. The window reports `destroyed` immediately, and the native window is destroyed once it is safe to do so.
- Calling `window.destroy()` from a `beforeClose` listener no longer crashes the process. `destroyGently()` used to call `destroy()` afterwards anyway, and the resulting "window is destroyed" error propagated out of the event poll loop as an uncaught exception.
- Removing all of a window's listeners (whether via `removeAllListeners()` or one `removeListener()` at a time) no longer breaks event polling, no longer lets the process exit while the window is still open, and no longer turns `window.destroy()` into a silent no-op. It used to also remove the internal keep-alive listener.
- Listening for `newListener` or `removeListener` no longer engages fast event polling that keeps the process alive and could never be turned back off.
- `emit()` on windows and instances now returns whether the event had listeners, as the `EventEmitter` contract specifies, instead of `undefined`.
- A `close` listener that throws (with no `error` listener to catch it) no longer leaves the destroyed window's or closed instance's listeners registered, which kept event polling engaged and the process alive forever.
- Attaching a listener to a destroyed window or a closed instance or stream now throws. Such a listener could never fire and was never removed, so it kept event polling engaged and the process alive forever.
- Closing the last window via its close button no longer fires `beforeClose` twice. SDL used to follow the window's close event with a quit event, and the quit handling asked the same window to close again, so a listener that called `prevent()` was bypassed on the second round.
- Windows now report their actual size on creation (a fullscreen window no longer reports the default 640x480).
- The initial `resize` event is no longer delivered to windows destroyed in the same tick they were created.
- `window.setSizeInPixels()` now converts the size using the window's actual pixel density and rounds to the nearest size in points, instead of deriving the ratio from the window's rounded current sizes. It used to reject almost every size on displays with a fractional scale (at 150%, even `1920×1080` threw "must be a multiple of 1.5005…").
- `setResizable()` and `setBorderless()` now enforce the same mutual exclusivity that `createWindow()` does, instead of letting the invariant be bypassed after creation.
- `window.render()` now throws if updating the texture fails instead of silently presenting stale contents.
- `window.render()`, `mouse.setCursor()`, `mouse.setCursorImage()`, `mouse.resetCursor()`, and `mouse.redrawCursor()` now throw if SDL fails to present the frame or apply the cursor, instead of ignoring the failure and leaving its error pending.
- A failure to recreate the render texture (such as an oversized `render()`) no longer leaves a dangling texture pointer that corrupts memory on later calls, and destroying a window whose renderer could not be rebuilt (after a failed `setVsync()` or `setAccelerated()` call) no longer leaks its texture.
- `window.render()` on a window left without a renderer by a failed `setVsync()` or `setAccelerated()` call now throws "window has no renderer" instead of an error with an empty message.
- `sdl.mouse.resetCursor()` without a video subsystem, and joystick, gamepad, and sensor calls on a device SDL no longer has open, now throw a descriptive error instead of one with an empty message.
- Renderer error messages now include the flag values instead of pointer addresses.
- Image `stride` and buffer sizes are now validated in bytes, preventing out-of-bounds reads in native code. For the planar YUV formats the check also accounts for SDL rounding the chroma planes up, so odd dimensions no longer read out of bounds either, and for the packed YUV formats (`yuy2`, `uyvy`, `yvyu`) the minimum stride of an odd-width image covers the full last 4-byte pixel pair SDL reads.
- `window.setIcon()` and `mouse.setCursorImage()` now reject YUV pixel formats with a clear validation error. SDL cannot create surfaces from them, so they always failed — but with a cryptic native error.
- A `blur` or `leave` event no longer clears `sdl.video.focused`/`sdl.video.hovered` when another window has already gained focus or hover.
- `sdl.video.focused` and `sdl.video.hovered` now pump events first, like the per-window getters, instead of returning stale values.
- Attaching a listener to a destroyed window or a closed instance or stream now throws right away, as documented, instead of being silently accepted and dropped at the end of the tick.

Displays:

- Connecting or disconnecting a display no longer crashes the process, including when the display disappears while its hot-plug, orientation, or move event is being processed.
- Displays are now looked up by their stable id instead of their position in `sdl.video.displays`, which diverged when a display vanished mid-enumeration. `displayOrient`/`displayMove` events used to update and report the wrong display, `createWindow()` with the `display` option could open the window on the wrong display, and `window.display` could return the wrong one. `window.display` (and the `display` on `displayChange` events) is now `null` when the window's display has been removed.
- `createWindow()` now requires the `display` option to be one of the objects in `sdl.video.displays` and throws otherwise, instead of matching by name (which identical monitors share) and silently falling back to the first display when nothing matched.
- The `displayMove` event is now emitted instead of throwing "invalid event", and both `displayOrient` and `displayMove` events now carry the documented `device` property.
- `sdl.video.displays` now returns a copy of the display list, so modifying it no longer corrupts the library's internal state.
- Display modes with a 32-bit RGBA pixel format now report it under its `*8888` name (such as `'argb8888'`) instead of the endianness-dependent `*32` alias (such as `'bgra32'`). The two are the same SDL format, but the `*8888` names were documented as possible values and could never actually appear.
- A display's `frequency` (and the `frequency` on `displayModeChange` events) is now `null` when SDL doesn't know the refresh rate, instead of `0`.

Mouse and keyboard:

- `mouseWheel` events now report the mouse position at the time of the event, carry precise fractional `dx`/`dy` values so high-resolution trackpad scrolls no longer arrive as `0`, and have a boolean `flipped` property.
- `mouse.getButton()` now pumps events first, so it returns the current button state instead of values up to a second old. It also accepts the correct button range, and no longer relies on undefined behavior for button 32.
- The right GUI key now reports the documented `'gui'` key name instead of `'gUI'`.
- The GUI keys on Windows and the GUI and Alt keys on macOS now report the platform's names for them, `'windows'`, `'command'`, and `'option'`, instead of `null`. `sdl.keyboard.getScancode()` accepts these names on the corresponding platforms.
- `sdl.keyboard.getScancode()` now resolves single-character keys such as `','` and `'0'` to the main keyboard keys instead of the keypad ones.
- Keys whose character lies outside the Basic Multilingual Plane (such as emoji) are now reported as that character instead of `null`, and `sdl.keyboard.getScancode()` accepts them instead of throwing "invalid key".
- `sdl.info.platform` is `'macOS'` on macOS, following SDL3's platform name. It used to be documented and typed as `'Mac OS X'`, which SDL3 no longer reports.
- `sdl.info.platform` is now documented and typed with every platform name SDL3 can report (such as `'FreeBSD'` for builds from source), instead of only `'Linux'`, `'Windows'`, and `'macOS'`, and is `null` instead of SDL's `'Unknown (see SDL_platform.h)'` placeholder when SDL doesn't know the platform.
- Keys whose SDL3 default name differs from the X11 one (`'+/-'`, `'modeSwitch'`, `'('`, `')'`, and the menu key) are recognized again on every platform. Their default names had been dropped from the key table during the migration, so they came out as `null` outside X11.
- `sdl.keyboard.getKey()` now agrees with the `key` of keyboard events on layouts where SDL's keycode options apply. On AZERTY the number row maps to `'1'`…`'0'` instead of `'&'`, `'é'`, …, and on non-Latin layouts the letter keys map to `'a'`…`'z'`, as they do in events.
- Character keys are now reported as the unshifted character SDL assigns to them. SDL3 names non-ASCII letters by their capital, so `ü` used to arrive as `'Ü'`, and `getKey(getScancode('ü'))` did not round-trip.
- `sdl.keyboard.getKey()` and `getScancode()` now pick up a keyboard layout change right away. They used to keep answering with the old layout until the next event poll.

Touch:

- Touch events no longer crash event handling. Events synthesized from the mouse arrive with a `null` `device`, and events for a device that disconnected before they were polled are dropped.
- `sdl.touch.devices` now refetches the device list on every read. It used to return the list from module load time forever, since SDL emits no touch hot-plug events that could refresh it. Device objects remain valid across reads, like the sensor device objects, so they can be compared with the `device` of touch events, and the returned list is a copy, so modifying it no longer corrupts the library's internal state.
- `sdl.touch.devices` no longer lists the virtual touch devices SDL creates for touch events it synthesizes from the mouse and pen, and finger events synthesized from a pen arrive with a `null` `device`, like the ones synthesized from the mouse.

Joysticks and gamepads:

- Gamepad `axisMotion` and `buttonDown`/`buttonUp` events for an axis or button SDL doesn't define are now dropped, instead of arriving with `axis: null` or `button: null` and adding a `null` key to `gamepadInstance.axes` or `gamepadInstance.buttons`.
- Each joystick instance of a device now receives its own copy of `ballMotion` events. Instances used to share one event object whose `x`/`y` were overwritten for each instance in turn, so a listener that kept the event or read it later saw another instance's ball position.
- Unplugging a device no longer mis-identifies the remaining ones. The device lists used to be rebuilt by matching devices on list position (or on name for audio), so removing a non-last joystick, gamepad, display, or audio device made cached device objects silently morph into other devices and made `deviceRemove`/`displayRemove` events report the wrong device. Every device list is now maintained from SDL's per-device hot-plug events, keyed by the device's stable id. As a side effect, `sdl.audio.devices` is no longer sorted by name — devices now stay in SDL's enumeration order, like every other device list.
- `openDevice()` no longer risks opening the wrong physical device when another device's unplugging hasn't been processed yet. Devices are now opened by their stable id, which SDL never reuses, and pending device events are flushed (or, for sensors, the device list refetched) before the device is validated and opened.
- Closing a joystick or gamepad instance from an event listener no longer crashes the process when more events for that instance are still in the queue.
- Gamepad trigger axes now correctly report `0` when released instead of `0.5`, and inverted or half-axis mappings are no longer mis-scaled.
- Trackball state and `ballMotion` events now report accumulated positions as documented, instead of the latest relative motion. Positions start at `0` when the instance is opened, instead of at whatever relative motion SDL happened to have accumulated since its last poll.
- `sdl.joystick.devices` and `sdl.gamepad.devices` now return a copy of the device list, like `sdl.video.displays`, so modifying it no longer corrupts the library's internal state.
- `rumble(0, 0)` and `rumbleTriggers(0, 0)` no longer schedule a keep-alive timer, so they no longer delay process exit while nothing is rumbling. `stopRumble()` and `stopRumbleTriggers()` are now truly equivalent to them, as documented.
- Gamepad instances now receive `powerUpdate` events even when the device is not also open as a joystick.
- The `steamHandleUpdate` event is now emitted correctly instead of a spurious `remap` event.
- The `power` and `steamHandle` getters now poll for pending events first, like the other instance getters, instead of returning stale values.
- `rumbleTriggers()` no longer stops the main rumble motors when its duration elapses, and pending rumble timeouts are cleared on close.
- Rumble effects are now tracked per device instead of per instance, since all instances of a device share its motors. Stopping or replacing an effect from one instance no longer leaves another instance's timer keeping the process alive for up to 65 seconds, and closing an instance stops the device's rumble only once no other joystick or gamepad instance of it remains open.
- A joystick or gamepad disconnecting mid-rumble no longer crashes the process when the rumble auto-stop timer fires.
- Rumble durations above `65535` ms, the maximum SDL supports, now rumble for the full duration. They used to be silently cut short by SDL while the process was still kept alive for the full requested time.
- Rumble and LED intensities are now rounded to the nearest hardware step instead of truncated, so values just below a step (such as `0.9999`) no longer land one step low.
- `sdl.gamepad.addMappings()` now refreshes the device lists even when one of the mappings is invalid, so the devices made available by the mappings before it are reported.
- `sdl.gamepad.addMappings()` now throws the error for an invalid mapping even if refreshing the device lists afterwards also fails, instead of replacing it with the unrelated refresh error.
- `sdl.gamepad.addMappings()` now also refreshes the objects in `sdl.joystick.devices`. A joystick that a new mapping turns into a gamepad used to keep reporting its old `type` (such as `null`) instead of `'gamepad'`.
- The `mapping`, `name`, and `type` of a gamepad's device object are now up to date when its `remap` event fires. `sdl.gamepad.addMappings()` used to emit the event before refreshing them, and remaps that SDL applied on its own did not refresh them at all.
- `joystickInstance.setPlayer()`/`resetPlayer()` (and the gamepad equivalents) now update `player` on the device's objects in both `sdl.joystick.devices` and `sdl.gamepad.devices`, and throw if SDL refuses the assignment.
- `setPlayer()` now also updates `player` on the device that previously held the requested index, which SDL moves to a free slot. It used to keep reporting its old index, so two devices reported the same player.
- `rumble()` and `rumbleTriggers()` no longer keep the process alive for an effect SDL never started when the intensities round to zero.
- `hasLed`, `hasRumble`, and `hasRumbleTriggers` on joystick and gamepad instances now report the device's current capabilities instead of the ones it had when opened, which SDL can change later (for example when it switches a PlayStation controller into enhanced mode). `setLed()`, `rumble()`, `stopRumble()`, `rumbleTriggers()`, and `stopRumbleTriggers()` now consistently throw when the device lacks the corresponding hardware; the stop calls and zero-intensity calls used to succeed silently.

Instances (joystick, gamepad, sensor, and audio):

- Reading state from a closed instance — including on the very read that discovers the device's removal — now throws "instance is closed" for every member (`axes`, `balls`, `buttons`, `hats`, `power`, `steamHandle`, sensor `data`), instead of returning stale state or, for sensors, a raw native error.
- Closing is now robust against listeners: `closed` reports `true` while the `close` event is being emitted (so a listener that calls `close()` again no longer recurses forever), teardown completes before `close` is emitted (so a throwing listener no longer strands a closed-but-still-registered instance that leaks its handle and crashes the exit-time cleanup), and a device removal closes all of the device's instances and updates the device lists even when a listener throws.
- The `close` event now passes the documented `{ type: 'close' }` event object.
- Sensor instances left open on exit are now closed (and emit `close`) like all other instance types.
- SDL is now shut down on exit even if a `close` listener throws during the exit-time cleanup.

Sensors:

- `sdl.sensor.devices` no longer crashes when a sensor disappears while the list is being read (its `name` is `null`), no longer throws for sensors of unknown type (their `type` is `null`), and its device objects now remain valid across reads. `sdl.sensor.openDevice()` no longer throws a `TypeError`.
- `sdl.sensor.devices` now reports `side` for left/right sensors (such as Joy-Con pairs) instead of always `null`.
- Reading a sensor instance's `data` now pumps events first, so it returns current readings instead of values up to a second old.
- `sdl.sensor.devices` returns a copy of the internal list, like the joystick and gamepad lists, so modifying it no longer corrupts the library's state.

Audio:

- The keep-alive timer that lets queued audio finish playing before the process exits now computes the device buffer's duration correctly, at the device's own sample rate rather than the stream's. A stream opened at a higher rate than its device could exit before the end of its audio had played.
- The keep-alive timer for queued audio no longer overflows when the queue holds more than about 24.8 days of audio, which used to make the process spin on a 1 ms timer.
- Closing or pausing a playback stream while Node.js is waiting for its queued audio to drain no longer keeps the process alive for the full queued duration.
- The exit-time check for queued audio no longer throws when the device of a playing stream was unplugged just before the process would exit.
- `putData()` and `getData()` now accept empty buffers as no-ops, as the docs already implied, instead of throwing "invalid bytes" on the zero-length chunks streaming pipelines naturally produce. A zero-length `Buffer` with no backing memory (such as `Buffer.alloc(0)`) is also accepted; SDL used to reject its null pointer.
- `buffered` values larger than `32768` are now rejected instead of silently truncating to a driver-chosen buffer size.
- `playbackStream.queued` no longer reports negative values for queues over 2 GiB.
- `putData()` now rejects a `bytes` count that isn't a whole number of sample frames with a validation error, instead of a raw native error from SDL.
- A `close` listener that throws no longer leaves a playback stream's keep-alive timer running after the stream is closed.
- `stream.playing` is now `false` once the stream is closed, including when it is closed because its device was removed.
- `readSample()` and `writeSample()` now reject non-`Buffer` arguments with a validation error instead of silently operating on array-likes.
- `zeroSampleValue` for `u8` now matches SDL's silence value (`128`) instead of being one below it.
- Plugging or unplugging an audio device no longer fires spurious `deviceAdd`/`deviceRemove` events for unrelated devices.
- Unplugging an audio device now closes every stream opened from it, as documented, instead of only the first one SDL reports, and the device list is updated even when a `close` listener throws.
- An audio device disappearing while the device list is being enumerated no longer crashes the process. The audio backend's own notification thread can remove a device mid-enumeration; the resulting error used to escape the internal polling loop as an uncaught exception. Devices that vanish mid-query are now skipped, like displays already were.
- The buffer size the driver actually uses is now reported, as `buffered` on the stream's device. SDL only sizes the buffer when it first opens a device, so the `buffered` option is ignored for a device that is already open, and the keep-alive timing used to be computed from the wrong value.
- Audio device objects no longer carry a `type` property, as the docs and types already said.

Clipboard:

- `sdl.clipboard.text` no longer throws when another application empties the clipboard mid-read, and no longer leaks the SDL-side copy of the text if creating the JS string fails (e.g. clipboard content beyond the JS string size limit).

Validation and errors:

- Passing a non-object (including `null`) as `options` to `createWindow()` or the audio `openDevice()` functions, or calling `putData()`/`getData()` without a buffer, now fails with the intended validation error instead of a raw `TypeError`. A non-object `options` used to be silently ignored by `createWindow()`.
- Passing names of inherited `Object` members (such as `'constructor'` or `'toString'`) as keys, pixel formats, audio formats, cursors, or other enum values now fails validation with the intended error instead of leaking through to the native layer or, in the audio format helpers (on both `sdl.audio` and `@kmamal/sdl/helpers`), silently returning `undefined` or failing with a raw `TypeError`.
- Integer arguments are now validated to fit in 32 bits everywhere the native layer reads them as such (window positions and sizes, image dimensions and strides, player indices, audio frequency, `numBytes`), and rumble durations are validated to fit the range of Node.js timers. Larger values used to silently wrap — `setSize(2 ** 32 + 100, 100)` set width 100, `rumble` durations above 2³¹−1 broke the auto-stop timer, and `setPlayer(2 ** 31)` silently behaved like `resetPlayer()`.
- Enum values this build of the library doesn't know (a joystick or gamepad type, sensor type, power state, display orientation, display pixel format, touch device type, hat position, or gamepad axis or button name introduced by a newer runtime SDL) are now reported as `null` instead of an empty string.
- SDL errors are now detected reliably, through SDL3's boolean return values or, where a call has none, the error message contents, instead of comparing `SDL_GetError()` pointers, which silently missed all errors when linked against an SDL build that returns a single static buffer. Stale SDL errors no longer cause spurious throws (and lost data) in `dequeue()`, `resize` events, and joystick/gamepad opening, and window methods called on a destroyed window now fail with a clear "invalid window id" error instead of appending whatever stale error text an earlier unrelated call had left behind.
- `sdl.video.minBufferSize()` now validates `stride` and `height` instead of returning `NaN`.
- The pixel-format and sample-format helpers (on `sdl.video`, `sdl.audio`, and `@kmamal/sdl/helpers`) now reject a non-string `format` with a validation error, instead of coercing values such as `['rgb24']` to a format name.
- Values SDL can't determine (a joystick without a device path, such as a virtual joystick; a display, touch device, or sensor that vanishes while being queried; an unknown power state or key name) no longer leave SDL's error pending. It used to be picked up by later calls, which reported it as a spurious "SDL silent error" when opening a joystick or gamepad or adding gamepad mappings.
- Reading `sdl.clipboard.text` without a video subsystem and a failing `sdl.mouse.resetCursor()` no longer leave SDL's error pending, and `resetCursor()` now reports SDL's actual error message.
- `hasLed`, `hasRumble`, and `hasRumbleTriggers` now throw when SDL fails to query the device's capabilities, instead of reporting `false`.

Native resource handling:

- Fixed a use-after-free when destroying a window.
- Fixed native leaks: opening the same joystick, gamepad, or sensor multiple times, a failure while opening a joystick or gamepad, a failure while creating a window (such as renderer creation failing), a failure to create the JS counterpart of a gamepad mapping string during device enumeration, `mouse.setCursor()`, and file drop events all used to leak the corresponding SDL resource.
- `window.render()` no longer leaks a texture on every call if SDL fails to cache it on the window.
- `window.setAccelerated()` and `window.setVsync()` no longer throw after successfully switching the renderer when SDL fails to report its name or vsync state, which used to leave `accelerated` and `vsync` reporting the old renderer's values.
- Windows recreate their renderer when SDL reports that the graphics device was lost (for example after a GPU driver reset). `window.render()` used to fail from then on.
- SDL event types the library doesn't handle (such as gamepad touchpad events) no longer make a wasted native-to-JS call per event.

Docs, types, and loading:

- Many fixes to the TypeScript declarations to match the implementation. Every event-emitting object is now declared as an `EventEmitter` (so `once()`, `off()`, `removeAllListeners()`, e.t.c. type-check), the `'error'` event is declared, the `sdl.video` pixel-format helpers and the new mouse members are included, and the whole `@kmamal/sdl/helpers` sub-module is covered instead of only its `audio` part.
- The virtual key `'clear/again'` is now included in the API reference's virtual-key list. It was the only key value the mapping could produce that the docs omitted.
- `window.native.subsystem` is now `null` on Windows and macOS instead of absent, and is no longer optional in the types.
- Type fixes: `createWindow()`'s `x` and `y` options accept `null`, and the `orientation` on `displayOrient` events is nullable, both matching the implementation and docs.
- The docs now state the constraints the API enforces on rumble `duration`, audio `frequency`, the `bytes` argument of `putData()`/`getData()`, and window positions and sizes.
- The docs now also state the 32-bit limits on player indices, audio `frequency`, and the `bytes` argument of `putData()`/`getData()`, the limits on image `width`, `height`, and `stride`, and the allowed range of the cursor hotspot.
- The docs now give the correct range for gamepad trigger axes, `0` to `1`, instead of `-1` to `+1`, and state the range of the `value` on `axisMotion` events.
- The docs no longer describe the `'close'` event of windows, instances, and streams as firing before the object is destroyed or closed. It fires afterwards, once the object already reports `destroyed`/`closed`.
- The `readSample()`/`writeSample()` docs no longer claim that `'f32'` is equivalent to `readFloatLE()`/`writeFloatLE()`. `'f32'` is in native byte order, so that only holds on little-endian machines.
- Type fixes: the `dstRect` option of `window.render()` accepts `null`, matching the implementation and docs.
- The docs now state that the `dstRect` of `window.render()` is in pixels, that `bytesPerPixel()` is `2` for `'p010'`, and no longer describe recording devices and streams in terms of playback.
- The docs no longer claim that `vsync` requires `accelerated`. SDL3 supports vsync with the software renderer too.
- The docs now say that `createWindow()` defaults to the primary display, which isn't necessarily `sdl.video.displays[0]`, and the types accept `null` for its `display`, `width`, and `height` options.
- The library no longer fails to load on systems where the audio or video subsystem can't be initialized, such as headless servers.
- The `sdl.info` sample in the API reference now shows SDL3 data instead of SDL2's.
- The docs now give the gamepad device `type` as `<GamepadType>`, like the TS declarations.
- `Window`, `JoystickInstance`, `GamepadInstance`, `SensorInstance`, and the `AudioStream` classes are now declared as interfaces instead of classes. The types used to declare a runtime `Sdl` export with constructible classes, so code like `x instanceof Sdl.Video.Window` compiled but crashed, since the library exports no such value and the classes can't be constructed directly.
- Joystick hat positions (`joystickInstance.hats` and the `value` of `hatMotion` events) are now documented and typed as nullable, matching the implementation, which reports `null` for positions SDL doesn't define.
- The docs and types now use the same parameter names as the implementation and its error messages: `lowFreqRumble`/`highFreqRumble` for `rumble()`, `leftRumble`/`rightRumble` for `rumbleTriggers()`, and `player` for `setPlayer()`.
- The docs now state that `sdl.mouse.setPosition()` accepts fractional coordinates and that `createWindow()` accepts `null` for `width` and `height`.

Building from source:

- Building SDL from source (the fallback when no prebuilt SDL is available) no longer drops SDL's license from `dist/`, and a missing license now fails the build instead of being silently skipped.
- Building SDL from source no longer crashes on Windows.
- The native addon now compiles on Windows under SDL3, which no longer pulls in the declarations of `HWND` and `HINSTANCE`.
- The native addon is now compiled with warnings enabled and treated as errors on macOS and Windows too, not only on Linux, and the `_THREAD_SAFE`/`_REENTRANT` defines now actually apply there.
- `NO_PARALLEL=0` and `NO_PARALLEL=false` no longer disable the parallel native build, matching how the other environment variables are read.

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
