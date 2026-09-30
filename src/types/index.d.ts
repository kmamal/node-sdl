import { EventEmitter } from 'node:events'

export namespace Events {

	interface BaseEvent { readonly type: string }

	export type PreventCallback = () => void

	export namespace Display {

		interface DisplayEvent extends BaseEvent {
			readonly device: Sdl.Video.Display
		}

		export interface Add extends DisplayEvent {
			readonly type: 'displayAdd'
		}
		export interface Remove extends DisplayEvent {
			readonly type: 'displayRemove'
		}
		export interface Orient extends DisplayEvent {
			readonly type: 'displayOrient'
			readonly orientation: Sdl.Video.Orientation | null
		}
		export interface Move extends DisplayEvent {
			readonly type: 'displayMove'
		}
		export interface Scale extends DisplayEvent {
			readonly type: 'displayScaleChange'
			readonly scale: number | null
		}
		export interface Mode extends DisplayEvent {
			readonly type: 'displayModeChange'
			readonly format: Sdl.Video.Format | null
			readonly frequency: number | null
			readonly geometry: Sdl.Video.Display['geometry']
		}
		export interface Usable extends DisplayEvent {
			readonly type: 'displayUsableChange'
		}

		export type Any = Add | Remove | Orient | Move | Scale | Mode | Usable

	}

	export namespace Window {

		interface WindowEvent extends BaseEvent {}

		interface KeyEvent extends WindowEvent {
			readonly scancode: Sdl.Keyboard.Scancode
			readonly key: Sdl.Keyboard.Key | null
			readonly shift: boolean
			readonly ctrl: boolean
			readonly alt: boolean
			readonly super: boolean
			readonly altgr: boolean
			readonly capslock: boolean
			readonly numlock: boolean
		}

		export interface KeyDown extends KeyEvent {
			readonly type: 'keyDown'
			readonly repeat: boolean
		}
		export interface KeyUp extends KeyEvent { readonly type: 'keyUp' }

		export interface TextInput extends WindowEvent {
			readonly type: 'textInput'
			readonly text: string
		}

		interface MouseEvent extends WindowEvent {
			readonly x: number
			readonly y: number
			readonly touch: boolean
		}

		export interface MouseMove extends MouseEvent {
			readonly type: 'mouseMove'
			readonly dx: number
			readonly dy: number
		}

		interface MouseButtonEvent extends MouseEvent {
			readonly button: number
		}

		export interface MouseButtonDown extends MouseButtonEvent { readonly type: 'mouseButtonDown' }
		export interface MouseButtonUp extends MouseButtonEvent { readonly type: 'mouseButtonUp' }

		export interface MouseWheel extends MouseEvent {
			readonly type: 'mouseWheel'
			readonly dx: number
			readonly dy: number
			readonly flipped: boolean
		}

		interface FingerEvent extends WindowEvent {
			readonly device: Sdl.Touch.Device | null
			readonly fingerId: bigint
			readonly mouse: boolean
			readonly x: number
			readonly y: number
			readonly pressure: number
		}

		export interface FingerDown extends FingerEvent { readonly type: 'fingerDown' }
		export interface FingerUp extends FingerEvent { readonly type: 'fingerUp' }
		export interface FingerCancel extends FingerEvent { readonly type: 'fingerCancel' }

		export interface FingerMove extends FingerEvent {
			readonly type: 'fingerMove'
			readonly dx: number
			readonly dy: number
		}

