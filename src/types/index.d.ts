
export namespace Events {

	interface BaseEvent { readonly type: string }

	type PreventCallback = () => void

	namespace Display {

		interface DisplayEvent extends BaseEvent {
			readonly display: Sdl.Video.Display
		}

		interface Add extends DisplayEvent { readonly type: 'deviceAdd' }
		interface Remove extends DisplayEvent { readonly type: 'deviceRemove' }
		interface Orient extends DisplayEvent { readonly type: 'deviceOrient' }

		type Any = Add | Remove | Orient

	}

	namespace Window {

		interface WindowEvent extends BaseEvent {}

		interface KeyEvent extends WindowEvent {
			readonly scancode: Sdl.Keyboard.Scancode
			readonly key: Sdl.Keyboard.Key | null
			readonly shift: number
			readonly ctrl: number
			readonly alt: number
			readonly super: number
			readonly altgr: number
			readonly capslock: number
			readonly numlock: number
		}

		interface KeyDown extends KeyEvent {
			readonly type: 'keyDown'
			readonly repeat: number
		}
		interface KeyUp extends KeyEvent { readonly type: 'keyUp' }

		interface TextInput extends WindowEvent {
			readonly type: 'textInput'
			readonly text: string
		}

		interface MouseEvent extends WindowEvent {
			readonly x: number
			readonly y: number
			readonly touch: boolean
		}

		interface MouseMove extends MouseEvent { readonly type: 'mouseMove' }

		interface MouseButtonEvent extends MouseEvent {
			readonly button: number
		}

		interface MouseButtonDown extends MouseButtonEvent { readonly type: 'mouseButtonDown' }
		interface MouseButtonUp extends MouseButtonEvent { readonly type: 'mouseButtonUp' }

		interface MouseWheel extends MouseEvent {
			readonly type: 'flipped'
			readonly dx: number
			readonly dy: number
			readonly flipped: boolean
		}

		interface Show extends WindowEvent { readonly type: 'show' }
		interface Hide extends WindowEvent { readonly type: 'hide' }
		interface Expose extends WindowEvent { readonly type: 'expose' }
		interface Minimize extends WindowEvent { readonly type: 'minimize' }
		interface Maximize extends WindowEvent { readonly type: 'maximize' }
		interface Restore extends WindowEvent { readonly type: 'restore' }
		interface Move extends WindowEvent {
			readonly type: 'move'
			readonly x: number,
			readonly y: number
		}
		interface Resize extends WindowEvent {
			readonly type: 'resize'
			readonly width: number
			readonly height: number
			readonly pixelWidth: number
			readonly pixelHeight: number
		}
		interface Focus extends WindowEvent { readonly type: 'focus' }
		interface Blur extends WindowEvent { readonly type: 'blur' }
		interface Hover extends WindowEvent { readonly type: 'hover' }
		interface Leave extends WindowEvent { readonly type: 'leave' }
		interface BeforeClose extends WindowEvent {
			readonly type: 'beforeClose'
			readonly prevent: PreventCallback
		}
		interface Close extends WindowEvent { readonly type: 'close' }

		interface DropBegin extends WindowEvent { readonly type: 'dropBegin' }
		interface DropText extends WindowEvent {
			readonly type: 'dropText'
			readonly text: string
		}
		interface DropFile extends WindowEvent {
			readonly type: 'dropFile'
			readonly file: string
		}
		interface DropComplete extends WindowEvent { readonly type: 'dropComplete' }

		type Any
			= KeyDown
			| KeyUp
			| TextInput
			| MouseMove
			| MouseButtonDown
			| MouseButtonUp
			| MouseWheel
			| Show
			| Hide
			| Expose
			| Minimize
			| Maximize
			| Restore
			| Move
			| Resize
			| Focus
			| Blur
			| Hover
			| Leave
			| BeforeClose
			| Close
			| DropBegin
			| DropText
			| DropFile
			| DropComplete

	}

	namespace Joystick {

		interface JoystickEvent extends BaseEvent {}

