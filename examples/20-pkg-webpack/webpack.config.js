import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export default {
	mode: 'development',
	entry: './src/index.js',
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'index.js',
	},
	target: 'node',
	externals: [
		({ request }, callback) => {
			if (request.endsWith('/sdl.node')) {
				return callback(null, `commonjs ./sdl.node`)
			}

			callback()
		},
	],
}
