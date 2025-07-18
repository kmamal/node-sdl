import path from 'node:path'

export default {
	mode: 'development',
	entry: './src/index.js',
	output: {
		path: path.join(import.meta.dirname, 'build'),
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
