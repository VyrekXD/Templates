//Copied from https://github.com/AndreMor8/gidget/blob/master/src/utils/commons.js
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

interface Commons {
	require: NodeRequire
	__filename: string
	__dirname: string
}

export default function (metaURL: string = import.meta.url): Commons {
	const require = createRequire(metaURL)
	const __filename = fileURLToPath(metaURL)
	const __dirname = dirname(__filename)
	return { require, __filename, __dirname }
}