		interface AxisMotion extends JoystickEvent {
			readonly type: 'axisMotion'
			readonly axis: number,
			readonly value: number
		}

		interface BallMotion extends JoystickEvent {
			readonly type: 'ballMotion'
			readonly ball: number,
			readonly x: number
			readonly y: number
		}

		interface ButtonEvent extends JoystickEvent {
			readonly button: number
		}
		interface ButtonDown extends ButtonEvent { readonly type: 'buttonDown' }
		interface ButtonUp extends ButtonEvent { readonly type: 'buttonUp' }

		interface HatMotion extends JoystickEvent {
			readonly type: 'hatMotion'
			readonly hat: number,
			readonly value: Sdl.Joystick.HatPosition
		}

		interface Close extends JoystickEvent { readonly type: 'close' }

		type Any
			= AxisMotion
			| BallMotion
			| ButtonDown
			| ButtonUp
			| HatMotion
			| Close

	}

	namespace JoystickDevice {

		interface DeviceEvent extends BaseEvent {
			readonly device: Sdl.Joystick.Device
		}

		interface Add extends DeviceEvent { readonly type: 'deviceAdd' }
		interface Remove extends DeviceEvent { readonly type: 'deviceRemove' }

		type Any = Add | Remove

	}

	namespace Controller {

		interface ControllerEvent extends BaseEvent {}

		interface AxisMotion extends ControllerEvent {
			readonly type: 'axisMotion'
			readonly axis: number,
			readonly value: number
		}

		interface ButtonEvent extends ControllerEvent {
			readonly button: number
		}
		interface ButtonDown extends ButtonEvent { readonly type: 'buttonDown' }
		interface ButtonUp extends ButtonEvent { readonly type: 'buttonUp' }

		interface Remap extends ControllerEvent { readonly type: 'remap' }

		interface Close extends ControllerEvent { readonly type: 'close' }

		type Any
			= AxisMotion
			| ButtonDown
			| ButtonUp
			| Remap
			| Close

	}

	namespace Sensor {

		interface SensorEvent extends BaseEvent {}

		interface Update extends SensorEvent {
			readonly type: 'update'
		}

		interface Close extends SensorEvent { readonly type: 'close' }

		type Any
			= Update
			| Close

	}

	namespace ControllerDevice {

		interface DeviceEvent extends BaseEvent {
			readonly device: Sdl.Controller.Device
		}

		interface Add extends DeviceEvent { readonly type: 'deviceAdd' }
		interface Remove extends DeviceEvent { readonly type: 'deviceRemove' }

		type Any = Add | Remove

	}

	namespace Audio {

		interface AudioEvent extends BaseEvent {}

		interface Close extends AudioEvent { readonly type: 'close' }

		type Any = Close

	}

	namespace AudioDevice {

		interface DeviceEvent extends BaseEvent {
			readonly device: Sdl.Audio.Device
		}

		interface Add extends DeviceEvent { readonly type: 'deviceAdd' }
		interface Remove extends DeviceEvent { readonly type: 'deviceRemove' }

		type Any = Add | Remove

	}

	namespace Clipboard {

		interface Update extends BaseEvent { readonly type: 'update' }

		type Any = Update

	}
}


export namespace Sdl {

	interface Info {
		readonly version: {
			readonly compile: {
				readonly major: number
				readonly minor: number
				readonly patch: number
			}
			readonly runtime: {
				readonly major: number
				readonly minor: number
				readonly patch: number
			}
		}
		readonly platform: 'Linux' | 'Windows' | 'Mac OS X'
		readonly drivers: {
			readonly video: {
				readonly all: string[]
				readonly current: string
			}
			readonly audio: {
				readonly all: string[]
				readonly current: string
			}
		}
	}

	namespace Video {

