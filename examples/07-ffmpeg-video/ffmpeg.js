import ffmpeg from 'ffmpeg-static'
import { spawn } from 'node:child_process'
import path from 'node:path'

export const loadImage = async (filepath, options) => (await loadVideo(filepath, options))[0]

export const loadVideo = async (filepath, { width, height, framerate }) => {
	const proc = spawn(
		ffmpeg,
		[
			[ '-i', path.relative(process.cwd(), filepath).replaceAll(path.sep, path.posix.sep) ],
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

	const stderrChunks = []
	proc.stderr.on('data', (chunk) => {
		stderrChunks.push(chunk.toString())
	})

	return await new Promise((resolve, reject) => {
		proc.on('close', (code) => {
			code
				? reject(Object.assign(new Error(`exit code ${code}`), {
					stderr: stderrChunks.join(''),
				}))
				: resolve(frames)
		})
	})
}
