import ffmpeg from 'ffmpeg-static'
import { spawn } from 'node:child_process'
import path from 'node:path'

export const loadAudio = async (filepath, { channels, frequency }) => {
	const proc = spawn(
		ffmpeg,
		[
			[ '-i', path.relative(process.cwd(), filepath).replaceAll(path.sep, path.posix.sep) ],
			channels && [ '-ac', channels ],
			frequency && [ '-ar', frequency ],
			[ '-f', 'f32le' ],
			[ '-c:a', 'pcm_f32le' ],
			'-',
		].flat(),
	)

	const chunks = []
	proc.stdout.on('data', (chunk) => {
		chunks.push(chunk)
	})

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
				: resolve(Buffer.concat(chunks))
		})
	})
}
