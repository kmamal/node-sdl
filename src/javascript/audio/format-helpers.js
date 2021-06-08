const { enums } = require('../enums')
const Os = require('os')

const audio_format_helpers = {
	[enums.audio_format.S8]: {
		bytes_per_sample: 1,
		reader: Buffer.prototype.readInt8,
		writer: Buffer.prototype.writeInt8,
	},
	[enums.audio_format.U8]: {
		bytes_per_sample: 1,
		reader: Buffer.prototype.readUInt8,
		writer: Buffer.prototype.writeUInt8,
	},
	[enums.audio_format.S16LSB]: {
		bytes_per_sample: 2,
		reader: Buffer.prototype.readInt16LE,
		writer: Buffer.prototype.writeInt16LE,
	},
	[enums.audio_format.S16MSB]: {
		bytes_per_sample: 2,
		reader: Buffer.prototype.readInt16BE,
		writer: Buffer.prototype.writeInt16BE,
	},
	[enums.audio_format.S16]: {
		bytes_per_sample: 2,
		reader: Buffer.prototype.readInt16LE,
		writer: Buffer.prototype.writeInt16LE,
	},
	[enums.audio_format.U16LSB]: {
		bytes_per_sample: 2,
		reader: Buffer.prototype.readUInt16LE,
		writer: Buffer.prototype.writeUInt16LE,
	},
	[enums.audio_format.U16MSB]: {
		bytes_per_sample: 2,
		reader: Buffer.prototype.readUInt16BE,
		writer: Buffer.prototype.writeUInt16BE,
	},
	[enums.audio_format.U16]: {
		bytes_per_sample: 2,
		reader: Buffer.prototype.readUInt32LE,
		writer: Buffer.prototype.writeUInt32LE,
	},
	[enums.audio_format.S32LSB]: {
		bytes_per_sample: 4,
		reader: Buffer.prototype.readInt32LE,
		writer: Buffer.prototype.writeInt32LE,
	},
	[enums.audio_format.S32MSB]: {
		bytes_per_sample: 4,
		reader: Buffer.prototype.readInt32BE,
		writer: Buffer.prototype.writeInt32BE,
	},
	[enums.audio_format.S32]: {
		bytes_per_sample: 4,
		reader: Buffer.prototype.readInt32LE,
		writer: Buffer.prototype.writeInt32LE,
	},
	[enums.audio_format.F32LSB]: {
		bytes_per_sample: 4,
		reader: Buffer.prototype.readFloatLE,
		writer: Buffer.prototype.writeFloatLE,
	},
	[enums.audio_format.F32MSB]: {
		bytes_per_sample: 4,
		reader: Buffer.prototype.readFloatBE,
		writer: Buffer.prototype.writeFloatBE,
	},
	[enums.audio_format.F32]: {
		bytes_per_sample: 4,
		reader: Buffer.prototype.readFloatLE,
		writer: Buffer.prototype.writeFloatLE,
	},
}

if (Os.endianness() === 'LE') {
	audio_format_helpers[enums.audio_format.S16SYS] = audio_format_helpers[enums.audio_format.S16LSB]
	audio_format_helpers[enums.audio_format.U16SYS] = audio_format_helpers[enums.audio_format.U16LSB]
	audio_format_helpers[enums.audio_format.S32SYS] = audio_format_helpers[enums.audio_format.S32LSB]
	audio_format_helpers[enums.audio_format.F32SYS] = audio_format_helpers[enums.audio_format.F32LSB]
} else {
	audio_format_helpers[enums.audio_format.S16SYS] = audio_format_helpers[enums.audio_format.S16MSB]
	audio_format_helpers[enums.audio_format.U16SYS] = audio_format_helpers[enums.audio_format.U16MSB]
	audio_format_helpers[enums.audio_format.S32SYS] = audio_format_helpers[enums.audio_format.S32MSB]
	audio_format_helpers[enums.audio_format.F32SYS] = audio_format_helpers[enums.audio_format.F32MSB]
}

module.exports = { audio_format_helpers }