		export interface Show extends WindowEvent { readonly type: 'show' }
		export interface Hide extends WindowEvent { readonly type: 'hide' }
		export interface Expose extends WindowEvent { readonly type: 'expose' }
		export interface Minimize extends WindowEvent { readonly type: 'minimize' }
		export interface Maximize extends WindowEvent { readonly type: 'maximize' }
		export interface Restore extends WindowEvent { readonly type: 'restore' }
		export interface Move extends WindowEvent {
			readonly type: 'move'
			readonly x: number,
			readonly y: number
		}
		export interface Resize extends WindowEvent {
			readonly type: 'resize'
			readonly width: number
			readonly height: number
			readonly pixelWidth: number
			readonly pixelHeight: number
		}
		export interface DisplayChange extends WindowEvent {
			readonly type: 'displayChange'
			readonly display: Sdl.Video.Display | null
		}
		export interface Focus extends WindowEvent { readonly type: 'focus' }
		export interface Blur extends WindowEvent { readonly type: 'blur' }
		export interface Hover extends WindowEvent { readonly type: 'hover' }
		export interface Leave extends WindowEvent { readonly type: 'leave' }
		export interface BeforeClose extends WindowEvent {
			readonly type: 'beforeClose'
			readonly prevent: PreventCallback
		}
		export interface Close extends WindowEvent { readonly type: 'close' }

		export interface DropBegin extends WindowEvent { readonly type: 'dropBegin' }
		export interface DropText extends WindowEvent {
			readonly type: 'dropText'
			readonly text: string
		}
		export interface DropFile extends WindowEvent {
			readonly type: 'dropFile'
			readonly file: string
		}
		export interface DropComplete extends WindowEvent { readonly type: 'dropComplete' }

		export type Any
			= KeyDown
			| KeyUp
			| TextInput
			| MouseMove
			| MouseButtonDown
			| MouseButtonUp
			| MouseWheel
			| FingerDown
			| FingerUp
			| FingerMove
			| FingerCancel
			| Show
			| Hide
			| Expose
			| Minimize
			| Maximize
			| Restore
			| Move
			| Resize
			| DisplayChange
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

	export namespace Keyboard {

		interface KeyboardEvent extends BaseEvent {}

		export interface KeymapChange extends KeyboardEvent { readonly type: 'keymapChange' }

		export type Any
			= KeymapChange

	}

	export namespace Joystick {

		interface JoystickEvent extends BaseEvent {}

		export interface AxisMotion extends JoystickEvent {
			readonly type: 'axisMotion'
			readonly axis: number
			readonly value: number
		}

		export interface BallMotion extends JoystickEvent {
			readonly type: 'ballMotion'
			readonly ball: number
			readonly x: number
			readonly y: number
			readonly dx: number
			readonly dy: number
		}

		interface ButtonEvent extends JoystickEvent {
			readonly button: number
		}

		export interface ButtonDown extends ButtonEvent { readonly type: 'buttonDown' }
		export interface ButtonUp extends ButtonEvent { readonly type: 'buttonUp' }

		export interface HatMotion extends JoystickEvent {
			readonly type: 'hatMotion'
			readonly hat: number
			readonly value: Sdl.Joystick.HatPosition
		}

		export interface PowerUpdate extends JoystickEvent {
			readonly type: 'powerUpdate'
			readonly power: Sdl.Joystick.PowerInfo
		}

		export interface Close extends JoystickEvent { readonly type: 'close' }

		export type Any
			= AxisMotion
			| BallMotion
			| ButtonDown
			| ButtonUp
			| HatMotion
			| PowerUpdate
			| Close

	}

	export namespace JoystickDevice {

		interface DeviceEvent extends BaseEvent {
			readonly device: Sdl.Joystick.Device
		}

		export interface Add extends DeviceEvent { readonly type: 'deviceAdd' }
		export interface Remove extends DeviceEvent { readonly type: 'deviceRemove' }

		export type Any
			= Add
			| Remove

	}

	export namespace Gamepad {

		interface GamepadEvent extends BaseEvent {}

		export interface AxisMotion extends GamepadEvent {
			readonly type: 'axisMotion'
			readonly axis: Sdl.Gamepad.Axis
			readonly value: number
		}

		interface ButtonEvent extends GamepadEvent {
			readonly button: Sdl.Gamepad.Button
		}

		export interface ButtonDown extends ButtonEvent { readonly type: 'buttonDown' }
		export interface ButtonUp extends ButtonEvent { readonly type: 'buttonUp' }

		export interface PowerUpdate extends GamepadEvent {
			readonly type: 'powerUpdate'
			readonly power: Sdl.Joystick.PowerInfo
		}

		export interface SteamHandleUpdate extends GamepadEvent {
			readonly type: 'steamHandleUpdate'
			readonly steamHandle: Buffer | null
		}

