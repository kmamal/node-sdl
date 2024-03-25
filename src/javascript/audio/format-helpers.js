const Os = require('os')

const signedLimits = (bits) => ({
	bytesPerSample: bits / 8,
	minSampleValue: -(2 ** (bits - 1)),
	zeroSampleValue: 0,
	maxSampleValue: (2 ** (bits - 1)) - 1,
})

const unsignedLimits = (bits) => ({
	bytesPerSample: bits / 8,
	minSampleValue: 0,
	zeroSampleValue: (2 ** (bits - 1)) - 1,
	maxSampleValue: (2 ** bits) - 1,
})

const floatLimits = {
	bytesPerSample: 4,
	minSampleValue: -1,
	zeroSampleValue: 0,
	maxSampleValue: 1,
}

const AudioFormatHelpers = {
	s8: {
		reader: Buffer.prototype.readInt8,
		writer: Buffer.prototype.writeInt8,
		...signedLimits(8),
	},
	u8: {
		reader: Buffer.prototype.readUInt8,
		writer: Buffer.prototype.writeUInt8,
		...unsignedLimits(8),
	},
	s16lsb: {
		reader: Buffer.prototype.readInt16LE,
		writer: Buffer.prototype.writeInt16LE,
		...signedLimits(16),
	},
	s16msb: {
		reader: Buffer.prototype.readInt16BE,
		writer: Buffer.prototype.writeInt16BE,
		...signedLimits(16),
	},
	u16lsb: {
		reader: Buffer.prototype.readUInt16LE,
		writer: Buffer.prototype.writeUInt16LE,
		...unsignedLimits(16),
	},
	u16msb: {
		reader: Buffer.prototype.readUInt16BE,
		writer: Buffer.prototype.writeUInt16BE,
		...unsignedLimits(16),
	},
	s32lsb: {
		reader: Buffer.prototype.readInt32LE,
		writer: Buffer.prototype.writeInt32LE,
		...signedLimits(32),
	},
	s32msb: {
		reader: Buffer.prototype.readInt32BE,
		writer: Buffer.prototype.writeInt32BE,
		...signedLimits(32),
	},
	f32lsb: {
		reader: Buffer.prototype.readFloatLE,
		writer: Buffer.prototype.writeFloatLE,
		...floatLimits,
	},
	f32msb: {
		reader: Buffer.prototype.readFloatBE,
		writer: Buffer.prototype.writeFloatBE,
		...floatLimits,
	},
}

AudioFormatHelpers.s16 = AudioFormatHelpers.s16lsb
AudioFormatHelpers.u16 = AudioFormatHelpers.u16lsb
AudioFormatHelpers.s32 = AudioFormatHelpers.s32lsb
AudioFormatHelpers.f32 = AudioFormatHelpers.f32lsb

if (Os.endianness() === 'LE') {
	AudioFormatHelpers.s16sys = AudioFormatHelpers.s16lsb
	AudioFormatHelpers.u16sys = AudioFormatHelpers.u16lsb
	AudioFormatHelpers.s32sys = AudioFormatHelpers.s32lsb
	AudioFormatHelpers.f32sys = AudioFormatHelpers.f32lsb
} else {
	AudioFormatHelpers.s16sys = AudioFormatHelpers.s16msb
	AudioFormatHelpers.u16sys = AudioFormatHelpers.u16msb
	AudioFormatHelpers.s32sys = AudioFormatHelpers.s32msb
	AudioFormatHelpers.f32sys = AudioFormatHelpers.f32msb
}

module.exports = { AudioFormatHelpers }