		type Format
			= 'rgb332'
			| 'rgb444'
			| 'rgb555'
			| 'bgr555'
			| 'argb4444'
			| 'rgba4444'
			| 'abgr4444'
			| 'bgra4444'
			| 'argb1555'
			| 'rgba5551'
			| 'abgr1555'
			| 'bgra5551'
			| 'rgb565'
			| 'bgr565'
			| 'rgb24'
			| 'bgr24'
			| 'rgb888'
			| 'rgbx8888'
			| 'bgr888'
			| 'bgrx8888'
			| 'argb8888'
			| 'rgba8888'
			| 'abgr8888'
			| 'bgra8888'
			| 'argb2101010'
			| 'rgba32'
			| 'argb32'
			| 'bgra32'
			| 'abgr32'
			| 'yv12'
			| 'iyuv'
			| 'yuy2'
			| 'uyvy'
			| 'yvyu'
			| 'nv12'
			| 'nv21'

		interface Display {
			readonly name: string
			readonly format: Format
			readonly frequency: number
			readonly geometry: {
				readonly x: number
				readonly y: number
				readonly width: number
				readonly height: number
			}
			readonly usable: {
				readonly x: number
				readonly y: number
				readonly width: number
				readonly height: number
			}
			readonly dpi: {
				readonly horizontal: number
				readonly vertical: number
				readonly diagonal: number
			}
		}

		class Window {
			on (event: 'show', listener: (event: Events.Window.Show) => void): this
			on (event: 'hide', listener: (event: Events.Window.Hide) => void): this
			on (event: 'expose', listener: (event: Events.Window.Expose) => void): this
			on (event: 'minimize', listener: (event: Events.Window.Minimize) => void): this
			on (event: 'maximize', listener: (event: Events.Window.Maximize) => void): this
			on (event: 'restore', listener: (event: Events.Window.Restore) => void): this
			on (event: 'move', listener: (event: Events.Window.Move) => void): this
			on (event: 'resize', listener: (event: Events.Window.Resize) => void): this
			on (event: 'focus', listener: (event: Events.Window.Focus) => void): this
			on (event: 'blur', listener: (event: Events.Window.Blur) => void): this
			on (event: 'hover', listener: (event: Events.Window.Hover) => void): this
			on (event: 'leave', listener: (event: Events.Window.Leave) => void): this
			on (event: 'beforeClose', listener: (event: Events.Window.BeforeClose) => void): this
			on (event: 'close', listener: (event: Events.Window.Close) => void): this
			on (event: 'keyDown', listener: (event: Events.Window.KeyDown) => void): this
			on (event: 'keyUp', listener: (event: Events.Window.KeyUp) => void): this
			on (event: 'textInput', listener: (event: Events.Window.TextInput) => void): this
			on (event: 'mouseButtonDown', listener: (event: Events.Window.MouseButtonDown) => void): this
			on (event: 'mouseButtonUp', listener: (event: Events.Window.MouseButtonUp) => void): this
			on (event: 'mouseMove', listener: (event: Events.Window.MouseMove) => void): this
			on (event: 'mouseWheel', listener: (event: Events.Window.MouseWheel) => void): this
			on (event: 'dropBegin', listener: (event: Events.Window.DropBegin) => void): this
			on (event: 'dropText', listener: (event: Events.Window.DropText) => void): this
			on (event: 'dropFile', listener: (event: Events.Window.DropFile) => void): this
			on (event: 'dropComplete', listener: (event: Events.Window.DropComplete) => void): this
			on (event: '*', listener: (event: Events.Window.Any) => void): this

			readonly id: number

			readonly title: string
			setTitle (title: string): void

			readonly x: number
			readonly y: number
			setPosition (x: number, y: number): void

			readonly width: number
			readonly height: number
			setSize (width: number, height: number): void

			readonly pixelWidth: number
			readonly pixelHeight: number

			readonly visible: boolean
			show (show?: boolean): void
			hide (): void

			readonly fullscreen: boolean
			setFullscreen (fullscreen: boolean): void

			readonly resizable: boolean
			setResizable (resizable: boolean): void

			readonly borderless: boolean
			setBorderless (borderless: boolean): void

