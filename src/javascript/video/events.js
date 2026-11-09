const Globals = require('../globals')
const Bindings = require('../bindings')
const { video: videoModule } = require('.')
const { mapKey } = require('../keyboard/key-mapping')
const { refreshDevices: refreshTouchDevices } = require('../touch/devices')
const { tryEmit, tryCall } = require('../events/try')

const handleDisplayEvent = (event) => {
	const { type } = event

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

		case 'displayMove':
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
}

const handleWindowEvent = (event, targetId) => {
	const { type } = event

	const window = Globals.windows.all.get(targetId)
	if (!window) { return }

	switch (type) {
		case 'move': {
			if (window._x === event.x && window._y === event.y) { return }
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
		} break
		case 'leaveFullscreen': {
			window._fullscreen = false
		} break

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
			try {
				const result = Bindings.window_setAcceleratedAndVsync(window._id, window._accelerated, window._vsync)
				window._accelerated = result.accelerated
				window._vsync = result.vsync
			}
			catch (error) { tryEmit(window, 'error', error) }
			return
		}

		case 'keyDown':
		case 'keyUp': {
			event.key = mapKey(event.key)
		} break

		case 'fingerDown':
		case 'fingerUp':
		case 'fingerMove':
		case 'fingerCancel': {
			const { touchId } = event
			delete event.touchId

			// Events synthesized from the mouse or pen have null touch device
			let device = null
			if (!event.mouse && !event.pen) {
				device = Globals.touchDevices.find(({ id }) => id === touchId)
				if (!device) {
					try { refreshTouchDevices() }
					catch { return }
					device = Globals.touchDevices.find(({ id }) => id === touchId)
					if (!device) { return }
				}
			}

			event.device = device
		} break

		// No default
	}

	tryEmit(window, type, event)
}

module.exports = {
	handleDisplayEvent,
	handleWindowEvent,
}
