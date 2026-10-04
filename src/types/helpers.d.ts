
import type { Sdl } from './index'

export namespace SdlHelpers {

	export namespace Video {

		export type Format = Sdl.Video.Format | Sdl.Video.FormatAlias

		interface Module {
			bytesPerPixel (format: Format): number
			isYuv (format: Format): boolean
			isPlanarYuv (format: Format): boolean
			minStride (format: Format, width: number): number
			minBufferSize (format: Format, stride: number, height: number): number
		}

	}

	export namespace Keyboard {

		interface Module {
			readonly SCANCODE: { [name in Sdl.Keyboard.ScancodeNames]: Sdl.Keyboard.Scancode }
		}

	}

	export namespace Mouse {

		interface Module {
			readonly BUTTON: { [name in Sdl.Mouse.ButtonNames]: Sdl.Mouse.Button }
		}

	}

	export namespace Sensor {

		interface Module {
			readonly STANDARD_GRAVITY: 9.80665
		}

	}

	export namespace Audio {

		export type Format = Sdl.Audio.Format | Sdl.Audio.FormatAlias

		interface Module {
			bytesPerSample (format: Format): number
			minSampleValue (format: Format): number
			maxSampleValue (format: Format): number
			zeroSampleValue (format: Format): number
			readSample (format: Format, buffer: Buffer, offset?: number): number
			writeSample (format: Format, buffer: Buffer, value: number, offset?: number): number
		}

	}

}

export const video: SdlHelpers.Video.Module
export const keyboard: SdlHelpers.Keyboard.Module
export const mouse: SdlHelpers.Mouse.Module
export const sensor: SdlHelpers.Sensor.Module
export const audio: SdlHelpers.Audio.Module
