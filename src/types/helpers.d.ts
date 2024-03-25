
export namespace SdlHelpers {

	export namespace Audio {

		export type Format
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

export const audio: SdlHelpers.Audio.Module
