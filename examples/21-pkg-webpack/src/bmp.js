import bmp from 'bmp-js'
import fs from 'node:fs'

export const loadBmp = async (filePath) => {
	const bmpBuffer = await fs.promises.readFile(filePath)
	return bmp.decode(bmpBuffer)
}