			readonly alwaysOnTop: boolean

			readonly accelerated: boolean
			setAccelerated (accelerated: boolean): void

			readonly vsync: boolean
			setVsync (vsync: boolean): void

			readonly opengl: boolean
			readonly webgpu: boolean
			readonly native: unknown

			readonly maximized: boolean
			maximize (): void

			readonly minimized: boolean
			minimize (): void

			restore (): void

			readonly focused: boolean
			focus (): void

			readonly hovered: boolean

			readonly skipTaskbar: boolean
			readonly popupMenu: boolean
			readonly tooltip: boolean
			readonly utility: boolean

			render (width: number, height: number, stride: number, format: Format, buffer: Buffer): void

			setIcon (width: number, height: number, stride: number, format: Format, buffer: Buffer): void

			flash (untilFocused: boolean): void
			stopFlashing (): void

			readonly destroyed: boolean
			destroy (): void
		}

		interface Module {
			on (event: 'displayAdd', listener: (event: Events.Display.Add) => void): this
			on (event: 'displayRemove', listener: (event: Events.Display.Remove) => void): this
			on (event: 'displayOrient', listener: (event: Events.Display.Orient) => void): this
			on (event: '*', listener: (event: Events.Display.Any) => void): this

			readonly displays: Display[]

			readonly windows: Window[]
			readonly focused: Window
			readonly hovered: Window

			createWindow (options?: {
				title?: string
				display?: Display
				x?: number
				y?: number
				width?: number
				height?: number
				visible?: boolean
				fullscreen?: boolean
				resizable?: boolean
				borderless?: boolean
				alwaysOnTop?: boolean
				accelerated?: boolean
				vsync?: boolean
				opengl?: boolean
				webgpu?: boolean
				skipTaskbar?: boolean
				popupMenu?: boolean
				tooltip?: boolean
				utility?: boolean
			}): Window
		}
	}

	namespace Keyboard {

		type Scancode = number

