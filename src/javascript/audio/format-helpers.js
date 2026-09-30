const Os = require('node:os')

const signedLimits = (bits) => ({
	bytesPerSample: bits / 8,
	minSampleValue: -(2 ** (bits - 1)),
	zeroSampleValue: 0,
	maxSampleValue: (2 ** (bits - 1)) - 1,
})

const unsignedLimits = (bits) => ({
	bytesPerSample: bits / 8,
	minSampleValue: 0,
	zeroSampleValue: 2 ** (bits - 1),
	maxSampleValue: (2 ** bits) - 1,
})

const floatLimits = {
	bytesPerSample: 4,
	minSampleValue: -1,
	zeroSampleValue: 0,
	maxSampleValue: 1,
}

const AudioFormatHelpers = Object.assign(Object.create(null), {
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
	s16le: {
		reader: Buffer.prototype.readInt16LE,
		writer: Buffer.prototype.writeInt16LE,
		...signedLimits(16),
	},
	s16be: {
		reader: Buffer.prototype.readInt16BE,
		writer: Buffer.prototype.writeInt16BE,
		...signedLimits(16),
	},
	s32le: {
		reader: Buffer.prototype.readInt32LE,
		writer: Buffer.prototype.writeInt32LE,
		...signedLimits(32),
	},
	s32be: {
		reader: Buffer.prototype.readInt32BE,
		writer: Buffer.prototype.writeInt32BE,
		...signedLimits(32),
	},
	f32le: {
		reader: Buffer.prototype.readFloatLE,
		writer: Buffer.prototype.writeFloatLE,
		...floatLimits,
	},
	f32be: {
		reader: Buffer.prototype.readFloatBE,
		writer: Buffer.prototype.writeFloatBE,
		...floatLimits,
	},
})

if (Os.endianness() === 'LE') {
	AudioFormatHelpers.s16 = AudioFormatHelpers.s16le
	AudioFormatHelpers.s32 = AudioFormatHelpers.s32le
	AudioFormatHelpers.f32 = AudioFormatHelpers.f32le
}
else {
	AudioFormatHelpers.s16 = AudioFormatHelpers.s16be
	AudioFormatHelpers.s32 = AudioFormatHelpers.s32be
	AudioFormatHelpers.f32 = AudioFormatHelpers.f32be
}

const getFormatHelpers = (format) => {
	if (typeof format !== 'string') { throw Object.assign(new Error("format must be a string"), { format }) }
	const helpers = AudioFormatHelpers[format]
	if (helpers === undefined) { throw Object.assign(new Error("invalid format"), { format }) }
	return helpers
}

module.exports = { AudioFormatHelpers, getFormatHelpers }
