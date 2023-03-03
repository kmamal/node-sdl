import Bindings from '../bindings.js'
import * as Globals from '../globals.js'
import Enums from '../enums.js'
import { maybeTriggerQuit } from './quit.js'
import { mapping } from '../keyboard/key-mapping.js'
import { joystick as joystickModule } from '../joystick/index.js'
import { controller as controllerModule } from '../controller/index.js'
import { audio as audioModule } from '../audio/index.js'
import { clipboard as clipboardModule } from '../clipboard/index.js'
import {
	make as makeJoystickDevice,
	compare as compareJoystickDevice,
} from '../joystick/device.js'
import {
	make as makeControllerDevice,
	compare as compareControllerDevice,
	filter as filterControllerDevice,
} from '../controller/device.js'
import {
	make as makeAudioDevice,
	compare as compareAudioDevice,
} from '../audio/device.js'


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
			const type = 'deviceRemove'
			const event = { type, device: mainDevice }
			emitter.emit(type, event)
			mainDevice = mainList[mainIndex]
		} else {
			mainList.splice(mainIndex, 0, currDevice)
			mainDevice = mainList[++mainIndex]
			const type = 'deviceAdd'
			const event = { type, device: currDevice }
			emitter.emit(type, event)
			currDevice = currList[++currIndex]
		}
	}

	if (mainIndex < mainList.length) {
		while (mainIndex < mainList.length) {
			[mainDevice] = mainList.splice(mainIndex, 1)
			const type = 'deviceRemove'
			const event = { type, device: mainDevice }
			emitter.emit(type, event)
		}
	} else {
		while (currIndex < currList.length) {
			mainList.push(currDevice)
			const type = 'deviceAdd'
			const event = { type, device: currDevice }
			emitter.emit(type, event)
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
		event.type = Enums.eventTypeNames[type]

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
						const type2 = 'beforeClose'
						const event2 = { type: type2, prevent }
						window.emit(type2, event2)
						if (shouldPrevent) { continue }
					} break

					default: continue
				}

				window.emit(event.type, event)

				if (type === Enums.eventType.close) { window.destroy() }
			} break

			case Enums.eventFamily.keyboard: {
				const { windowId } = event
				delete event.windowId

				const window = Globals.windows.all.get(windowId)
				if (!window) { continue }

				const { key } = event
				event.key = mapping[key] ?? (key?.length === 1 ? key : null)

				window.emit(event.type, event)
			} break

			case Enums.eventFamily.mouse:
			case Enums.eventFamily.text:
			case Enums.eventFamily.drop: {
				const { windowId } = event
				delete event.windowId

				const window = Globals.windows.all.get(windowId)
				if (!window) { continue }

				window.emit(event.type, event)
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
							joystickInstance.emit(event.type, event)
						}
					} break

					case Enums.eventType.ballMotion: {
						for (const joystickInstance of collection) {
							const ball = joystickInstance._balls[event.ball]
							ball.x = event.x
							ball.y = event.y
							joystickInstance.emit(event.type, event)
						}
					} break

					case Enums.eventType.buttonDown: {
						for (const joystickInstance of collection) {
							joystickInstance._buttons[event.button] = true
							joystickInstance.emit(event.type, event)
						}
					} break
					case Enums.eventType.buttonUp: {
						for (const joystickInstance of collection) {
							joystickInstance._buttons[event.button] = false
							joystickInstance.emit(event.type, event)
						}
					} break

					case Enums.eventType.hatMotion: {
						event.value = Enums.hatPositionNames[event.value]
						for (const joystickInstance of collection) {
							joystickInstance._hats[event.hat] = event.value
							joystickInstance.emit(event.type, event)
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
							controllerInstance.emit(event.type, event)
						}
					} break

					case Enums.eventType.buttonDown: {
						event.button = Enums.controllerButtonNames[event.button]
						for (const controllerInstance of collection.values()) {
							controllerInstance._axes[event.button] = true
							controllerInstance.emit(event.type, event)
						}
					} break

					case Enums.eventType.buttonUp: {
						event.button = Enums.controllerButtonNames[event.button]
						for (const controllerInstance of collection.values()) {
							controllerInstance._axes[event.button] = true
							controllerInstance.emit(event.type, event)
						}
					} break

					case Enums.eventType.remap: {
						const { axes, buttons } = event
						delete event.axes
						delete event.buttons

						for (const controllerInstance of collection.values()) {
							Object.assign(controllerInstance._axes, axes)
							Object.assign(controllerInstance._buttons, buttons)
							controllerInstance.emit(event.type, event)
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
				clipboardModule.emit(event.type, event)
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