		type ScancodeNames
			= 'A'
			| 'B'
			| 'C'
			| 'D'
			| 'E'
			| 'F'
			| 'G'
			| 'H'
			| 'I'
			| 'J'
			| 'K'
			| 'L'
			| 'M'
			| 'N'
			| 'O'
			| 'P'
			| 'Q'
			| 'R'
			| 'S'
			| 'T'
			| 'U'
			| 'V'
			| 'W'
			| 'X'
			| 'Y'
			| 'Z'
			| '1'
			| '2'
			| '3'
			| '4'
			| '5'
			| '6'
			| '7'
			| '8'
			| '9'
			| '0'
			| 'RETURN'
			| 'ESCAPE'
			| 'BACKSPACE'
			| 'TAB'
			| 'SPACE'
			| 'MINUS'
			| 'EQUALS'
			| 'LEFTBRACKET'
			| 'RIGHTBRACKET'
			| 'BACKSLASH'
			| 'NONUSHASH'
			| 'SEMICOLON'
			| 'APOSTROPHE'
			| 'GRAVE'
			| 'COMMA'
			| 'PERIOD'
			| 'SLASH'
			| 'CAPSLOCK'
			| 'F1'
			| 'F2'
			| 'F3'
			| 'F4'
			| 'F5'
			| 'F6'
			| 'F7'
			| 'F8'
			| 'F9'
			| 'F10'
			| 'F11'
			| 'F12'
			| 'PRINTSCREEN'
			| 'SCROLLLOCK'
			| 'PAUSE'
			| 'INSERT'
			| 'HOME'
			| 'PAGEUP'
			| 'DELETE'
			| 'END'
			| 'PAGEDOWN'
			| 'RIGHT'
			| 'LEFT'
			| 'DOWN'
			| 'UP'
			| 'NUMLOCKCLEAR'
			| 'KP_DIVIDE'
			| 'KP_MULTIPLY'
			| 'KP_MINUS'
			| 'KP_PLUS'
			| 'KP_ENTER'
			| 'KP_1'
			| 'KP_2'
			| 'KP_3'
			| 'KP_4'
			| 'KP_5'
			| 'KP_6'
			| 'KP_7'
			| 'KP_8'
			| 'KP_9'
			| 'KP_0'
			| 'KP_PERIOD'
			| 'NONUSBACKSLASH'
			| 'APPLICATION'
			| 'POWER'
			| 'KP_EQUALS'
			| 'F13'
			| 'F14'
			| 'F15'
			| 'F16'
			| 'F17'
			| 'F18'
			| 'F19'
			| 'F20'
			| 'F21'
			| 'F22'
			| 'F23'
			| 'F24'
			| 'EXECUTE'
			| 'HELP'
			| 'MENU'
			| 'SELECT'
			| 'STOP'
			| 'AGAIN'
			| 'UNDO'
			| 'CUT'
			| 'COPY'
			| 'PASTE'
			| 'FIND'
			| 'MUTE'
			| 'VOLUMEUP'
			| 'VOLUMEDOWN'
			| 'KP_COMMA'
			| 'KP_EQUALSAS400'
			| 'INTERNATIONAL1'
			| 'INTERNATIONAL2'
			| 'INTERNATIONAL3'
			| 'INTERNATIONAL4'
			| 'INTERNATIONAL5'
			| 'INTERNATIONAL6'
			| 'INTERNATIONAL7'
			| 'INTERNATIONAL8'
			| 'INTERNATIONAL9'
			| 'LANG1'
			| 'LANG2'
			| 'LANG3'
			| 'LANG4'
			| 'LANG5'
			| 'LANG6'
			| 'LANG7'
			| 'LANG8'
			| 'LANG9'
			| 'ALTERASE'
			| 'SYSREQ'
			| 'CANCEL'
			| 'CLEAR'
			| 'PRIOR'
			| 'RETURN2'
			| 'SEPARATOR'
			| 'OUT'
			| 'OPER'
			| 'CLEARAGAIN'
			| 'CRSEL'
			| 'EXSEL'
			| 'KP_00'
			| 'KP_000'
			| 'THOUSANDSSEPARATOR'
			| 'DECIMALSEPARATOR'
			| 'CURRENCYUNIT'
			| 'CURRENCYSUBUNIT'
			| 'KP_LEFTPAREN'
			| 'KP_RIGHTPAREN'
			| 'KP_LEFTBRACE'
			| 'KP_RIGHTBRACE'
			| 'KP_TAB'
			| 'KP_BACKSPACE'
			| 'KP_A'
			| 'KP_B'
			| 'KP_C'
			| 'KP_D'
			| 'KP_E'
			| 'KP_F'
			| 'KP_XOR'
			| 'KP_POWER'
			| 'KP_PERCENT'
			| 'KP_LESS'
			| 'KP_GREATER'
			| 'KP_AMPERSAND'
			| 'KP_DBLAMPERSAND'
			| 'KP_VERTICALBAR'
			| 'KP_DBLVERTICALBAR'
			| 'KP_COLON'
			| 'KP_HASH'
			| 'KP_SPACE'
			| 'KP_AT'
			| 'KP_EXCLAM'
			| 'KP_MEMSTORE'
			| 'KP_MEMRECALL'
			| 'KP_MEMCLEAR'
			| 'KP_MEMADD'
			| 'KP_MEMSUBTRACT'
			| 'KP_MEMMULTIPLY'
			| 'KP_MEMDIVIDE'
			| 'KP_PLUSMINUS'
			| 'KP_CLEAR'
			| 'KP_CLEARENTRY'
			| 'KP_BINARY'
			| 'KP_OCTAL'
			| 'KP_DECIMAL'
			| 'KP_HEXADECIMAL'
			| 'LCTRL'
			| 'LSHIFT'
			| 'LALT'
			| 'LGUI'
			| 'RCTRL'
			| 'RSHIFT'
			| 'RALT'
			| 'RGUI'
			| 'MODE'
			| 'AUDIONEXT'
			| 'AUDIOPREV'
			| 'AUDIOSTOP'
			| 'AUDIOPLAY'
			| 'AUDIOMUTE'
			| 'MEDIASELECT'
			| 'WWW'
			| 'MAIL'
			| 'CALCULATOR'
			| 'COMPUTER'
			| 'AC_SEARCH'
			| 'AC_HOME'
			| 'AC_BACK'
			| 'AC_FORWARD'
			| 'AC_STOP'
			| 'AC_REFRESH'
			| 'AC_BOOKMARKS'
			| 'BRIGHTNESSDOWN'
			| 'BRIGHTNESSUP'
			| 'DISPLAYSWITCH'
			| 'KBDILLUMTOGGLE'
			| 'KBDILLUMDOWN'
			| 'KBDILLUMUP'
			| 'EJECT'
			| 'SLEEP'
			| 'APP1'
			| 'APP2'
			| 'AUDIOREWIND'
			| 'AUDIOFASTFORWARD'

