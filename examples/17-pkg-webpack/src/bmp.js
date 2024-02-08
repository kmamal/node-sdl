import bmp from 'bmp-js'
import fs from 'fs'

export const loadBmp = async (filePath) => {
	const bmpBuffer = await fs.promises.readFile(filePath)
	return bmp.decode(bmpBuffer)
}
