//https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/util/Util.js
/**
 * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
 * @param {string} text Content to split
 * @param {SplitOptions} [options] Options controlling the behavior of the split
 * @returns {string[]}
 */
export function splitMessage(
	text: string,
	{ maxLength = 2_000, char = '\n', prepend = '', append = '' } = {}
) {
	text = verifyString(text)
	if (text.length <= maxLength) return [text]
	let splitText: any = [text]
	if (Array.isArray(char)) {
		while (
			char.length > 0 &&
			splitText.some((elem: any) => elem.length > maxLength)
		) {
			const currentChar = char.shift()
			if (currentChar instanceof RegExp) {
				splitText = splitText.flatMap((chunk: any) =>
					chunk.match(currentChar)
				)
			} else {
				splitText = splitText.flatMap((chunk: any) =>
					chunk.split(currentChar)
				)
			}
		}
	} else {
		splitText = text.split(char)
	}
	if (splitText.some((elem: any) => elem.length > maxLength))
		throw new Error('Max length')
	const messages = []
	let msg = ''
	for (const chunk of splitText) {
		if (msg && (msg + char + chunk + append).length > maxLength) {
			messages.push(msg + append)
			msg = prepend
		}
		msg += (msg && msg !== prepend ? char : '') + chunk
	}
	return messages.concat(msg).filter((m) => m)
}

/**
 * The content to put in a code block with all code block fences replaced by the equivalent backticks.
 * @param {string} text The string to be converted
 * @returns {string}
 */
export function cleanCodeBlockContent(text: string) {
	return text.replaceAll('```', '`\u200b``')
}

/**
 * Verifies the provided data is a string, otherwise throws provided error.
 * @param {string} data The string resolvable to resolve
 * @param {Function} [error] The Error constructor to instantiate. Defaults to Error
 * @param {string} [errorMessage] The error message to throw with. Defaults to "Expected string, got <data> instead."
 * @param {boolean} [allowEmpty=true] Whether an empty string should be allowed
 * @returns {string}
 */
export function verifyString(
	data: string,
	error = Error,
	errorMessage = `Expected a string, got ${data} instead.`,
	allowEmpty = true
) {
	if (typeof data !== 'string') throw new error(errorMessage)
	if (!allowEmpty && data.length === 0) throw new error(errorMessage)
	return data
}