		type Key = string

		interface Module {
			readonly SCANCODE: { [name in ScancodeNames]: Scancode }

			getKey (scancode: Scancode): Key
			getScancode (key: Key): Scancode

			getState (): boolean[]
		}

	}

	namespace Mouse {

		type Button = number

		type ButtonNames
			= 'LEFT'
			| 'MIDDLE'
			| 'RIGHT'

		type Cursor
			= 'arrow'
			| 'ibeam'
			| 'wait'
			| 'crosshair'
			| 'waitarrow'
			| 'sizenwse'
			| 'sizenesw'
			| 'sizewe'
			| 'sizens'
			| 'sizeall'
			| 'no'
			| 'hand'

		interface Module {
			readonly BUTTON: { [name in ButtonNames]: number }

			getButton (button: number): boolean

			readonly position: {
				x: number
				y: number
			}
			setPosition (x: number, y: number): void

			setCursor (cursor: Cursor): void
			setCursorImage (width: number, height: number, stride: number, format: Sdl.Video.Format, buffer: Buffer): void

			showCursor (show?: boolean): void
			hideCursor (): void

			capture (): void
			uncapture (): void
		}

	}

	namespace Joystick {

		interface BallPosition {
			x: number
			y: number
		}

		type HatPosition
			= 'centered'
			| 'up'
			| 'right'
			| 'down'
			| 'left'
			| 'rightup'
			| 'rightdown'
			| 'leftup'
			| 'leftdown'

		type PowerLevel
			= 'unknown'
			| 'empty'
			| 'low'
			| 'medium'
			| 'full'
			| 'wired'
			| 'max'

		interface Device {
			readonly id: number
			readonly type: string
			readonly name: string
			readonly path: string
			readonly guid: string
			readonly vendor: number
			readonly product: number
			readonly version: number
			readonly player: number
		}

		class JoystickInstance {
			on (event: 'axisMotion', listener: (event: Events.Joystick.AxisMotion) => void): this
			on (event: 'ballMotion', listener: (event: Events.Joystick.BallMotion) => void): this
			on (event: 'buttonDown', listener: (event: Events.Joystick.ButtonDown) => void): this
			on (event: 'buttonUp', listener: (event: Events.Joystick.ButtonUp) => void): this
			on (event: 'hatMotion', listener: (event: Events.Joystick.HatMotion) => void): this
			on (event: 'close', listener: (event: Events.Joystick.Close) => void): this
			on (event: '*', listener: (event: Events.Joystick.Any) => void): this

			readonly device: Device
			readonly firmwareVersion: number
			readonly serialNumber: string

			readonly axes: number[]
			readonly balls: BallPosition[]
			readonly hats: HatPosition[]
			readonly buttons: boolean[]

			readonly power: PowerLevel

			setPlayer (index: number): void

			readonly hasLed: boolean
			setLed (red: number, green: number, blue: number): void

			readonly hasRumble: boolean
			rumble (lowFreqRumble: number, highFreqRumble: number, duration: number): void
			stopRumble (): void