		export interface Remap extends GamepadEvent { readonly type: 'remap' }

		export interface Close extends GamepadEvent { readonly type: 'close' }

		export type Any
			= AxisMotion
			| ButtonDown
			| ButtonUp
			| PowerUpdate
			| SteamHandleUpdate
			| Remap
			| Close

	}

	export namespace Sensor {

		interface SensorEvent extends BaseEvent {}

		export interface Update extends SensorEvent {
			readonly type: 'update'
		}

		export interface Close extends SensorEvent { readonly type: 'close' }

		export type Any
			= Update
			| Close

	}

	export namespace GamepadDevice {

		interface DeviceEvent extends BaseEvent {
			readonly device: Sdl.Gamepad.Device
		}

		export interface Add extends DeviceEvent { readonly type: 'deviceAdd' }
		export interface Remove extends DeviceEvent { readonly type: 'deviceRemove' }

		export type Any
			= Add
			| Remove

	}

	export namespace Audio {

		interface AudioEvent extends BaseEvent {}

		export interface Close extends AudioEvent { readonly type: 'close' }

		export type Any
			= Close

	}

	export namespace AudioDevice {

		interface DeviceEvent extends BaseEvent {
			readonly device: Sdl.Audio.Device
		}

		export interface Add extends DeviceEvent { readonly type: 'deviceAdd' }
		export interface Remove extends DeviceEvent { readonly type: 'deviceRemove' }

		export type Any
			= Add
			| Remove

	}

	export namespace Clipboard {

		export interface Update extends BaseEvent { readonly type: 'update' }

		export type Any
			= Update

	}

}

export namespace Sdl {

	export interface Info {
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
		readonly platform:
			| 'AIX'
			| 'Android'
			| 'Atari MiNT'
			| 'BSDI'
			| 'Emscripten'
			| 'FreeBSD'
			| 'GNU/Hurd'
			| 'HP-UX'
			| 'Haiku'
			| 'Irix'
			| 'Linux'
			| 'Managarm'
			| 'NetBSD'
			| 'Nintendo 3DS'
			| 'Nokia N-Gage'
			| 'OS/2'
			| 'OSF/1'
			| 'OpenBSD'
			| 'PlayStation 2'
			| 'PlayStation Portable'
			| 'PlayStation Vita'
			| 'QNX Neutrino'
			| 'RISC OS'
			| 'Solaris'
			| 'WinGDK'
			| 'Windows'
			| 'Xbox One'
			| 'Xbox Series X|S'
			| 'iOS'
			| 'macOS'
			| 'tvOS'
			| 'visionOS'
			| null
		readonly drivers: {
			readonly video: {
				readonly all: string[]
				readonly current: string | null
			}
			readonly audio: {
				readonly all: string[]
				readonly current: string | null
			}
		}
		readonly initialized: {
			readonly video: boolean
			readonly audio: boolean
			readonly joystick: boolean
			readonly gamepad: boolean
			readonly haptic: boolean
			readonly sensor: boolean
		}
	}

	export namespace Video {

		export type Orientation
			= 'portrait'
			| 'portraitFlipped'
			| 'landscape'
			| 'landscapeFlipped'

		export type Format
			= 'rgb332'
			| 'xrgb4444'
			| 'xbgr4444'
			| 'xrgb1555'
			| 'xbgr1555'
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
			| 'xrgb8888'
			| 'rgbx8888'
			| 'xbgr8888'
			| 'bgrx8888'
			| 'argb8888'
			| 'rgba8888'
			| 'abgr8888'
			| 'bgra8888'
			| 'argb2101010'
			| 'xrgb2101010'
			| 'xbgr2101010'
			| 'abgr2101010'
			| 'rgb48'
			| 'bgr48'
			| 'rgba64'
			| 'argb64'
			| 'bgra64'
			| 'abgr64'
			| 'rgb48f'
			| 'bgr48f'
			| 'rgba64f'
			| 'argb64f'
			| 'bgra64f'
			| 'abgr64f'
			| 'rgb96f'
			| 'bgr96f'
			| 'rgba128f'
			| 'argb128f'
			| 'bgra128f'
			| 'abgr128f'
			| 'rgba32'
			| 'argb32'
			| 'bgra32'
			| 'abgr32'
			| 'rgbx32'
			| 'xrgb32'
			| 'bgrx32'
			| 'xbgr32'
			| 'yv12'
			| 'iyuv'
			| 'yuy2'
			| 'uyvy'
			| 'yvyu'
			| 'nv12'
			| 'nv21'
			| 'p010'

