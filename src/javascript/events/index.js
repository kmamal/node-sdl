const Bindings = require('../bindings')
const Globals = require('../globals')
const Enums = require('../enums')
const { maybeTriggerQuit } = require('./quit')
const { mapping } = require('../keyboard/key-mapping')
const { joystick: joystickModule } = require('../joystick')
const { controller: controllerModule } = require('../controller')
const { audio: audioModule } = require('../audio')
const { clipboard: clipboardModule } = require('../clipboard')
const {
	make: makeJoystickDevice,
	compare: compareJoystickDevice,
} = require('../joystick/device')
const {
	make: makeControllerDevice,
	compare: compareControllerDevice,
	filter: filterControllerDevice,
} = require('../controller/device')
const {
	make: makeAudioDevice,
	compare: compareAudioDevice,
} = require('../audio/device')


const reconcileDevices = (emitter, mainList, currList, compare) => {
	currList.sort(compare)

	let mainIndex = 0
	let currIndex = 0
	let mainDevice = mainList[mainIndex]
	let currDevice = currList[currIndex]
	while (mainIndex < mainList.length && currIndex < currList.length) {
		const cmp = compare(mainDevice, currDevice)
		if (cmp === 0) {
			mainDevice = mainList[++mainIndex]
			currDevice = currList[++currIndex]
		} else if (cmp < 0) {
			mainList.splice(mainIndex, 1)
			emitter.emit('deviceRemove', { device: mainDevice })
			mainDevice = mainList[mainIndex]
		} else {
			mainList.splice(mainIndex, 0, currDevice)
			mainDevice = mainList[++mainIndex]
			emitter.emit('deviceAdd', { device: currDevice })
			currDevice = currList[++currIndex]
		}
	}

	if (mainIndex < mainList.length) {
		while (mainIndex < mainList.length) {
			[ mainDevice ] = mainList.splice(mainIndex, 1)
			emitter.emit('deviceRemove', { device: mainDevice })
		}
	} else {
		while (currIndex < currList.length) {
			mainList.push(currDevice)
			emitter.emit('deviceAdd', { device: currDevice })
			currDevice = currList[++currIndex]
		}
	}
}


