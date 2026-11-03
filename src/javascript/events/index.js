const { isMainThread } = require('node:worker_threads')
const Globals = require('../globals')
const Bindings = require('../bindings')
const { keyboard: keyboardModule } = require('../keyboard')
const { clipboard: clipboardModule } = require('../clipboard')
const { tryEmit, tryCall } = require('./try')
const { invalidateReverseMapping } = require('../keyboard/key-mapping')
const {
	handleDisplayEvent,
	handleWindowEvent,
} = require('../video/events')
const {
	handleEvent: handleJoystickEvent,
	handleJoystickDeviceEvent,
	handleGamepadDeviceEvent,
} = require('../joystick/events')
const { handleEvent: handleGamepadEvent } = require('../gamepad/events')
const { handleEvent: handleSensorEvent } = require('../sensor/events')
const { handleEvent: handleAudioDeviceEvent } = require('../audio/events')
const { handleDevicesChange: handleJoystickDevicesChange } = require('../joystick/devices')

const handleAppEvent = ({ type }) => {
	if (type !== 'quit') { return }

	for (const window of Globals.windows.all.values()) {
		tryCall(() => { window.destroyGently() })
	}
}

const handleChangeEvent = ({ type }) => {
	if (type !== 'joystickDevices') { return }

	handleJoystickDevicesChange()
}

const emitTo = (emitter) => (event) => { tryEmit(emitter, event.type, event) }

const handleKeyboardEvent = (event) => {
	if (event.type === 'keymapChange') { invalidateReverseMapping() }
	tryEmit(keyboardModule, event.type, event)
}

const handlers = {
	app: handleAppEvent,
	change: handleChangeEvent,
	video: handleDisplayEvent,
	window: handleWindowEvent,
	keyboard: handleKeyboardEvent,
	joystickDevice: handleJoystickDeviceEvent,
	joystick: handleJoystickEvent,
	gamepadDevice: handleGamepadDeviceEvent,
	gamepad: handleGamepadEvent,
	sensor: handleSensorEvent,
	audioDevice: handleAudioDeviceEvent,
	clipboard: emitTo(clipboardModule),
}

const handleEvent = (event) => {
	const { target, targetId } = event
	delete event.target
	delete event.targetId

	handlers[target]?.(event, targetId)
}


let polling = false

let pollInterval = null
let pollingFast = null

const setPollingFast = (fast) => {
	if (!isMainThread || fast === pollingFast) { return }
	pollingFast = fast
	clearInterval(pollInterval)
	pollInterval = setInterval(poll, fast ? 0 : 1e3)
	pollInterval.unref()
}

const poll = () => {
	if (polling) { return }
	polling = true
	try {
		setPollingFast(Bindings.events_poll(handleEvent))
	}
	finally { polling = false }
}

const withoutPolling = (fn) => {
	const prevValue = polling
	polling = true
	try { fn() }
	finally { polling = prevValue }
}

const setDemand = (demand) => { setPollingFast(Bindings.events_setDemand(demand)) }

const stopPolling = () => {
	clearInterval(pollInterval)
	pollInterval = null
}

const broadcastChange = (name) => { Bindings.events_broadcastChange(name) }

Globals.events = {
	poll,
	withoutPolling,
	setDemand,
	stopPolling,
	broadcastChange,
}

Bindings.events_register(poll, isMainThread)

if (isMainThread) {
	setPollingFast(false)
	poll()
}