		export type Scaling
			= 'nearest'
			| 'linear'

		export interface Display {
			readonly id: number
			readonly name: string | null
			readonly format: Format | null
			readonly frequency: number | null
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
			readonly scale: number | null
			readonly orientation: Orientation | null
		}

		export class Window extends EventEmitter {
			on (event: 'show', listener: (event: Events.Window.Show) => void): this
			on (event: 'hide', listener: (event: Events.Window.Hide) => void): this
			on (event: 'expose', listener: (event: Events.Window.Expose) => void): this
			on (event: 'minimize', listener: (event: Events.Window.Minimize) => void): this
			on (event: 'maximize', listener: (event: Events.Window.Maximize) => void): this
			on (event: 'restore', listener: (event: Events.Window.Restore) => void): this
			on (event: 'move', listener: (event: Events.Window.Move) => void): this
			on (event: 'resize', listener: (event: Events.Window.Resize) => void): this
			on (event: 'displayChange', listener: (event: Events.Window.DisplayChange) => void): this
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
			on (event: 'fingerDown', listener: (event: Events.Window.FingerDown) => void): this
			on (event: 'fingerUp', listener: (event: Events.Window.FingerUp) => void): this
			on (event: 'fingerMove', listener: (event: Events.Window.FingerMove) => void): this
			on (event: 'fingerCancel', listener: (event: Events.Window.FingerCancel) => void): this
			on (event: 'dropBegin', listener: (event: Events.Window.DropBegin) => void): this
			on (event: 'dropText', listener: (event: Events.Window.DropText) => void): this
			on (event: 'dropFile', listener: (event: Events.Window.DropFile) => void): this
			on (event: 'dropComplete', listener: (event: Events.Window.DropComplete) => void): this
			on (event: '*', listener: (type: string, event: Events.Window.Any) => void): this
			on (event: 'error', listener: (error: Error) => void): this

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
			setSizeInPixels (pixelWidth: number, pixelHeight: number): void

			readonly display: Display | null

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

			readonly accelerated: boolean | null
			setAccelerated (accelerated: boolean): void

			readonly vsync: boolean | null
			setVsync (vsync: boolean): void

			readonly opengl: boolean
			readonly webgpu: boolean
			readonly native: {
				handle: Buffer | null,
				subsystem: 'x11' | 'wayland' | null,
			}

			readonly maximized: boolean
			maximize (): void

			readonly minimized: boolean
			minimize (): void

			restore (): void

			readonly focused: boolean
			focus (): void

			readonly hovered: boolean

			readonly relativeMouseMode: boolean
			setRelativeMouseMode (relative?: boolean): void
			unsetRelativeMouseMode (): void

			render (width: number, height: number, stride: number, format: Format, buffer: Buffer, options?: {
				scaling?: Scaling,
				dstRect?: {
					x: number,
					y: number,
					width: number,
					height: number,
				} | null
			}): void

			setIcon (width: number, height: number, stride: number, format: Format, buffer: Buffer): void

			flash (untilFocused?: boolean): void
			stopFlashing (): void

			readonly destroyed: boolean
			destroy (): void
			destroyGently (): void
		}

		interface Module extends EventEmitter {
			on (event: 'displayAdd', listener: (event: Events.Display.Add) => void): this
			on (event: 'displayRemove', listener: (event: Events.Display.Remove) => void): this
			on (event: 'displayOrient', listener: (event: Events.Display.Orient) => void): this
			on (event: 'displayMove', listener: (event: Events.Display.Move) => void): this
			on (event: 'displayScaleChange', listener: (event: Events.Display.Scale) => void): this
			on (event: 'displayModeChange', listener: (event: Events.Display.Mode) => void): this
			on (event: 'displayUsableChange', listener: (event: Events.Display.Usable) => void): this
			on (event: '*', listener: (type: string, event: Events.Display.Any) => void): this
			on (event: 'error', listener: (error: Error) => void): this

