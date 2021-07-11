const Bindings = require('../bindings')
const Globals = require('../globals')
const { maybeTriggerQuit } = require('./quit')
const { audio } = require('../audio')
const { clipboard } = require('../clipboard')
const { mapping } = require('../keyboard/key-mapping')

const handleEvents = () => {
	let event
	while ((event = Bindings.events_poll())) {
		const { family, type } = event
		if (!family || !type) { continue }
		delete event.family
		delete event.type

		switch (family) {
			case 'app': {
				maybeTriggerQuit()
				break
			}

			case 'window': {
				const window = Globals.windows.all.get(event.window)
				if (!window) { return }
				delete event.window

				switch (type) {
					case 'move': {
						window._x = event.x
						window._y = event.y
						break
					}
					case 'resize': {
						window._width = event.width
						window._height = event.height
						break
					}

					case 'show': {
						window._visible = true
						break
					}
					case 'hide': {
						window._visible = false
						break
					}

					case 'minimize': {
						window._minimized = true
						window._maximized = false
						break
					}
					case 'maximize': {
						window._minimized = false
						window._maximized = true
						break
					}
					case 'restore': {
						window._minimized = false
						window._maximized = false
						break
					}

					case 'focus': {
						window._focused = true
						Globals.windows.focused = window
						break
					}
					case 'blur': {
						window._focused = false
						Globals.windows.focused = null
						break
					}

					case 'hover': {
						window._hovered = true
						Globals.windows.hovered = window
						break
					}
					case 'leave': {
						window._hovered = false
						Globals.windows.hovered = null
						break
					}

					case 'close': {
						let shouldPrevent = false
						const prevent = () => { shouldPrevent = true }

						const type2 = 'beforeClose'
						const event2 = { prevent }
						window.emit(type2, event2)

						if (shouldPrevent) { return }
						break
					}

					// No default
				}

				if (Object.keys(event).length > 0) {
					window.emit(type, event)
				} else {
					window.emit(type)
				}

				if (type === 'close') { window.destroy() }
				break
			}

			case 'keyboard': {
				const window = Globals.windows.all.get(event.window)
				if (!window) { return }
				delete event.window

				const { key } = event
				event.key = mapping[key] ?? (key && Array.from(key).length === 1 ? key : null)

				if (Object.keys(event).length > 0) {
					window.emit(type, event)
				} else {
					window.emit(type)
				}

				break
			}

			case 'mouse':
			case 'text':
			case 'drop':
			{
				const window = Globals.windows.all.get(event.window)
				if (!window) { return }
				delete event.window

				if (Object.keys(event).length > 0) {
					window.emit(type, event)
				} else {
					window.emit(type)
				}

				break
			}

			case 'audioDevice': {
				const { index, recording } = event
				const outdated = recording
					? Globals.audioDevices.recording
					: Globals.audioDevices.playback
				const updated = Bindings.audio_getDevices(recording)
				if (recording) {
					Globals.audioDevices.recording = updated
				} else {
					Globals.audioDevices.playback = updated
				}

				if (type.endsWith('remove')) {
					const device = outdated[index]
					for (const instance of Globals.audioInstances.all.values()) {
						if (instance.device !== device) { continue }
						instance.close()
					}
					event.device = device
				} else {
					event.device = updated[index]
				}

				delete event.index
				delete event.recording
				audio.emit(type, event)
				break
			}

			case 'clipboard': {
				clipboard.emit(type)
			}

			// No default
		}

		// if (event.joystick) {
		// 	const joystick = Globals.joysticks.all.get(event.joystick)
		// 	if (!joystick) { return }

		// 	switch (type) {
		// 		case 'joystickAxisMotion': {
		// 			joystick.axes[event.axis] = event.value
		// 			break
		// 		}
		// 		case 'joystickBallMotion': {
		// 			const ball = joystick.balls[event.ball]
		// 			ball.x = event.x
		// 			ball.x = event.y
		// 			break
		// 		}
		// 		case 'joystickHatMotion': {
		// 			joystick.hats[event.hat] = event.value
		// 			break
		// 		}
		// 		case 'joystickButtonUp': {
		// 			joystick.buttons[event.button] = 0
		// 			break
		// 		}
		// 		case 'joystickButtonDown': {
		// 			joystick.buttons[event.button] = 0
		// 			break
		// 		}
		// 		case 'joystickDeviceRemoved': {
		// 			joystick.close()
		// 			break
		// 		}
		// 		// No default
		// 	}

		// 	event.joystick = joystick
		// 	joystick.emit(type, event)
		// 	return
		// }
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
