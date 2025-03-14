const Globals = require('../globals')
const Bindings = require('../bindings')
const { video: videoModule } = require('../video')
const { reconcileDisplays } = require('./reconcile-displays')
const { mapping } = require('../keyboard/key-mapping')
const { reconcileAudioDevices } = require('./reconcile-audio-devices')
const { reconcileJoystickAndControllerDevices } = require('./reconcile-joystick-and-controller-devices')
const { clipboard: clipboardModule } = require('../clipboard')


const handleEvent = (event) => {
	const { family, type } = event
	if (family === undefined || type === undefined) { return }
	delete event.family

	switch (family) {
		case 'app': {
			if (type !== 'quit') { return }

			for (const window of Globals.windows.all.values()) {
				window.destroyGently()
			}
		} break

		// TODO: this also needs a reconcile function
		case 'display': {
			const { displayIndex } = event
			delete event.displayIndex

			switch (type) {
				case 'displayAdd':
				case 'displayRemove':
				{
					const { displays } = event
					delete event.displays

					reconcileDisplays(displays)
					return
				}

				case 'displayOrient': {
					const display = Globals.displays[displayIndex]
					display.orientation = event.orientation
				} break

				case 'displayMove': {
					const { geometryX, geometryY, usableX, usableY } = event
					delete event.geometryX
					delete event.geometryY
					delete event.usableX
					delete event.usableY

					const display = Globals.displays[displayIndex]
					display.geometry.x = geometryX
					display.geometry.y = geometryY
					display.usable.x = usableX
					display.usable.y = usableY
				} break

				// No default
			}

			videoModule.emit(type, event)
		} break

		case 'window': {
			const { windowId } = event
			delete event.windowId

			const window = Globals.windows.all.get(windowId)
			if (!window) { return }

			switch (type) {
				case 'move': {
					window._x = event.x
					window._y = event.y
				} break
				case 'resize': {
					window._width = event.width
					window._height = event.height
					window._pixelWidth = event.pixelWidth
					window._pixelHeight = event.pixelHeight
				} break
				case 'displayChange': {
					window._displayIndex = event.displayIndex
					delete event.displayIndex
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
					window._visible = false
					window._minimized = true
					window._maximized = false
					window._fullscreen = false
				} break
				case 'maximize': {
					window._visible = true
					window._minimized = false
					window._maximized = true
					window._fullscreen = false
				} break
				case 'restore': {
					window._visible = true
					window._minimized = false
					window._maximized = false
					window._fullscreen = false
				} break

				case 'focus': {
					Globals.windows.focused = window
				} break
				case 'blur': {
					Globals.windows.focused = null
				} break

				case 'hover': {
					Globals.windows.hovered = window
				} break
				case 'leave': {
					Globals.windows.hovered = null
				} break

				case 'close': {
					window.destroyGently()
					return
				}

				default: return
			}

			window.emit(type, event)
		} break

		case 'keyboard': {
			const { windowId } = event
			delete event.windowId

			const window = Globals.windows.all.get(windowId)
			if (!window) { return }

			const { key } = event
			event.key = mapping[key] ?? (key?.length === 1 ? key : null)

			window.emit(type, event)
		} break

		case 'mouse':
		case 'text':
		case 'drop': {
			const { windowId } = event
			delete event.windowId

			const window = Globals.windows.all.get(windowId)
			if (!window) { return }

			window.emit(type, event)
		} break

		case 'joystickDevice': {
			if (type === 'deviceRemove') {
				const { joystickId } = event
				delete event.joystickId

				closeJoysticks: {
					const collection = Globals.joystickInstances.byId.get(joystickId)
					if (!collection) { break closeJoysticks }
					for (const joystickInstance of collection.values()) {
						joystickInstance.close()
					}
				}

				closeControllers: {
					const collection = Globals.controllerInstances.byId.get(joystickId)
					if (!collection) { break closeControllers }
					for (const controllerInstance of collection.values()) {
						controllerInstance.close()
					}
				}
			}

			const { devices } = event
			delete event.devices

			reconcileJoystickAndControllerDevices(devices)
		} break

		case 'joystick': {
			const { joystickId } = event
			delete event.joystickId

			const collection = Globals.joystickInstances.byId.get(joystickId)
			if (!collection) { return }

			switch (type) {
				case 'axisMotion': {
					for (const joystickInstance of collection) {
						joystickInstance._axes[event.axis] = event.value
						joystickInstance.emit(type, event)
					}
				} break

				case 'ballMotion': {
					for (const joystickInstance of collection) {
						const ball = joystickInstance._balls[event.ball]
						ball.x = event.x
						ball.y = event.y
						joystickInstance.emit(type, event)
					}
				} break

				case 'buttonDown': {
					for (const joystickInstance of collection) {
						joystickInstance._buttons[event.button] = true
						joystickInstance.emit(type, event)
					}
				} break
				case 'buttonUp': {
					for (const joystickInstance of collection) {
						joystickInstance._buttons[event.button] = false
						joystickInstance.emit(type, event)
					}
				} break

				case 'hatMotion': {
					for (const joystickInstance of collection) {
						joystickInstance._hats[event.hat] = event.value
						joystickInstance.emit(type, event)
					}
				} break

				// No default
			}
		} break

		case 'controller': {
			const { controllerId } = event
			delete event.controllerId

			const collection = Globals.controllerInstances.byId.get(controllerId)
			if (!collection) { return }

			switch (type) {
				case 'axisMotion': {
					for (const controllerInstance of collection.values()) {
						controllerInstance._axes[event.axis] = event.value
						controllerInstance.emit(type, event)
					}
				} break

				case 'buttonDown': {
					for (const controllerInstance of collection.values()) {
						controllerInstance._buttons[event.button] = true
						controllerInstance.emit(type, event)
					}
				} break

				case 'buttonUp': {
					for (const controllerInstance of collection.values()) {
						controllerInstance._buttons[event.button] = false
						controllerInstance.emit(type, event)
					}
				} break

				case 'remap': {
					const { axes, buttons } = event
					delete event.axes
					delete event.buttons

					for (const controllerInstance of collection.values()) {
						Object.assign(controllerInstance._axes, axes)
						Object.assign(controllerInstance._buttons, buttons)
						controllerInstance.emit(type, event)
					}
				} break

				// No default
			}
		} break

		case 'sensor': {
			const { sensorId } = event
			delete event.sensorId

			const collection = Globals.sensorInstances.byId.get(sensorId)
			if (!collection) { return }

			switch (type) {
				case 'update': {
					for (const sensorInstance of collection.values()) {
						sensorInstance.emit(type, event)
					}
				} break

				// No default
			}
		} break

		case 'audioDevice': {
			const { audioDeviceType } = event
			delete event.audioDeviceType

			if (type === 'deviceRemove') {
				const { audioId } = event
				delete event.audioId

				const audioInstance = Globals.audioInstances.get(audioId)
				if (audioInstance) { audioInstance.close() }
			}

			const { devices } = event
			delete event.devices

			reconcileAudioDevices(devices, audioDeviceType)
		} break

		case 'clipboard': {
			clipboardModule.emit(type, event)
		} break

		// No default
	}
}


let polling = false

const poll = () => {
	if (polling) { return }
	polling = true

	Bindings.events_poll(handleEvent)

	polling = false
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