			readonly displays: Display[]

			readonly windows: Window[]
			readonly focused: Window | null
			readonly hovered: Window | null

			createWindow (options?: {
				title?: string
				display?: Display | null
				x?: number | null
				y?: number | null
				width?: number | null
				height?: number | null
				visible?: boolean
				fullscreen?: boolean
				resizable?: boolean
				borderless?: boolean
				alwaysOnTop?: boolean
				accelerated?: boolean
				vsync?: boolean
				opengl?: boolean
				webgpu?: boolean
			}): Window

			bytesPerPixel (format: Format): number
			isYuv (format: Format): boolean
			isPlanarYuv (format: Format): boolean
			minBufferSize (format: Format, stride: number, height: number): number
		}
	}

	export namespace Keyboard {

		export type Scancode = number

		export type ScancodeNames
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
			| 'MEDIA_NEXT_TRACK'
			| 'MEDIA_PREVIOUS_TRACK'
			| 'MEDIA_STOP'
			| 'MEDIA_PLAY'
			| 'MEDIA_SELECT'
			| 'AC_SEARCH'
			| 'AC_HOME'
			| 'AC_BACK'
			| 'AC_FORWARD'
			| 'AC_STOP'
			| 'AC_REFRESH'
			| 'AC_BOOKMARKS'
			| 'MEDIA_EJECT'
			| 'SLEEP'
			| 'WAKE'
			| 'CHANNEL_INCREMENT'
			| 'CHANNEL_DECREMENT'
			| 'MEDIA_PAUSE'
			| 'MEDIA_RECORD'
			| 'MEDIA_PLAY_PAUSE'
			| 'MEDIA_REWIND'
			| 'MEDIA_FAST_FORWARD'
			| 'AC_NEW'
			| 'AC_OPEN'
			| 'AC_CLOSE'
			| 'AC_EXIT'
			| 'AC_SAVE'
			| 'AC_PRINT'
			| 'AC_PROPERTIES'
			| 'SOFTLEFT'
			| 'SOFTRIGHT'
			| 'CALL'
			| 'ENDCALL'

		export type Key = string

		interface Module extends EventEmitter {
			readonly SCANCODE: { [name in ScancodeNames]: Scancode }

			on (event: 'keymapChange', listener: (event: Events.Keyboard.KeymapChange) => void): this
			on (event: '*', listener: (type: string, event: Events.Keyboard.Any) => void): this
			on (event: 'error', listener: (error: Error) => void): this

			getKey (scancode: Scancode): Key | null
			getScancode (key: Key): Scancode | null

			getState (): boolean[]
		}

	}

	export namespace Mouse {

		export type Button = number

		export type ButtonNames
			= 'LEFT'
			| 'MIDDLE'
			| 'RIGHT'
			| 'X1'
			| 'X2'

		export type Cursor
			= 'default'
			| 'text'
			| 'wait'
			| 'crosshair'
			| 'progress'
			| 'nwseResize'
			| 'neswResize'
			| 'ewResize'
			| 'nsResize'
			| 'move'
			| 'notAllowed'
			| 'pointer'
			| 'nwResize'
			| 'nResize'
			| 'neResize'
			| 'eResize'
			| 'seResize'
			| 'sResize'
			| 'swResize'
			| 'wResize'

		interface Module {
			readonly BUTTON: { [name in ButtonNames]: number }

			getButton (button: number): boolean

			readonly position: {
				x: number
				y: number
			}
			setPosition (x: number, y: number): void

			setCursor (cursor: Cursor): void
			resetCursor (): void
			setCursorImage (width: number, height: number, stride: number, format: Video.Format, buffer: Buffer, x: number, y: number): void

			showCursor (show?: boolean): void
			hideCursor (): void
			redrawCursor (): void