const handleEvents = () => {
	let event
	while ((event = Bindings.events_poll())) {
		const { family, type } = event
		if (family === undefined || type === undefined) { continue }
		delete event.family
		delete event.type

		switch (family) {
			case Enums.eventFamily.app: {
				if (type === Enums.eventType.quit) {
					maybeTriggerQuit()
				}
			} break

			case Enums.eventFamily.window: {
				const { windowId } = event
				delete event.windowId

				const window = Globals.windows.all.get(windowId)
				if (!window) { continue }

				switch (type) {
					case Enums.eventType.move: {
						window._x = event.x
						window._y = event.y
					} break
					case Enums.eventType.resize: {
						window._width = event.width
						window._height = event.height
					} break

					case Enums.eventType.show: {
						window._visible = true
					} break
					case Enums.eventType.hide: {
						window._visible = false
					} break

					case Enums.eventType.minimize: {
						window._visible = false
						window._minimized = true
						window._maximized = false
						window._fullscreen = false
					} break
					case Enums.eventType.maximize: {
						window._visible = true
						window._minimized = false
						window._maximized = true
						window._fullscreen = false
					} break
					case Enums.eventType.restore: {
						window._visible = true
						window._minimized = false
						window._maximized = false
						window._fullscreen = false
					} break

					case Enums.eventType.focus: {
						window._focused = true
						Globals.windows.focused = window
					} break
					case Enums.eventType.blur: {
						window._focused = false
						Globals.windows.focused = null
					} break

					case Enums.eventType.hover: {
						window._hovered = true
						Globals.windows.hovered = window
					} break
					case Enums.eventType.leave: {
						window._hovered = false
						Globals.windows.hovered = null
					} break

					case Enums.eventType.close: {
						let shouldPrevent = false
						const prevent = () => { shouldPrevent = true }
						window.emit('beforeClose', { prevent })
						if (shouldPrevent) { continue }
					} break

					default: continue
				}

				if (Object.keys(event).length > 0) {
					window.emit(Enums.eventTypeNames[type], event)
				} else {
					window.emit(Enums.eventTypeNames[type])
				}

				if (type === Enums.eventType.close) { window.destroy() }
			} break

			case Enums.eventFamily.keyboard: {
				const { windowId } = event
				delete event.window

				const window = Globals.windows.all.get(windowId)
				if (!window) { continue }

				const { key } = event
				event.key = mapping[key] ?? (key?.length === 1 ? key : null)

				if (Object.keys(event).length > 0) {
					window.emit(Enums.eventTypeNames[type], event)
				} else {
					window.emit(Enums.eventTypeNames[type])
				}
			} break

			case Enums.eventFamily.mouse:
			case Enums.eventFamily.text:
			case Enums.eventFamily.drop: {
				const { windowId } = event
				delete event.windowId

				const window = Globals.windows.all.get(windowId)
				if (!window) { continue }

				if (Object.keys(event).length > 0) {
					window.emit(Enums.eventTypeNames[type], event)
				} else {
					window.emit(Enums.eventTypeNames[type])
				}
			} break

			case Enums.eventFamily.joystickDevice: {
				if (type === Enums.eventType.deviceRemove) {
					const { joystickId } = event
					delete event.joystickId

					{
						const collection = Globals.joystickInstances.byId.get(joystickId)
						for (const joystickInstance of collection.values()) {
							joystickInstance.close()
						}
					}

					{
						const collection = Globals.controllerInstances.byId.get(joystickId)
						for (const controllerInstance of collection.values()) {
							controllerInstance.close()
						}
					}
				}

				const { devices: joystickDevices } = event
				delete event.devices

				const controllerDevices = JSON.parse(JSON.stringify(joystickDevices
					.filter(filterControllerDevice)))

				for (const joystickDevice of joystickDevices) {
					makeJoystickDevice(joystickDevice)
				}

				for (const controllerDevice of controllerDevices) {
					makeControllerDevice(controllerDevice)
				}

				reconcileDevices(
					joystickModule,
					Globals.joystickDevices,
					joystickDevices,
					compareJoystickDevice,
				)

				reconcileDevices(
					controllerModule,
					Globals.controllerDevices,
					controllerDevices,
					compareControllerDevice,
				)
			} break

			case Enums.eventFamily.joystick: {
				const { joystickId } = event
				delete event.joystickId

				const collection = Globals.joystickInstances.byId.get(joystickId)
				if (!collection) { continue }

				switch (type) {
					case Enums.eventType.axisMotion: {
						for (const joystickInstance of collection) {
							joystickInstance._axes[event.axis] = event.value
							joystickInstance.emit('axisMotion', event)
						}
					} break

					case Enums.eventType.ballMotion: {
						for (const joystickInstance of collection) {
							const ball = joystickInstance._balls[event.ball]
							ball.x = event.x
							ball.y = event.y
							joystickInstance.emit('ballMotion', event)
						}
					} break

					case Enums.eventType.buttonDown: {
						for (const joystickInstance of collection) {
							joystickInstance._buttons[event.button] = true
							joystickInstance.emit('buttonDown', event)
						}
					} break
					case Enums.eventType.buttonUp: {
						for (const joystickInstance of collection) {
							joystickInstance._buttons[event.button] = false
							joystickInstance.emit('buttonUp', event)
						}
					} break

					case Enums.eventType.hatMotion: {
						event.value = Enums.hatPositionNames[event.value]
						for (const joystickInstance of collection) {
							joystickInstance._hats[event.hat] = event.value
							joystickInstance.emit('hatMotion', event)
						}
					} break

					default: continue
				}
			} break

			case Enums.eventFamily.controller: {
				const { controllerId } = event
				delete event.controllerId

				const collection = Globals.controllerInstances.byId.get(controllerId)
				if (!collection) { continue }

				switch (type) {
					case Enums.eventType.axisMotion: {
						event.axis = Enums.controllerAxisNames[event.axis]
						for (const controllerInstance of collection.values()) {
							controllerInstance._axes[event.axis] = event.value
							controllerInstance.emit('axisMotion', event)
						}
					} break

					case Enums.eventType.buttonDown: {
						event.button = Enums.controllerButtonNames[event.button]
						for (const controllerInstance of collection.values()) {
							controllerInstance._axes[event.button] = true
							controllerInstance.emit('buttonDown', event)
						}
					} break

					case Enums.eventType.buttonUp: {
						event.button = Enums.controllerButtonNames[event.button]
						for (const controllerInstance of collection.values()) {
							controllerInstance._axes[event.button] = true
							controllerInstance.emit('buttonUp', event)
						}
					} break

					case Enums.eventType.remap: {
						const { axes, buttons } = event
						delete event.axes
						delete event.buttons

						for (const controllerInstance of collection.values()) {
							Object.assign(controllerInstance._axes, axes)
							Object.assign(controllerInstance._buttons, buttons)
							controllerInstance.emit('remap', event)
						}
					} break

					default: continue
				}
			} break

			case Enums.eventFamily.audioDevice: {
				const { isRecorder } = event
				delete event.isRecorder

				if (type === Enums.eventType.deviceRemove) {
					const { audioId } = event
					delete event.audioId

					const audioInstance = Globals.audioInstances.get(audioId)
					if (audioInstance) { audioInstance.close() }
				}

				const { devices: audioDevices } = event
				delete event.devices

				for (const audioDevice of audioDevices) {
					makeAudioDevice(audioDevice)
				}

				reconcileDevices(
					audioModule,
					Globals.audioDevices[isRecorder ? 'recording' : 'playback'],
					audioDevices,
					compareAudioDevice,
				)
			} break

			case Enums.eventFamily.clipboard: {
				clipboardModule.emit(Enums.eventTypeNames[type])
			} break

			default: continue
		}
	}
}

let eventsInterval = null

const startPolling = () => {
	eventsInterval = setInterval(handleEvents, 0)
}

const stopPolling = () => {
	clearInterval(eventsInterval)
	eventsInterval = null
}

Globals.events = {
	startPolling,
	stopPolling,
}