			readonly hasRumbleTriggers: boolean
			rumbleTriggers (leftRumble: number, rightRumble: number, duration: number): void
			stopRumbleTriggers (): void

			readonly closed: boolean
			close (): void
		}

		interface Module {
			on (event: 'deviceAdd', listener: (event: Events.JoystickDevice.Add) => void): this
			on (event: 'deviceRemove', listener: (event: Events.JoystickDevice.Remove) => void): this
			on (event: '*', listener: (event: Events.JoystickDevice.Any) => void): this

			readonly devices: Device[]

			openDevice (device: Device): JoystickInstance
		}

	}

	namespace Controller {

		interface Device {
			readonly id: number
			readonly name: string
			readonly path: string
			readonly guid: string
			readonly vendor: number
			readonly product: number
			readonly version: number
			readonly player: number
			readonly mapping: string
		}

		class ControllerInstance {
			on (event: 'axisMotion', listener: (event: Events.Controller.AxisMotion) => void): this
			on (event: 'buttonDown', listener: (event: Events.Controller.ButtonDown) => void): this
			on (event: 'buttonUp', listener: (event: Events.Controller.ButtonUp) => void): this
			on (event: 'remap', listener: (event: Events.Controller.Remap) => void): this
			on (event: 'close', listener: (event: Events.Controller.Close) => void): this
			on (event: '*', listener: (event: Events.Controller.Any) => void): this

			readonly device: Device
			readonly firmwareVersion: number
			readonly serialNumber: string

			readonly axes: {
				readonly leftStickX: number,
				readonly leftStickY: number,
				readonly rightStickX: number,
				readonly rightStickY: number,
				readonly leftTrigger: number,
				readonly rightTrigger: number,
			}

			readonly buttons: {
				readonly dpadLeft: boolean,
				readonly dpadRight: boolean,
				readonly dpadUp: boolean,
				readonly dpadDown: boolean,
				readonly a: boolean,
				readonly b: boolean,
				readonly x: boolean,
				readonly y: boolean,
				readonly guide: boolean,
				readonly back: boolean,
				readonly start: boolean,
				readonly leftStick: boolean,
				readonly rightStick: boolean,
				readonly leftShoulder: boolean,
				readonly rightShoulder: boolean,
				readonly paddle1: boolean,
				readonly paddle2: boolean,
				readonly paddle3: boolean,
				readonly paddle4: boolean,
			}

			readonly power: Joystick.PowerLevel

			setPlayer (index: number): void

			readonly hasLed: boolean
			setLed (red: number, green: number, blue: number): void

			readonly hasRumble: boolean
			rumble (lowFreqRumble: number, highFreqRumble: number, duration: number): void
			stopRumble (): void

			readonly hasRumbleTriggers: boolean
			rumbleTriggers (leftRumble: number, rightRumble: number, duration: number): void
			stopRumbleTriggers (): void

			readonly closed: boolean
			close (): void
		}

		interface Module {
			on (event: 'deviceAdd', listener: (event: Events.ControllerDevice.Add) => void): this
			on (event: 'deviceRemove', listener: (event: Events.ControllerDevice.Remove) => void): this
			on (event: '*', listener: (event: Events.ControllerDevice.Any) => void): this

			addMappings (mappings: string[]): void

			readonly devices: Device[]

			openDevice (device: Device): ControllerInstance
		}

	}

	namespace Sensor {

		type Type
			= 'unknown'
			| 'accelerometer'
			| 'gyroscope'

		type Side
			= 'left'
			| 'right'

		interface Device {
			readonly id: number
			readonly name: string
			readonly type: Type
			readonly side: Side | null
		}

		interface Data {
			timestamp: number | null,
			x: number,
			y: number,
			z: number,
		}

		class SensorInstance {
			on (event: 'update', listener: (event: Events.Sensor.Update) => void): this
			on (event: 'close', listener: (event: Events.Sensor.Close) => void): this
			on (event: '*', listener: (event: Events.Sensor.Any) => void): this