			readonly captured: boolean
			capture (capture?: boolean): void
			uncapture (): void
		}

	}

	export namespace Touch {

		export type DeviceType
			= 'direct'
			| 'indirectAbsolute'
			| 'indirectRelative'

		export interface Device {
			readonly id: bigint
			readonly name: string | null
			readonly type: DeviceType | null
		}

		interface Module {
			readonly devices: Device[]
		}

	}

	export namespace Joystick {

		export interface BallPosition {
			readonly x: number
			readonly y: number
		}

		export type JoystickType
			= 'gamepad'
			| 'wheel'
			| 'arcadeStick'
			| 'flightStick'
			| 'dancePad'
			| 'guitar'
			| 'drumKit'
			| 'arcadePad'
			| 'throttle'

		export type HatPosition
			= 'centered'
			| 'up'
			| 'right'
			| 'down'
			| 'left'
			| 'rightUp'
			| 'rightDown'
			| 'leftUp'
			| 'leftDown'

		export interface PowerInfo {
			readonly state: Sdl.Power.PowerState | null
			readonly percent: number | null
		}

		export interface Device {
			readonly id: number
			readonly name: string | null
			readonly path: string | null
			readonly type: JoystickType | null
			readonly guid: string | null
			readonly vendor: number | null
			readonly product: number | null
			readonly version: number | null
			readonly player: number | null
		}

		export class JoystickInstance extends EventEmitter {
			on (event: 'axisMotion', listener: (event: Events.Joystick.AxisMotion) => void): this
			on (event: 'ballMotion', listener: (event: Events.Joystick.BallMotion) => void): this
			on (event: 'buttonDown', listener: (event: Events.Joystick.ButtonDown) => void): this
			on (event: 'buttonUp', listener: (event: Events.Joystick.ButtonUp) => void): this
			on (event: 'hatMotion', listener: (event: Events.Joystick.HatMotion) => void): this
			on (event: 'powerUpdate', listener: (event: Events.Joystick.PowerUpdate) => void): this
			on (event: 'close', listener: (event: Events.Joystick.Close) => void): this
			on (event: '*', listener: (type: string, event: Events.Joystick.Any) => void): this
			on (event: 'error', listener: (error: Error) => void): this

			readonly device: Device
			readonly firmwareVersion: number | null
			readonly serialNumber: string | null

			readonly axes: number[]
			readonly balls: BallPosition[]
			readonly hats: HatPosition[]
			readonly buttons: boolean[]

			readonly power: PowerInfo

			setPlayer (index: number): void
			resetPlayer (): void

			readonly hasLed: boolean
			setLed (red: number, green: number, blue: number): void

			readonly hasRumble: boolean
			rumble (lowFreqRumble?: number, highFreqRumble?: number, duration?: number): void
			stopRumble (): void

			readonly hasRumbleTriggers: boolean
			rumbleTriggers (leftRumble?: number, rightRumble?: number, duration?: number): void
			stopRumbleTriggers (): void

			readonly closed: boolean
			close (): void
		}

		interface Module extends EventEmitter {
			on (event: 'deviceAdd', listener: (event: Events.JoystickDevice.Add) => void): this
			on (event: 'deviceRemove', listener: (event: Events.JoystickDevice.Remove) => void): this
			on (event: '*', listener: (type: string, event: Events.JoystickDevice.Any) => void): this
			on (event: 'error', listener: (error: Error) => void): this

			readonly devices: Device[]

			openDevice (device: Device): JoystickInstance
		}

	}

	export namespace Gamepad {

		export type GamepadType
			= 'standard'
			| 'xbox360'
			| 'xboxOne'
			| 'ps3'
			| 'ps4'
			| 'ps5'
			| 'nintendoSwitchPro'
			| 'nintendoSwitchJoyconLeft'
			| 'nintendoSwitchJoyconRight'
			| 'nintendoSwitchJoyconPair'
			| 'gamecube'

		export type Axis
			= 'leftStickX'
			| 'leftStickY'
			| 'rightStickX'
			| 'rightStickY'
			| 'leftTrigger'
			| 'rightTrigger'

