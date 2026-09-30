const Globals = require('../globals')
const Bindings = require('../bindings')
const { video: videoModule } = require('../video')
const { keyboard: keyboardModule } = require('../keyboard')
const { mapping, isCharacter } = require('../keyboard/key-mapping')
const { joystick: joystickModule } = require('../joystick')
const { make: makeJoystickDevice } = require('../joystick/device')
const { gamepad: gamepadModule } = require('../gamepad')
const { make: makeGamepadDevice, filter: filterGamepadDevice } = require('../gamepad/device')
const { audio: audioModule } = require('../audio')
const { make: makeAudioDevice, update: updateAudioDevice } = require('../audio/device')
const { clipboard: clipboardModule } = require('../clipboard')
const { refreshDevices: refreshTouchDevices } = require('../touch/devices')


const tryEmit = (emitter, type, event) => {
	try {
		try { emitter.emit(type, event) }
		catch (error) { emitter.emit('error', error) }
	}
	catch (error) { process.nextTick(() => { throw error }) }
}

const tryCall = (fn) => {
	try { fn() }
	catch (error) { process.nextTick(() => { throw error }) }
}

const handleEvent = (event) => {
	const { target, targetId, type } = event
	delete event.target
	delete event.targetId

	switch (target) {
		case 'app': {
			if (type !== 'quit') { return }

			for (const window of Globals.windows.all.values()) {
				tryCall(() => { window.destroyGently() })
			}
		} break

		case 'video': {
			switch (type) {
				case 'displayAdd': {
					const { display } = event
					delete event.display

					if (Globals.displays.some((a) => a.id === display.id)) { return }
					Globals.displays.push(display)
					event.device = display
				} break

				case 'displayRemove': {
					const { displayId } = event
					delete event.displayId

					const index = Globals.displays.findIndex((a) => a.id === displayId)
					if (index === -1) { return }
					event.device = Globals.displays[index]
					Globals.displays.splice(index, 1)
				} break

				case 'displayOrient': {
					const { displayId } = event
					delete event.displayId

					const display = Globals.displays.find((a) => a.id === displayId)
					if (!display) { return }

					display.orientation = event.orientation
					event.device = display
				} break

				case 'displayMove': {
					const { displayId, geometryX, geometryY, usableX, usableY } = event
					delete event.displayId
					delete event.geometryX
					delete event.geometryY
					delete event.usableX
					delete event.usableY

					const display = Globals.displays.find((a) => a.id === displayId)
					if (!display) { return }

					display.geometry.x = geometryX
					display.geometry.y = geometryY
					display.usable.x = usableX
					display.usable.y = usableY
					event.device = display
				} break

				case 'displayScaleChange':
				case 'displayModeChange':
				case 'displayUsableChange': {
					const { displayId, display: fresh } = event
					delete event.displayId
					delete event.display

					const display = Globals.displays.find((a) => a.id === displayId)
					if (!display) { return }

					Object.assign(display, fresh)
					event.device = display
					if (type === 'displayScaleChange') { event.scale = display.scale }
					if (type === 'displayModeChange') {
						event.format = display.format
						event.frequency = display.frequency
						event.geometry = display.geometry
					}
				} break

				// No default
			}

			tryEmit(videoModule, type, event)
		} break

		case 'window': {
			const window = Globals.windows.all.get(targetId)
			if (!window) { return }

			switch (type) {
				case 'move': {
					window._x = event.x
					window._y = event.y
				} break
				case 'resize': {
					if (
						window._width === event.width
						&& window._height === event.height
						&& window._pixelWidth === event.pixelWidth
						&& window._pixelHeight === event.pixelHeight
					) { return }
					window._width = event.width
					window._height = event.height
					window._pixelWidth = event.pixelWidth
					window._pixelHeight = event.pixelHeight
				} break
				case 'displayChange': {
					window._displayId = event.displayId
					delete event.displayId
					event.display = window.display
				} break

				case 'show': {
					window._visible = true
				} break
				case 'hide': {
					window._visible = false
				} break
				case 'expose': {
					// Nothing
				} break

				case 'minimize': {
					window._minimized = true
					window._maximized = false
				} break
				case 'maximize': {
					window._minimized = false
					window._maximized = true
				} break
				case 'restore': {
					window._minimized = false
					window._maximized = false
				} break

				case 'enterFullscreen': {
					window._fullscreen = true
					return
				}
				case 'leaveFullscreen': {
					window._fullscreen = false
					return
				}

				case 'focus': {
					Globals.windows.focused = window
				} break
				case 'blur': {
					if (Globals.windows.focused === window) { Globals.windows.focused = null }
				} break

				case 'hover': {
					Globals.windows.hovered = window
				} break
				case 'leave': {
					if (Globals.windows.hovered === window) { Globals.windows.hovered = null }
				} break

				case 'close': {
					tryCall(() => { window.destroyGently() })
					return
				}

				case 'renderDeviceLost': {
					tryCall(() => {
						const result = Bindings.window_setAcceleratedAndVsync(window._id, window._accelerated, window._vsync)
						window._accelerated = result.accelerated
						window._vsync = result.vsync
					})
					return
				}

				case 'keyDown':
				case 'keyUp': {
					const { key } = event
					event.key = mapping[key] ?? (isCharacter(key) ? key : null)
				} break

				case 'fingerDown':
				case 'fingerUp':
				case 'fingerMove':
				case 'fingerCancel': {
					const { touchId } = event
					delete event.touchId

					// Events synthesized from the mouse have null touch device
					let device = null
					if (!event.mouse) {
						device = Globals.touchDevices.find(({ id }) => id === touchId)
						if (!device) {
							try { refreshTouchDevices() }
							catch (_) { return }
							device = Globals.touchDevices.find(({ id }) => id === touchId)
							if (!device) { return }
						}
					}

					event.device = device
				} break

				// No default
			}

			tryEmit(window, type, event)
		} break

		case 'keyboard': {
			tryEmit(keyboardModule, type, event)
		} break

		case 'joystick': {
			const collection = Globals.joystickInstances.byId.get(targetId)

			// Battery updates arrive as joystick events but also concern gamepads
			if (type === 'powerUpdate') {
				if (collection) {
					for (const joystickInstance of collection) {
						joystickInstance._power = event.power
						tryEmit(joystickInstance, type, event)
					}
				}

				const otherCollection = Globals.gamepadInstances.byId.get(targetId)
				if (!otherCollection) { return }

				for (const gamepadInstance of otherCollection) {
					gamepadInstance._power = event.power
					tryEmit(gamepadInstance, type, event)
				}
				return
			}

			if (!collection) { return }

			switch (type) {
				case 'axisMotion': {
					for (const joystickInstance of collection) {
						joystickInstance._axes[event.axis] = event.value
						tryEmit(joystickInstance, type, event)
					}
				} break

				case 'ballMotion': {
					for (const joystickInstance of collection) {
						const ball = joystickInstance._balls[event.ball]
						ball.x += event.dx
						ball.y += event.dy
						event.x = ball.x
						event.y = ball.y
						tryEmit(joystickInstance, type, event)
					}
				} break

				case 'buttonDown': {
					for (const joystickInstance of collection) {
						joystickInstance._buttons[event.button] = true
						tryEmit(joystickInstance, type, event)
					}
				} break
				case 'buttonUp': {
					for (const joystickInstance of collection) {
						joystickInstance._buttons[event.button] = false
						tryEmit(joystickInstance, type, event)
					}
				} break

				case 'hatMotion': {
					for (const joystickInstance of collection) {
						joystickInstance._hats[event.hat] = event.value
						tryEmit(joystickInstance, type, event)
					}
				} break

				// No default
			}
		} break

		case 'joystickDevice':
		case 'gamepadDevice': {
			const isGamepad = target === 'gamepadDevice'
			const emitter = isGamepad ? gamepadModule : joystickModule
			const list = isGamepad ? Globals.gamepadDevices : Globals.joystickDevices

			switch (type) {
				case 'deviceAdd': {
					const { device } = event
					delete event.device

					if (isGamepad && !filterGamepadDevice(device)) { return }
					if (list.some((a) => a.id === device.id)) { return }

					const made = isGamepad ? makeGamepadDevice(device) : makeJoystickDevice(device)
					list.push(made)
					event.device = made
				} break

				case 'deviceRemove': {
					const { deviceId } = event
					delete event.deviceId

					const instances = isGamepad ? Globals.gamepadInstances : Globals.joystickInstances
					const collection = instances.byId.get(deviceId)
					if (collection) {
						for (const instance of collection.values()) {
							tryCall(() => { instance.close() })
						}
					}

					const index = list.findIndex((a) => a.id === deviceId)
					if (index === -1) { return }
					event.device = list[index]
					list.splice(index, 1)
				} break

				// No default
			}

			tryEmit(emitter, type, event)
		} break

		case 'gamepad': {
			const collection = Globals.gamepadInstances.byId.get(targetId)
			if (!collection) { return }

			switch (type) {
				case 'axisMotion': {
					for (const gamepadInstance of collection) {
						gamepadInstance._axes[event.axis] = event.value
						tryEmit(gamepadInstance, type, event)
					}
				} break

				case 'buttonDown': {
					for (const gamepadInstance of collection) {
						gamepadInstance._buttons[event.button] = true
						tryEmit(gamepadInstance, type, event)
					}
				} break

				case 'buttonUp': {
					for (const gamepadInstance of collection) {
						gamepadInstance._buttons[event.button] = false
						tryEmit(gamepadInstance, type, event)
					}
				} break

				case 'steamHandleUpdate': {
					for (const gamepadInstance of collection) {
						gamepadInstance._steamHandle = event.steamHandle
						tryEmit(gamepadInstance, type, event)
					}
				} break

				case 'remap': {
					const { axes, buttons, buttonLabels } = event
					delete event.axes
					delete event.buttons
					delete event.buttonLabels

					for (const gamepadInstance of collection) {
						Object.assign(gamepadInstance._axes, axes)
						Object.assign(gamepadInstance._buttons, buttons)
						Object.assign(gamepadInstance._buttonLabels, buttonLabels)
						tryEmit(gamepadInstance, type, event)
					}
				} break

				// No default
			}
		} break

		case 'sensor': {
			const collection = Globals.sensorInstances.byId.get(targetId)
			if (!collection) { return }

			switch (type) {
				case 'update': {
					for (const sensorInstance of collection) {
						tryEmit(sensorInstance, type, event)
					}
				} break

				// No default
			}
		} break

		case 'audioDevice': {
			const { audioDeviceType } = event
			delete event.audioDeviceType

			const list = Globals.audioDevices[audioDeviceType]
			const emitter = audioModule[audioDeviceType]

			switch (type) {
				case 'deviceAdd': {
					const { device } = event
					delete event.device

					if (list.some((a) => a.id === device.id)) { return }
					const made = makeAudioDevice(device)
					list.push(made)
					event.device = made
					updateAudioDevice(list[0])
				} break

				case 'deviceRemove': {
					const { deviceId } = event
					delete event.deviceId

					const index = list.findIndex((a) => a.id === deviceId)
					if (index === -1) { return }
					const device = list[index]
					list.splice(index, 1)

					for (const stream of [ ...Globals.audioStreams.values() ]) {
						if (stream.device === device) {
							tryCall(() => { stream.close() })
						}
					}
					updateAudioDevice(list[0])

					event.device = device
				} break

				case 'deviceFormatChange': {
					const { deviceId } = event
					const device = Globals.audioStreams.get(deviceId)?.device
						?? list.find((a) => a.id === deviceId)
					if (device) { updateAudioDevice(device) }
				} return

				// No default
			}

			tryEmit(emitter, type, event)
		} break

		case 'clipboard': {
			tryEmit(clipboardModule, type, event)
		} break

		// No default
	}
}


let polling = false

const poll = () => {
	if (polling) { return }
	polling = true
	try { Bindings.events_poll(handleEvent) }
	finally { polling = false }
}

let pollInterval = null

const switchToPollingFast = () => {
	clearInterval(pollInterval)
	pollInterval = setInterval(poll, 0)
}

const switchToPollingSlow = () => {
	clearInterval(pollInterval)
	pollInterval = setInterval(poll, 1e3)
	pollInterval.unref()
}

const stopPolling = () => {
	clearInterval(pollInterval)
	pollInterval = null
}

switchToPollingSlow()
poll()

Globals.events = {
	poll,
	switchToPollingFast,
	switchToPollingSlow,
	stopPolling,
}