			readonly device: Device

			readonly data: Data

			readonly closed: boolean
			close (): void
		}

		interface Module {
			STANDARD_GRAVITY: 9.80665,

			readonly devices: Device[]

			openDevice (device: Device): SensorInstance
		}

	}

	namespace Audio {

		type Format
			= 's8'
			| 'u8'
			| 's16lsb'
			| 's16msb'
			| 's16sys'
			| 's16'
			| 'u16lsb'
			| 'u16msb'
			| 'u16sys'
			| 'u16'
			| 's32lsb'
			| 's32msb'
			| 's32sys'
			| 's32'
			| 'f32lsb'
			| 'f32msb'
			| 'f32sys'
			| 'f32'

		interface Device {
			readonly type: "recording"|"playback"
			readonly name?: string
		}

		interface PlaybackDevice extends Device {
			readonly type: "playback"
		}

		interface RecordingDevice extends Device {
			readonly type: "recording"
		}

		class AudioInstance {
			on (event: 'close', listener: (event: Events.Audio.Close) => void): this
			on (event: '*', listener: (event: Events.Audio.Any) => void): this

			readonly id: number
			readonly device: Device

			readonly channels: number
			readonly frequency: number
			readonly format: Format
			readonly buffered: number

			readonly playing: boolean
			play (play?: boolean): void
			pause (): void

			readonly queued: number
			clearQueue (): void

			readonly bytesPerSample: number
			readonly minSampleValue: number
			readonly maxSampleValue: number
			readonly zeroSampleValue: number
			readSample (buffer: Buffer, offset?: number): number
			writeSample (buffer: Buffer, value: number, offset?: number): number

			readonly closed: boolean
			close (): void
		}

		class AudioPlaybackInstance extends AudioInstance {
			enqueue (buffer: Buffer, bytes?: number): void
		}

		class AudioRecordingInstance extends AudioInstance {
			dequeue (buffer: Buffer, bytes?: number): number
		}

		interface AudioOptions {
			channels?: 1 | 2 | 4 | 6
			frequency?: number
			format?: Format
			buffered?: number
		}

		interface Module {
			on (event: 'deviceAdd', listener: (event: Events.AudioDevice.Add) => void): this
			on (event: 'deviceRemove', listener: (event: Events.AudioDevice.Remove) => void): this
			on (event: '*', listener: (event: Events.AudioDevice.Any) => void): this

			readonly devices: Device[]

			openDevice (device: PlaybackDevice, options?: AudioOptions): AudioPlaybackInstance
			openDevice (device: RecordingDevice, options?: AudioOptions): AudioRecordingInstance

			bytesPerSample (format: Format): number
			minSampleValue (format: Format): number
			maxSampleValue (format: Format): number
			zeroSampleValue (format: Format): number
			readSample (format: Format, buffer: Buffer, offset?: number): number
			writeSample (format: Format, buffer: Buffer, value: number, offset?: number): number
		}
	}

	namespace Clipboard {

		interface Module {
			on (event: 'update', listener: (event: Events.Clipboard.Update) => void): this
			on (event: '*', listener: (event: Events.Clipboard.Any) => void): this

			readonly text: string
			setText (text: string): void
		}

	}

	namespace Power {

		type PowerState
			= 'unknown'
			| 'noBattery'
			| 'battery'
			| 'charging'
			| 'charged'

		interface PowerInfo {
			state: PowerState
			seconds: number | null
			percent: number | null
		}

		interface Module {
			readonly info: PowerInfo
		}

	}
}

export const info: Sdl.Info
export const video: Sdl.Video.Module
export const keyboard: Sdl.Keyboard.Module
export const mouse: Sdl.Mouse.Module
export const joystick: Sdl.Joystick.Module
export const controller: Sdl.Controller.Module
export const sensor: Sdl.Sensor.Module
export const audio: Sdl.Audio.Module
export const clipboard: Sdl.Clipboard.Module
export const power: Sdl.Power.Module