		export type Button
			= 'dpadLeft'
			| 'dpadRight'
			| 'dpadUp'
			| 'dpadDown'
			| 'south'
			| 'east'
			| 'west'
			| 'north'
			| 'guide'
			| 'back'
			| 'start'
			| 'leftStick'
			| 'rightStick'
			| 'leftShoulder'
			| 'rightShoulder'
			| 'rightPaddle1'
			| 'leftPaddle1'
			| 'rightPaddle2'
			| 'leftPaddle2'
			| 'misc1'
			| 'misc2'
			| 'misc3'
			| 'misc4'
			| 'misc5'
			| 'misc6'
			| 'touchpad'

		export type ButtonLabel
			= 'a'
			| 'b'
			| 'x'
			| 'y'
			| 'cross'
			| 'circle'
			| 'square'
			| 'triangle'

		export interface Device {
			readonly id: number
			readonly name: string | null
			readonly path: string | null
			readonly type: GamepadType | null
			readonly guid: string | null
			readonly vendor: number | null
			readonly product: number | null
			readonly version: number | null
			readonly player: number | null
			readonly mapping: string | null
		}

		export class GamepadInstance extends EventEmitter {
			on (event: 'axisMotion', listener: (event: Events.Gamepad.AxisMotion) => void): this
			on (event: 'buttonDown', listener: (event: Events.Gamepad.ButtonDown) => void): this
			on (event: 'buttonUp', listener: (event: Events.Gamepad.ButtonUp) => void): this
			on (event: 'powerUpdate', listener: (event: Events.Gamepad.PowerUpdate) => void): this
			on (event: 'steamHandleUpdate', listener: (event: Events.Gamepad.SteamHandleUpdate) => void): this
			on (event: 'remap', listener: (event: Events.Gamepad.Remap) => void): this
			on (event: 'close', listener: (event: Events.Gamepad.Close) => void): this
			on (event: '*', listener: (type: string, event: Events.Gamepad.Any) => void): this
			on (event: 'error', listener: (error: Error) => void): this

			readonly device: Device
			readonly firmwareVersion: number | null
			readonly serialNumber: string | null
			readonly steamHandle: Buffer | null

			readonly axes: { readonly [axis in Axis]: number }
			readonly buttons: { readonly [button in Button]: boolean }
			readonly buttonLabels: {
				readonly south: ButtonLabel | null
				readonly east: ButtonLabel | null
				readonly west: ButtonLabel | null
				readonly north: ButtonLabel | null
			}

			readonly power: Joystick.PowerInfo

			setPlayer (index: number): void
			resetPlayer (): void

			readonly hasLed: boolean
			setLed (red: number, green: number, blue: number): void

			readonly hasRumble: boolean
			rumble (lowFreqRumble?: number, highFreqRumble?: number, duration?: number): void
			stopRumble (): void

			readonly hasRumbleTriggers: boolean
			rumbleTriggers (leftRumble?: number, rightRumble?: number, duration?: number): void
			stopRumbleTriggers (): void

			readonly closed: boolean
			close (): void
		}

		interface Module extends EventEmitter {
			on (event: 'deviceAdd', listener: (event: Events.GamepadDevice.Add) => void): this
			on (event: 'deviceRemove', listener: (event: Events.GamepadDevice.Remove) => void): this
			on (event: '*', listener: (type: string, event: Events.GamepadDevice.Any) => void): this
			on (event: 'error', listener: (error: Error) => void): this

			addMappings (mappings: string[]): void

			readonly devices: Device[]

			openDevice (device: Device): GamepadInstance
		}

	}

	export namespace Sensor {

		export type Type
			= 'accelerometer'
			| 'gyroscope'

		export type Side
			= 'left'
			| 'right'

		export interface Device {
			readonly id: number
			readonly name: string | null
			readonly type: Type | null
			readonly side: Side | null
		}

		export interface Data {
			readonly x: number
			readonly y: number
			readonly z: number
		}

