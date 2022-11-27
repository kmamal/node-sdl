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
		readerName: 'readInt8',
		writerName: 'writeInt8',
		...signedLimits(8),
	},
	u8: {
		readerName: 'readUInt8',
		writerName: 'writeUInt8',
		...unsignedLimits(8),
	},
	s16lsb: {
		readerName: 'readInt16LE',
		writerName: 'writeInt16LE',
		...signedLimits(16),
	},
	s16msb: {
		readerName: 'readInt16BE',
		writerName: 'writeInt16BE',
		...signedLimits(16),
	},
	u16lsb: {
		readerName: 'readUInt16LE',
		writerName: 'writeUInt16LE',
		...unsignedLimits(16),
	},
	u16msb: {
		readerName: 'readUInt16BE',
		writerName: 'writeUInt16BE',
		...unsignedLimits(16),
	},
	s32lsb: {
		readerName: 'readInt32LE',
		writerName: 'writeInt32LE',
		...signedLimits(32),
	},
	s32msb: {
		readerName: 'readInt32BE',
		writerName: 'writeInt32BE',
		...signedLimits(32),
	},
	f32lsb: {
		readerName: 'readFloatLE',
		writerName: 'writeFloatLE',
		...floatLimits,
	},
	f32msb: {
		readerName: 'readFloatBE',
		writerName: 'writeFloatBE',
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

for (const helper of Object.values(AudioFormatHelpers)) {
	helper.reader = Buffer.prototype[helper.readerName]
	helper.writer = Buffer.prototype[helper.writerName]
}

module.exports = { AudioFormatHelpers }
