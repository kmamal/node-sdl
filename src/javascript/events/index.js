const Bindings = require('../bindings')
const Globals = require('../globals')
const { maybeTriggerQuit } = require('./quit')
const { audio } = require('../audio')
const { clipboard } = require('../clipboard')

const handleEvents = () => {
	let event
	while ((event = Bindings.events_poll())) {
		const { family, type } = event
		if (!family || !type) { continue }
		delete event.family

		switch (family) {
			case 'app': {
				maybeTriggerQuit()
				break
			}

			case 'window': {
				const window = Globals.windows.all.get(event.window)
				if (!window) { return }

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
						let should_prevent = false
						const prevent = () => { should_prevent = true }

						const type2 = 'before-close'
						const event2 = {
							type: type2,
							timestamp: event.timestamp,
							prevent,
						}
						window.emit(type2, event2)

						if (should_prevent) { return }
						break
					}

					// No default
				}

				event.window = window
				window.emit(type, event)

				if (type === 'close') { window.destroy() }
				break
			}

			case 'keyboard':
			case 'mouse':
			case 'drop':
			{
				const window = Globals.windows.all.get(event.window)
				if (!window) { return }

				event.window = window
				window.emit(type, event)
				break
			}

			case 'audio-device': {
				const { index, recording } = event
				const outdated = recording
					? Globals.audio_devices.recording
					: Globals.audio_devices.playback
				const updated = Bindings.audio_getDevices(recording)
				if (recording) {
					Globals.audio_devices.recording = updated
				} else {
					Globals.audio_devices.playback = updated
				}

				event.device = (type.endsWith('add') ? updated : outdated)[index]
				delete event.index
				delete event.recording
				audio.emit(type, event)
				break
			}

			case 'clipboard': {
				clipboard.emit(type, event)
			}

			// No default
		}

		// if (event.joystick) {
		// 	const joystick = Globals.joysticks.all.get(event.joystick)
		// 	if (!joystick) { return }

		// 	switch (type) {
		// 		case 'joystick-axis-motion': {
		// 			joystick.axes[event.axis] = event.value
		// 			break
		// 		}
		// 		case 'joystick-ball-motion': {
		// 			const ball = joystick.balls[event.ball]
		// 			ball.x = event.x
		// 			ball.x = event.y
		// 			break
		// 		}
		// 		case 'joystick-hat-motion': {
		// 			joystick.hats[event.hat] = event.value
		// 			break
		// 		}
		// 		case 'joystick-button-up': {
		// 			joystick.buttons[event.button] = 0
		// 			break
		// 		}
		// 		case 'joystick-button-down': {
		// 			joystick.buttons[event.button] = 0
		// 			break
		// 		}
		// 		case 'joystick-device-removed': {
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

let events_interval = null

const startPolling = () => {
	events_interval = setInterval(handleEvents, 0)
}

const stopPolling = () => {
	clearInterval(events_interval)
	events_interval = null
}

Globals.events = {
	startPolling,
	stopPolling,
}