		export class SensorInstance extends EventEmitter {
			on (event: 'update', listener: (event: Events.Sensor.Update) => void): this
			on (event: 'close', listener: (event: Events.Sensor.Close) => void): this
			on (event: '*', listener: (type: string, event: Events.Sensor.Any) => void): this
			on (event: 'error', listener: (error: Error) => void): this

			readonly device: Device

			readonly data: Data

			readonly closed: boolean
			close (): void
		}

		interface Module {
			readonly STANDARD_GRAVITY: 9.80665

			readonly devices: Device[]

			openDevice (device: Device): SensorInstance
		}

	}

	export namespace Audio {

		export type Format
			= 's8'
			| 'u8'
			| 's16le'
			| 's16be'
			| 's16'
			| 's32le'
			| 's32be'
			| 's32'
			| 'f32le'
			| 'f32be'
			| 'f32'

		export interface Device {
			readonly id: number | null
			readonly name: string | null
			readonly format: Format | null
			readonly channels: number | null
			readonly frequency: number | null
			readonly buffered: number | null
		}

		export interface StreamOptions {
			readonly channels?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
			readonly frequency?: number
			readonly format?: Format
			readonly buffered?: number
		}

		export class AudioStream extends EventEmitter {
			on (event: 'close', listener: (event: Events.Audio.Close) => void): this
			on (event: '*', listener: (type: string, event: Events.Audio.Any) => void): this
			on (event: 'error', listener: (error: Error) => void): this

			readonly id: number
			readonly device: Device

			readonly channels: number
			readonly frequency: number
			readonly format: Format

			readonly playing: boolean
			play (play?: boolean): void
			pause (): void

			clear (): void

			readonly bytesPerSample: number
			readonly minSampleValue: number
			readonly maxSampleValue: number
			readonly zeroSampleValue: number
			readSample (buffer: Buffer, offset?: number): number
			writeSample (buffer: Buffer, value: number, offset?: number): number

			readonly closed: boolean
			close (): void
		}

		export class AudioPlaybackStream extends AudioStream {
			readonly queued: number
			putData (buffer: Buffer, bytes?: number): void
		}

		export class AudioRecordingStream extends AudioStream {
			readonly available: number
			getData (buffer: Buffer, bytes?: number): number
		}

		interface DeviceModule<Stream extends AudioStream> extends EventEmitter {
			on (event: 'deviceAdd', listener: (event: Events.AudioDevice.Add) => void): this
			on (event: 'deviceRemove', listener: (event: Events.AudioDevice.Remove) => void): this
			on (event: '*', listener: (type: string, event: Events.AudioDevice.Any) => void): this
			on (event: 'error', listener: (error: Error) => void): this

			readonly devices: Device[]

			openDevice (device?: Device | null, options?: StreamOptions): Stream
		}

		interface Module {
			readonly playback: DeviceModule<AudioPlaybackStream>
			readonly recording: DeviceModule<AudioRecordingStream>

			bytesPerSample (format: Format): number
			minSampleValue (format: Format): number
			maxSampleValue (format: Format): number
			zeroSampleValue (format: Format): number
			readSample (format: Format, buffer: Buffer, offset?: number): number
			writeSample (format: Format, buffer: Buffer, value: number, offset?: number): number
		}
	}

	export namespace Clipboard {

		interface Module extends EventEmitter {
			on (event: 'update', listener: (event: Events.Clipboard.Update) => void): this
			on (event: '*', listener: (type: string, event: Events.Clipboard.Any) => void): this
			on (event: 'error', listener: (error: Error) => void): this

			readonly text: string
			setText (text: string): void
		}

	}

	export namespace Power {

		export type PowerState
			= 'noBattery'
			| 'battery'
			| 'charging'
			| 'charged'

		export interface PowerInfo {
			readonly state: PowerState | null
			readonly seconds: number | null
			readonly percent: number | null
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
export const touch: Sdl.Touch.Module
export const joystick: Sdl.Joystick.Module
export const gamepad: Sdl.Gamepad.Module
export const sensor: Sdl.Sensor.Module
export const audio: Sdl.Audio.Module
export const clipboard: Sdl.Clipboard.Module
export const power: Sdl.Power.Module
