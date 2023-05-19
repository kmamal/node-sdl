import ffmpeg from 'ffmpeg-static'
import { spawn } from 'child_process'

export const loadAudio = async (path, { channels, frequency }) => {
	const proc = spawn(
		ffmpeg,
		[
			[ '-i', path ],
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

	return await new Promise((resolve, reject) => {
		proc.on('close', (code) => {
			code
				? reject(new Error(`exit code ${code}`))
				: resolve(Buffer.concat(chunks))
		})
	})
}
