import ffmpeg from 'ffmpeg-static'
import { spawn } from 'child_process'

export const loadImage = async (path, options) => (await loadVideo(path, options))[0]

export const loadVideo = async (path, { width, height, framerate }) => {
	const proc = spawn(
		ffmpeg,
		[
			[ '-i', path ],
			'-filter:v',
			[
				framerate && `fps=fps=${framerate}`,
				`scale=${width}:${height}`,
				'format=pix_fmts=rgb24',
			].filter(Boolean).join(','),
			[ '-f', 'rawvideo' ],
			'-',
		].flat(),
	)

	const frameSize = width * height * 3
	const frames = []
	let chunks = []
	let size = 0

	const append = (data) => {
		const end = frameSize - size
		const chunk = data.slice(0, end)
		chunks.push(chunk)
		size += chunk.length

		if (size === frameSize) {
			frames.push(Buffer.concat(chunks))
			chunks = []
			size = 0
			append(data.slice(end))
		}
	}

	proc.stdout.on('data', append)

	return await new Promise((resolve, reject) => {
		proc.on('close', (code) => {
			code
				? reject(new Error(`exit code ${code}`))
				: resolve(frames)
		})
	})
}
